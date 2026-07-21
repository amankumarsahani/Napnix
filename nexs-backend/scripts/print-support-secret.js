#!/usr/bin/env node
/**
 * Print tenant support secrets, for backfilling tenants provisioned before the
 * support desk existed. Run on the MASTER host so it reads the same
 * JWT_SECRET / SUPPORT_SIGNING_SECRET the master verifies with.
 *
 * Usage:
 *   node scripts/print-support-secret.js                 # all tenants (table)
 *   node scripts/print-support-secret.js <slug>          # one tenant
 *   node scripts/print-support-secret.js --env           # all tenants, env-line format
 *   node scripts/print-support-secret.js <slug> --env    # one tenant, env-line format
 *
 * --env prints copy-paste lines to drop into each tenant's PM2 env:
 *   # tenant-<slug>
 *   SUPPORT_TENANT_SECRET=...
 *   NEXS_BACKEND_URL=...
 */

require('dotenv').config();
const { deriveSupportSecret, normalizeSlug } = require('../utils/supportSecret');
const { query, pool } = require('../config/database');

const args = process.argv.slice(2);
const envMode = args.includes('--env');
const slugArg = args.find((a) => !a.startsWith('--'));
const backendUrl = process.env.NEXS_BACKEND_URL || 'http://localhost:5000';

async function slugsToProcess() {
    if (slugArg) return [normalizeSlug(slugArg)];
    const [rows] = await query('SELECT slug FROM tenants ORDER BY slug');
    return rows.map((r) => normalizeSlug(r.slug)).filter(Boolean);
}

(async () => {
    try {
        const slugs = await slugsToProcess();
        if (!slugs.length) {
            console.error('No tenants found.');
            process.exit(1);
        }

        if (envMode) {
            for (const slug of slugs) {
                console.log(`# tenant-${slug}`);
                console.log(`SUPPORT_TENANT_SECRET=${deriveSupportSecret(slug)}`);
                console.log(`NEXS_BACKEND_URL=${backendUrl}`);
                console.log('');
            }
        } else {
            console.log('SLUG'.padEnd(32) + 'SUPPORT_TENANT_SECRET');
            console.log('-'.repeat(90));
            for (const slug of slugs) {
                console.log(slug.padEnd(32) + deriveSupportSecret(slug));
            }
            console.log(`\n${slugs.length} tenant(s). Set each SUPPORT_TENANT_SECRET + NEXS_BACKEND_URL`);
            console.log(`(${backendUrl}) in that tenant's PM2 env, then: pm2 reload tenant-<slug> --update-env`);
        }
    } catch (err) {
        console.error('Failed:', err.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
})();
