/**
 * Prerender the static routes to real HTML files after `vite build`.
 *
 * Why: index.html ships a 50-character <noscript> line and an empty
 * #root, so anything that does not execute JavaScript sees no content.
 * GPTBot, ClaudeBot and PerplexityBot do not run JS, and robots.txt
 * explicitly invites all three. Googlebot does render, but it renders on a
 * second pass and reads the first response's canonical and meta tags, which
 * is why sub-pages reported "User canonical: None" in Search Console.
 *
 * How: serve dist/ over a local port, drive a headless Chromium to each
 * route, and write the settled DOM to dist/<route>/index.html. Asset URLs are
 * absolute ("/assets/..."), so they resolve from any directory depth.
 *
 * react-helmet-async marks the tags it owns with data-rh="true". Those
 * attributes survive into the captured HTML, so on the next page load Helmet
 * recognises and replaces them instead of appending duplicates. That only
 * holds for tags Helmet itself wrote: the static ones in index.html carry no
 * data-rh, so Helmet appends alongside them and the capture ends up with two
 * of each. A dedupe pass below drops the static copy once Helmet has supplied
 * a page-specific one.
 *
 * The app mounts with createRoot, not hydrateRoot, so React discards the
 * prerendered DOM and re-renders once the bundle arrives. Crawlers and the
 * first paint both get real content; moving to hydrateRoot would also let
 * React adopt that DOM, but it needs its own testing pass.
 *
 * Routes whose content comes from the API (the blog index, articles) render
 * nearly empty here because no backend is running at build time. Writing
 * those would publish thin pages, so any route under MIN_TEXT characters is
 * skipped and keeps the normal SPA fallback.
 */

import { createServer } from 'node:http';
import { gzipSync, brotliCompressSync, constants as zlibConstants } from 'node:zlib';
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { chromium } from 'playwright';
import { getPrerenderRoutes } from '../src/constants/sitemapRoutes.js';

// BUILD_OUT_DIR lets build:prod assemble everything in a staging directory and
// swap it into place at the end — see scripts/swap-dist.mjs for why.
const DIST = join(process.cwd(), process.env.BUILD_OUT_DIR || 'dist');
const PORT = 4178;
// Visible text a route must produce to be worth writing. The lowest genuine
// page is /faq at ~1700; a blog index that rendered no posts sits near 1050,
// so this floor keeps real pages and drops data-starved ones.
const MIN_TEXT = 1500;
const NAV_TIMEOUT = 45000;
// react-helmet-async commits its head tags after the render that mounts them,
// which can land after networkidle. Capturing early cost the homepage its
// canonical on the first run, so wait for Helmet to have written one.
const HELMET_TIMEOUT = 15000;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.ico': 'image/x-icon', '.txt': 'text/plain',
  '.xml': 'application/xml', '.woff2': 'font/woff2', '.woff': 'font/woff',
};

function serveDist() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(req.url.split('?')[0]);
    let file = join(DIST, path);
    const hasExt = extname(path) !== '';
    if (!hasExt || !existsSync(file) || !statSync(file).isFile()) {
      if (hasExt) { res.writeHead(404); return res.end(); }
      file = join(DIST, 'index.html');
    }
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

/**
 * Analytics and tag-manager hosts, blocked for the duration of the prerender.
 *
 * Two reasons. They inject extra <script> elements into the live DOM, and
 * document.documentElement.outerHTML captures those, so the written file ships
 * tags the shell never had; re-executing them on a real page load throws
 * ("a.__fbeventsModules[e] is not a function"). And letting them run would
 * fire a GA4 and Meta pageview for all 50 routes on every single build,
 * manufacturing traffic that never happened.
 */
const BLOCKED_HOSTS = [
  'googletagmanager.com', 'google-analytics.com', 'analytics.google.com',
  'connect.facebook.net', 'facebook.com', 'facebook.net',
  'doubleclick.net', 'clarity.ms', 'hotjar.com', 'hotjar.io',
];

