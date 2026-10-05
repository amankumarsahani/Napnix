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
 * recognises and replaces them instead of appending duplicates.
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
import { getSitemapEntries } from '../src/constants/sitemapRoutes.js';

const DIST = join(process.cwd(), 'dist');
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
const routes = getSitemapEntries().map((e) => e.path);
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
        const src = el.getAttribute('src');
        const keep = src ? shell.srcs.includes(src) : shell.inline.includes(el.textContent.trim());
        if (!keep) el.remove();
      }
    }, shellScripts);

    const html = '<!doctype html>\n' + await page.evaluate(() => document.documentElement.outerHTML);

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
for (const [route, err] of failed) {
  console.log(`prerender: FAIL ${route.padEnd(39)} ${err}`);
}
console.log(
  `prerender: ${written.length} written, ${skipped.length} skipped, ${failed.length} failed`,
);

if (failed.length) process.exit(1);
