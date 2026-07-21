#!/usr/bin/env node
/**
 * One-shot backfill: inject each tenant's SUPPORT_TENANT_SECRET + NEXS_BACKEND_URL
 * into its PM2 process env and restart it, so tenants provisioned before the support
 * desk existed start talking to the master support API.
 *
 * Run on the host where the tenant PM2 processes live (same box as `pm2 list`), and
 * on the MASTER host so the derived secret matches what the master verifies with.
 * (For a single-server setup that is the same machine — the normal case here.)
 *
 * Usage:
 *   node scripts/backfill-support-secrets.js            # backfill + restart all tenants
 *   node scripts/backfill-support-secrets.js --dry-run  # show what it would do, no restart
 *   node scripts/backfill-support-secrets.js <slug>     # single tenant
 *
 * Idempotent — safe to re-run.
 */

require('dotenv').config();
const { execFileSync } = require('child_process');
const { deriveSupportSecret, normalizeSlug } = require('../utils/supportSecret');
const { query, pool } = require('../config/database');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const slugArg = args.find((a) => !a.startsWith('--'));
const backendUrl = process.env.NEXS_BACKEND_URL || 'http://localhost:5000';

function pm2Restart(procName, env) {
    // --update-env makes PM2 merge the current environment into the running process,
    // so the two injected vars are picked up while DB/JWT env stays intact.
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
        const env = { SUPPORT_TENANT_SECRET: deriveSupportSecret(slug), NEXS_BACKEND_URL: backendUrl };

        if (dryRun) {
            console.log(`[dry-run] ${procName}  SUPPORT_TENANT_SECRET=${env.SUPPORT_TENANT_SECRET}`);
            continue;
        }
        try {
            pm2Restart(procName, env);
            console.log(`✓ ${procName} restarted with support secret`);
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
