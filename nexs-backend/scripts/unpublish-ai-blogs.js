#!/usr/bin/env node
/**
 * Unpublish the old generic AI blog posts (sets status = 'draft'; nothing is deleted).
 *
 * Why: ~240 auto-generated posts on general AI topics (many near-duplicates, some with
 * random seed tokens in the title) attract non-buyer searches and drag down site quality.
 * Drafts drop out of /api/blogs/sitemap.xml, and nexs-agency BlogArticle renders noindex
 * for missing posts, so Google removes them over the next few weeks.
 * Undo: UPDATE blogs SET status = 'published' WHERE id IN (...).
 *
 * Usage:
 *   node scripts/unpublish-ai-blogs.js                      # dry run: list what would be unpublished
 *   node scripts/unpublish-ai-blogs.js --keep=247,224       # keep these ids published
 *   node scripts/unpublish-ai-blogs.js --before=2026-10-11  # only posts created before this date (default: today)
 *   node scripts/unpublish-ai-blogs.js --apply              # actually do it (prints ids for undo)
 */

require('dotenv').config();

const { pool } = require('../config/database');

const arg = name => process.argv.find(a => a.startsWith(`--${name}=`))?.split('=')[1];

async function main() {
    const apply = process.argv.includes('--apply');
    const keep = (arg('keep') || '').split(',').map(Number).filter(Boolean);
    const before = arg('before') || new Date().toISOString().slice(0, 10);

    const [rows] = await pool.query(
        `SELECT id, slug, author FROM blogs
         WHERE status = 'published' AND created_at < ? ${keep.length ? 'AND id NOT IN (?)' : ''}
         ORDER BY id`,
        keep.length ? [before, keep] : [before]
    );

    rows.forEach(r => console.log(`${r.id}\t${r.author}\t${r.slug}`));
    console.log(`\n${rows.length} post(s) ${apply ? 'will be' : 'would be'} unpublished. Kept: ${keep.join(',') || 'none'}`);

    if (apply && rows.length) {
        const ids = rows.map(r => r.id);
        const [res] = await pool.query("UPDATE blogs SET status = 'draft' WHERE id IN (?)", [ids]);
        console.log(`Done: ${res.affectedRows} unpublished.\nUndo ids: ${ids.join(',')}`);
    } else if (!apply) {
        console.log('Dry run. Re-run with --apply to unpublish.');
    }
    await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