/**
 * The scripts the built shell actually ships. copy-404 runs before this
 * script, so dist/404.html is the untouched shell; fall back to index.html on
 * a first run where it does not exist yet.
 */
function readShellScripts() {
  const path = ['404.html', 'index.html'].map((f) => join(DIST, f)).find((f) => existsSync(f));
  const shell = readFileSync(path, 'utf8');
  return {
    srcs: [...shell.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]),
    inline: [...shell.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)]
      .map((m) => m[1].trim()),
  };
}

const shellScripts = readShellScripts();
// Not the sitemap set -- see getPrerenderRoutes(). Noindex pages still have to
// be served as real HTML, or nginx's try_files turns them into 404s.
const routes = getPrerenderRoutes();
const server = await serveDist();
const browser = await chromium.launch();
const page = await browser.newPage();

await page.route('**/*', (route) => {
  const host = new URL(route.request().url()).hostname;
  return BLOCKED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))
    ? route.abort()
    : route.continue();
});

const written = [];
const skipped = [];
const failed = [];
/**
 * Replace `<link rel="stylesheet" href="/assets/*.css">` with the stylesheet's
 * contents in a `<style>` tag.
 *
 * Reads each file once and caches it. Returns the html unchanged, and records a
 * miss, if the link or the file is not found — a silent no-op here would mean
 * shipping a page with no styles at all, so the build reports it.
 */
const cssCache = new Map();
const inlineMisses = [];
let inlinedCount = 0;

