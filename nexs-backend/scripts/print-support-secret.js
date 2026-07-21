#!/usr/bin/env node
/**
 * Print a tenant's derived support secret, for backfilling existing tenants
 * that were provisioned before the support desk existed.
 *
 *   node scripts/print-support-secret.js <tenant-slug>
 *
 * Set the printed value as SUPPORT_TENANT_SECRET (+ NEXS_BACKEND_URL) in that
 * tenant's PM2 env, then restart the tenant process. Run this on the MASTER host
 * so it reads the same JWT_SECRET / SUPPORT_SIGNING_SECRET the master verifies with.
 */

require('dotenv').config();
const { deriveSupportSecret, normalizeSlug } = require('../utils/supportSecret');

const slug = process.argv[2];
if (!slug) {
    console.error('Usage: node scripts/print-support-secret.js <tenant-slug>');
    process.exit(1);
}

try {
    const normalized = normalizeSlug(slug);
    const secret = deriveSupportSecret(slug);
    console.log(`Tenant slug : ${normalized}`);
    console.log(`SUPPORT_TENANT_SECRET=${secret}`);
} catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
}
