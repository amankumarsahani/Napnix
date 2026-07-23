#!/usr/bin/env node
/**
 * One-shot backfill: inject GOOGLE_OAUTH_CLIENT_ID/SECRET + INTERNAL_OAUTH_KEY into
 * every tenant's PM2 process env and restart it, so tenants provisioned before Lead
 * Sources (Google Sheets) existed can complete the centralized Google OAuth flow.
 *
 * Same pattern as backfill-support-secrets.js — run this once after adding
 * GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET and INTERNAL_OAUTH_KEY to
 * nexs-backend's own .env. New tenants provisioned after that point get them
 * automatically via provisioner.js.
 *
 * Usage:
 *   node scripts/backfill-oauth-env.js            # backfill + restart all tenants
 *   node scripts/backfill-oauth-env.js --dry-run  # show what it would do, no restart
 *   node scripts/backfill-oauth-env.js <slug>     # single tenant
 *
 * Idempotent — safe to re-run.
 */

require('dotenv').config();
const { execFileSync } = require('child_process');
const { normalizeSlug } = require('../utils/supportSecret');
const { query, pool } = require('../config/database');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const slugArg = args.find((a) => !a.startsWith('--'));

const oauthEnv = {
    GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
    GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
    INTERNAL_OAUTH_KEY: process.env.INTERNAL_OAUTH_KEY || ''
};

const missing = Object.entries(oauthEnv).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
    console.error(`Missing in nexs-backend .env: ${missing.join(', ')} — set these before running.`);
    process.exit(1);
}

function pm2Restart(procName, env) {
    execFileSync('pm2', ['restart', procName, '--update-env'], {
        env: { ...process.env, ...env },
        stdio: 'pipe',
    });
}

(async () => {
    let slugs;
    try {
        if (slugArg) {
            slugs = [normalizeSlug(slugArg)];
        } else {
            const [rows] = await query('SELECT slug FROM tenants ORDER BY slug');
            slugs = rows.map((r) => normalizeSlug(r.slug)).filter(Boolean);
        }
    } catch (err) {
        console.error('DB error:', err.message);
        await pool.end();
        process.exit(1);
    }
    await pool.end();

    if (!slugs.length) { console.error('No tenants found.'); process.exit(1); }

    let ok = 0, skipped = 0;
    for (const slug of slugs) {
        const procName = `tenant-${slug}`;

        if (dryRun) {
            console.log(`[dry-run] ${procName}  GOOGLE_OAUTH_CLIENT_ID=${oauthEnv.GOOGLE_OAUTH_CLIENT_ID}`);
            continue;
        }
        try {
            pm2Restart(procName, oauthEnv);
            console.log(`✓ ${procName} restarted with OAuth env`);
            ok++;
        } catch (err) {
            // Most common: this tenant's process is not running on this host.
            console.warn(`✗ ${procName} skipped — ${String(err.stderr || err.message).trim().split('\n')[0]}`);
            skipped++;
        }
    }

    if (!dryRun) {
        try {
            execFileSync('pm2', ['save'], { stdio: 'pipe' });
            console.log('\npm2 process list saved.');
        } catch { /* non-fatal */ }
        console.log(`\nDone. ${ok} restarted, ${skipped} skipped.`);
    }
})();
