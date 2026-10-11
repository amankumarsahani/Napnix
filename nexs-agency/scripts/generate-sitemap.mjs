import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getSitemapEntries } from '../src/constants/sitemapRoutes.js';
import { fetchIndexableBlogs } from './lib/publishedBlogs.mjs';

const SITE_URL = 'https://napnix.in';
const outPath = join(process.cwd(), 'public', 'sitemap.xml');

/*
 * Static routes plus the API-driven articles that are allowed in the index.
 *
 * getSitemapEntries() covers the six hand-written posts, which are React
 * components. The database-backed articles were in no sitemap at all: the
 * backend serves its own /api/blogs/sitemap.xml, but nothing references it and
 * it lists the 243 noindex posts, so it was never usable.
 *
 * Legacy posts stay out. A sitemap entry for a noindex URL asks Google to crawl
 * what we are telling it to ignore -- the same reasoning that keeps the six
 * overseas city pages out, documented in sitemapRoutes.js.
 *
 * A slug already covered by a static entry is dropped, so a hand-written post
 * that also exists as a row cannot appear twice.
 */
const staticEntries = getSitemapEntries();
const staticPaths = new Set(staticEntries.map((e) => e.path));

const blogEntries = (await fetchIndexableBlogs())
    .map((post) => ({
        path: `/blog/${post.slug}`,
        priority: '0.6',
        changefreq: 'monthly',
        lastmod: post.updatedAt,
    }))
    .filter((entry) => !staticPaths.has(entry.path) && entry.lastmod);

const entries = [...staticEntries, ...blogEntries];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
    .map(
        ({ path, lastmod, changefreq, priority }) => `  <url>
    <loc>${SITE_URL}${path === '/' ? '/' : path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
    )
    .join('\n')}
</urlset>
`;

writeFileSync(outPath, xml, 'utf8');
console.log(`generate-sitemap: wrote ${entries.length} URLs to public/sitemap.xml`);
