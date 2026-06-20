import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getSitemapEntries } from '../src/constants/sitemapRoutes.js';

const SITE_URL = 'https://napnix.in';
const outPath = join(process.cwd(), 'public', 'sitemap.xml');

const entries = getSitemapEntries();

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