function inlineStylesheet(html, route) {
  const rx = /<link[^>]*rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/g;
  let touched = false;
  const out = html.replace(rx, (tag, href) => {
    if (!cssCache.has(href)) {
      const file = join(DIST, href.replace(/^\//, ''));
      if (!existsSync(file)) { inlineMisses.push([route, `missing ${href}`]); return tag; }
      cssCache.set(href, readFileSync(file, 'utf8'));
    }
    touched = true;
    // </style> cannot appear inside a style element; Tailwind output never
    // contains it, but escape defensively rather than produce broken markup.
    const css = cssCache.get(href).replace(/<\/style/gi, '<\\/style');
    return `<style data-inlined-from="${href}">${css}</style>`;
  });
  // Count pages that END UP with the stylesheet inlined, not just the ones this
  // call rewrote. Route `/` is processed first and its output overwrites
  // dist/index.html; every later route is then served that already-inlined file
  // as the SPA shell, so only one route actually has a <link> to replace. A
  // counter that reported "1 page" while all 51 were correct would be exactly
  // the kind of misleading build log that hides a real failure.
  if (out.includes('data-inlined-from=')) {
    inlinedCount++;
  } else if (!touched) {
    // Genuinely no stylesheet, inlined or linked — this page would ship
    // unstyled, so say so loudly.
    inlineMisses.push([route, 'no stylesheet link found and none already inlined']);
  }
  // Already inlined and no link left: this route was re-processed (the canonical
  // guard above can retry one), which is a no-op rather than a problem.
  return out;
}

const dedupedTags = [];
const fontResets = [];
const markdownWritten = [];

/**
 * Serialise a rendered route's main content as Markdown.
 *
 * Runs in the page so it can read the settled DOM. Deliberately narrow: it
 * walks block-level elements in document order and emits headings, paragraphs,
 * lists, tables and links. Navigation, header, footer and anything
 * aria-hidden is skipped, because repeating the nav on all 54 files would be
 * most of the bytes and none of the value.
 */
async function extractMarkdown(page, route) {
  const body = await page.evaluate(() => {
    const SKIP = new Set(['NAV', 'HEADER', 'FOOTER', 'SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'BUTTON', 'FORM']);
    const root = document.getElementById('root');
    if (!root) return '';

    const inline = (el) => {
      let s = '';
      for (const n of el.childNodes) {
        if (n.nodeType === 3) s += n.textContent.replace(/\s+/g, ' ');
        else if (n.nodeType === 1) {
          if (SKIP.has(n.tagName) || n.getAttribute('aria-hidden') === 'true') continue;
          const t = inline(n).trim();
          if (!t) continue;
          if (n.tagName === 'A' && n.getAttribute('href')) {
            const href = n.getAttribute('href');
            s += href.startsWith('#') ? t : `[${t}](${href.startsWith('/') ? 'https://napnix.in' + href : href})`;
          } else if (n.tagName === 'STRONG' || n.tagName === 'B') s += `**${t}**`;
          else if (n.tagName === 'EM' || n.tagName === 'I') s += `_${t}_`;
          else if (n.tagName === 'CODE') s += `\`${t}\``;
          else s += t;
          s += ' ';
        }
      }
      return s.replace(/\s+/g, ' ');
    };

    const out = [];
    const seen = new Set();
    const walk = (el) => {
      for (const child of el.children) {
        if (SKIP.has(child.tagName) || child.getAttribute('aria-hidden') === 'true') continue;
        const tag = child.tagName;
        if (/^H[1-4]$/.test(tag)) {
          const t = inline(child).trim();
          // +1 so the page's own <h1> becomes "##": the document already opens
          // with an H1 built from the page title, and two H1s in one Markdown
          // file is ambiguous for anything parsing the structure.
          if (t && !seen.has('h:' + t)) { seen.add('h:' + t); out.push('#'.repeat(Math.min(6, +tag[1] + 1)) + ' ' + t); }
        } else if (tag === 'P') {
          const t = inline(child).trim();
          if (t.length > 1 && !seen.has('p:' + t)) { seen.add('p:' + t); out.push(t); }
        } else if (tag === 'UL' || tag === 'OL') {
          const items = [...child.children]
            .filter((li) => li.tagName === 'LI')
            .map((li, i) => (tag === 'OL' ? `${i + 1}. ` : '- ') + inline(li).trim())
            .filter((l) => l.length > 3);
          if (items.length) out.push(items.join('\n'));
        } else if (tag === 'TABLE') {
          const rows = [...child.querySelectorAll('tr')].map((tr) =>
            [...tr.children].map((c) => inline(c).trim().replace(/\|/g, '\\|')));
          if (rows.length > 1) {
            const head = rows[0];
            out.push(
              '| ' + head.join(' | ') + ' |\n|' + head.map(() => '---').join('|') + '|\n'
              + rows.slice(1).map((r) => '| ' + r.join(' | ') + ' |').join('\n'));
          }
        } else {
          walk(child);
        }
      }
    };
    walk(root);
    return out.join('\n\n');
  });

  if (!body || body.length < 200) return null;

  // inline() appends a space after each element, which leaves " ," and " ." and
  // the occasional double space. Tidy rather than complicate the walker.
  const tidy = body
    .replace(/[ \t]+([,.;:!?])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +$/gm, '')
    .replace(/\n{3,}/g, '\n\n');

  const title = await page.title();
  const desc = await page.evaluate(() =>
    document.querySelector('meta[name="description"]')?.getAttribute('content') || '');
  const url = `https://napnix.in${route === '/' ? '/' : route}`;

  return `# ${title}\n\n> ${desc}\n\nSource: ${url}\n\n---\n\n${tidy}\n`;
}

for (const route of routes) {
  try {
    await page.goto(`http://127.0.0.1:${PORT}${route}`, {
      waitUntil: 'networkidle', timeout: NAV_TIMEOUT,
    });
    // react-helmet-async 2.x marks its tags with a valueless data-rh, so match
    // on attribute presence — [data-rh="true"] never matches. state must be
    // 'attached': a <link> in <head> is never visible, and waitForSelector
    // waits for visibility by default, so the default would always time out.
    await page.waitForSelector('link[rel="canonical"][data-rh]', {
      state: 'attached', timeout: HELMET_TIMEOUT,
    });
    const text = await page.evaluate(
      () => (document.querySelector('#root')?.innerText ?? '').replace(/\s+/g, ' ').trim().length,
    );
    if (text < MIN_TEXT) { skipped.push([route, text]); continue; }

    // Strip every script the shell did not ship. Aborting tracker requests
    // stops them loading but not from being created: GTM still inserts its
    // <script> elements, they stay in the DOM, and outerHTML captures them —
    // including a second GA property that appears nowhere in the source. Those
    // tags then re-execute on a real page load and throw. Comparing against
    // the shell's own script set is what actually keeps the output clean,
    // while preserving the shell's gtag loader and the app's module script.
    await page.evaluate((shell) => {
      const root = document.getElementById('root');
      for (const el of [...document.querySelectorAll('script')]) {
        // Anything React rendered lives inside #root — including the
        // application/ld+json blocks from SiteSchema and each page's Helmet.
        // Stripping those removed the structured data from every prerendered
        // page (4 blocks down to 1) and broke hydration, because the client
        // renders a <script> the prerendered markup no longer had.
        // Third-party loaders inject into <head>, so scoping the sweep to
        // outside #root removes them and nothing else.
        if (root && root.contains(el)) continue;
        // ...except JSON-LD, which react-helmet-async commits into <head>, not
        // into #root. The sweep above therefore deleted every page-level
        // schema block on the way out: /blog/* shipped Organization + WebSite
        // from SiteSchema and lost the Article, author and datePublished that
        // the component clearly declares. Structured data is inert data, never
        // an executable loader, so it is always safe to keep.
        if (el.type === 'application/ld+json') continue;
        const src = el.getAttribute('src');
        const keep = src ? shell.srcs.includes(src) : shell.inline.includes(el.textContent.trim());
        if (!keep) el.remove();
      }
    }, shellScripts);

    // index.html ships a full set of static head tags so the SPA shell is never
    // bare, and Helmet then appends its own page-specific copies rather than
    // replacing them (it only reclaims tags carrying data-rh). The captured DOM
    // therefore held two descriptions, two og:titles and two og:types per page,
    // with the generic homepage value FIRST — which is the one a crawler
    // reading raw HTML takes. Drop the static duplicate wherever Helmet has
    // supplied its own.
    const deduped = await page.evaluate(() => {
      const removed = [];
      const key = (el) => el.tagName === 'TITLE'
        ? 'title'
        : `${el.tagName}:${el.getAttribute('name') ?? el.getAttribute('property') ?? el.getAttribute('rel') ?? ''}`;
      const byKey = new Map();
      for (const el of document.head.querySelectorAll('title, meta[name], meta[property], link[rel="canonical"]')) {
        const k = key(el);
        if (!byKey.has(k)) byKey.set(k, []);
        byKey.get(k).push(el);
      }
      for (const [k, els] of byKey) {
        if (els.length < 2) continue;
        // og:image:width and friends legitimately repeat only when Helmet set
        // them too; prefer the Helmet copy in every case, else keep the last.
        const helmet = els.filter((el) => el.hasAttribute('data-rh'));
        const keep = helmet.length ? helmet[helmet.length - 1] : els[els.length - 1];
        for (const el of els) if (el !== keep) { el.remove(); removed.push(k); }
      }
      return removed;
    });
    if (deduped.length) dedupedTags.push([route, deduped.length]);

    // index.html loads the Google Fonts stylesheet non-blockingly with the
    // media="print" + onload="this.media='all'" trick. By the time we serialise,
    // that onload has already fired in this browser, so the DOM holds
    // media="all" — and writing that out bakes a render-blocking stylesheet into
    // every static page, which is the opposite of what the trick is for. PSI put
    // the cost of the two blocking font requests at ~880ms.
    // Reset it to the pre-onload state so the shipped HTML keeps the behaviour
    // index.html asked for. The <noscript> fallback is untouched: it is
    // correctly nested and only applies when JS is off.
    const fontsReset = await page.evaluate(() => {
      let n = 0;
      for (const el of document.querySelectorAll('link[rel="stylesheet"][onload]')) {
        if (el.media !== 'print') { el.media = 'print'; n++; }
      }
      return n;
    });
    if (fontsReset) fontResets.push([route, fontsReset]);

    // Stamp the route this document was rendered for, so the client can tell
    // whether the markup it received actually belongs to the URL being loaded.
    //
    // src/main.jsx hydrates with hydrateRoot, which requires the first client
    // render to match the served markup. That holds for the 51 prerendered
    // routes, but nginx serves this same dist/index.html as the SPA fallback for
    // everything else (/thank-you, /portfolio/<unknown>, the 86 generated blog
    // slugs). Since dist/index.html IS the prerendered homepage, a visitor
    // landing on /thank-you receives homepage markup and React renders the
    // thank-you page — a whole-document mismatch. main.jsx compares this
    // attribute with location.pathname and falls back to createRoot when they
    // disagree, so hydration is only attempted where it can succeed.
    await page.evaluate((r) => {
      document.documentElement.setAttribute('data-prerendered-path', r);

      // Point the Markdown alternate at THIS route's .md sibling.
      //
      // index.html ships a static `href="/index.md"`, and nothing rewrote it, so
      // all 59 prerendered pages advertised the homepage's Markdown. An agent
      // following the link from /napcrm/pricing was handed the homepage instead
      // of the pricing content — which defeats the only purpose of the tag,
      // since the per-route siblings written below all exist and are correct.
      const mdHref = r === '/' ? '/index.md' : `${r.replace(/\/$/, '')}.md`;
      document
        .querySelectorAll('link[rel="alternate"][type="text/markdown"]')
        .forEach((el) => el.setAttribute('href', mdHref));

      // Drop the homepage hero preload on every other route.
      //
      // The preload is declared statically in index.html because the homepage
      // hero is its LCP element. But prerendering copies the whole head onto
      // all 59 routes, so /faq, /contact and the rest each fetched a 30-116 KB
      // AVIF they never render. Chrome reports it as "preloaded but not used",
      // and it competes with the hero those pages do render.
      if (r !== '/') {
        document
          .querySelectorAll('link[rel="preload"][as="image"]')
          .forEach((el) => {
            const srcset = el.getAttribute('imagesrcset') || '';
            const href = el.getAttribute('href') || '';
            if (srcset.includes('/assets/hero/home-hero-') || href.includes('/assets/hero/home-hero-')) {
              el.remove();
            }
          });
      }
    }, route);

    let html = '<!doctype html>\n' + await page.evaluate(() => document.documentElement.outerHTML);

    // Inline the app stylesheet and drop the <link> that fetched it.
    //
    // PSI named this as the one render-blocking resource on the site, at
    // 1,156ms, and mobile FCP was 3.0s of a 3.3s LCP — so the stylesheet round
    // trip was most of the time to first paint. The file is 172 KB raw but only
    // 17.6 KB brotli, so the 1.1s is latency for one extra request, not
    // transfer: the HTML has to be parsed, the link discovered, a request
    // issued, and the response received before anything can paint.
    //
    // Inlining removes that request. The cost is ~17.6 KB compressed added to
    // each page and no cross-page CSS caching — which matters little here,
    // because this is an SPA (after the first document, navigation is
    // client-side and the styles are already present) and because the pages a
    // crawler fetches do not benefit from a warm CSS cache either.
    //
    // Done here rather than in vite config so the build output keeps a real
    // hashed stylesheet for any non-prerendered route served the SPA shell.
    html = inlineStylesheet(html, route);

    // The whole point is that the static response carries the right canonical.
    // If it does not, writing the file would ship the defect this script exists
    // to remove, so fail the build instead.
    const want = `https://napnix.in${route === '/' ? '/' : route}`;
    const got = html.match(/rel="canonical"\s+href="([^"]+)"/)?.[1];
    if (got !== want) {
      failed.push([route, `canonical ${got ?? 'missing'} expected ${want}`]);
      continue;
    }

    const out = route === '/' ? join(DIST, 'index.html') : join(DIST, route, 'index.html');
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, html, 'utf8');

    // Write a Markdown sibling for every route.
    //
    // robots.txt explicitly invites GPTBot, ClaudeBot, PerplexityBot and
    // OAI-SearchBot, and then hands them ~290 KB of HTML per page in which the
    // article is a small fraction of the bytes. Markdown is a few KB of the same
    // content with the structure intact, which is materially easier for a model
    // to parse and quote accurately. The agent-readiness audit also looks for
    // `.md` siblings, `rel="alternate" type="text/markdown"` and
    // `Accept: text/markdown` negotiation.
    //
    // Honest framing: Markdown delivery is a convention, not a ratified
    // standard, and no crawler is documented as requiring it. It is shipped here
    // because the content utility is real, not because a spec demands it. The
    // `<link rel="alternate">` in index.html is what makes it discoverable; the
    // nginx rule in deploy/nginx-napnix.conf serves the right content type and
    // handles `Accept:` negotiation.
    const markdown = await extractMarkdown(page, route);
    if (markdown) {
      const mdOut = route === '/' ? join(DIST, 'index.md') : join(DIST, `${route.replace(/^\//, '')}.md`);
      mkdirSync(dirname(mdOut), { recursive: true });
      writeFileSync(mdOut, markdown, 'utf8');
      const mdBuf = Buffer.from(markdown, 'utf8');
      writeFileSync(`${mdOut}.gz`, gzipSync(mdBuf, { level: 9 }));
      writeFileSync(`${mdOut}.br`, brotliCompressSync(mdBuf, {
        params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11 },
      }));
      markdownWritten.push([route, markdown.length]);
    }

    // vite-plugin-compression2 pre-compresses during `vite build`, which runs
    // BEFORE this script. Overwriting index.html alone leaves index.html.gz and
    // index.html.br holding the pre-prerender shell, and a host that serves
    // pre-compressed variants then ships that stale copy — which is exactly
    // what happened on the first deploy: every route served a 12,550-byte shell
    // with no canonical while dist/index.html was 321KB of prerendered markup.
    // Regenerate both siblings from the HTML actually written.
    const buf = Buffer.from(html, 'utf8');
    writeFileSync(`${out}.gz`, gzipSync(buf, { level: 9 }));
    writeFileSync(`${out}.br`, brotliCompressSync(buf, {
      params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11 },
    }));

    written.push([route, text, html.length]);
  } catch (err) {
    failed.push([route, err.message.split('\n')[0].slice(0, 80)]);
  }
}

await browser.close();
server.close();

for (const [route, text, bytes] of written) {
  console.log(`prerender: ${route.padEnd(44)} ${String(text).padStart(6)} chars  ${(bytes / 1024).toFixed(0)}kb`);
}
for (const [route, text] of skipped) {
  console.log(`prerender: SKIP ${route.padEnd(39)} ${text} chars (needs API data at build time)`);
}
for (const [route, n] of dedupedTags) {
  console.log(`prerender: dedupe ${route.padEnd(37)} dropped ${n} duplicate head tag(s)`);
}
console.log(`prerender: inlined the app stylesheet into ${inlinedCount} page(s)`);
for (const [route, why] of inlineMisses) {
  console.log(`prerender: CSS INLINE MISS ${route.padEnd(33)} ${why}`);
}
if (markdownWritten.length) {
  const kb = markdownWritten.reduce((n, [, len]) => n + len, 0) / 1024;
  console.log(`prerender: wrote ${markdownWritten.length} Markdown sibling(s), ${kb.toFixed(0)} KB total`);
}
if (fontResets.length) {
  const total = fontResets.reduce((sum, [, n]) => sum + n, 0);
  console.log(`prerender: restored media="print" on ${total} font stylesheet link(s) across ${fontResets.length} route(s)`);
}
for (const [route, err] of failed) {
  console.log(`prerender: FAIL ${route.padEnd(39)} ${err}`);
}
console.log(
  `prerender: ${written.length} written, ${skipped.length} skipped, ${failed.length} failed`,
);

if (failed.length) process.exit(1);
