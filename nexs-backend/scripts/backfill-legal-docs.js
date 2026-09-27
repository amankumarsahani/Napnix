#!/usr/bin/env node
/**
 * One-shot backfill: generate + push storefront legal/compliance pages
 * (Terms, Privacy Policy, Refund Policy, Cookie Policy, DPDP Act 2023 notice)
 * for every tenant provisioned before this system existed.
 *
 * New tenants get this automatically at provisioning time — see
 * services/provisioner.js step 10.1 and services/legalDocsGenerator.js.
 * See CLAUDE.md "Tenant Legal & Compliance" for why this is mandatory.
 *
 * Usage:
 *   node scripts/backfill-legal-docs.js            # all active/trial tenants with a running process
 *   node scripts/backfill-legal-docs.js --dry-run  # list tenants that would be processed, no AI calls
 *   node scripts/backfill-legal-docs.js <slug>     # single tenant
 *
 * Idempotent — re-running overwrites existing docs (ON DUPLICATE KEY UPDATE
 * on the tenant side), so it's safe to re-run after improving the prompts.
 */

require('dotenv').config();

const { pool } = require('../config/database');
const { generateAndPushLegalDocs } = require('../services/legalDocsGenerator');

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const onlySlug = args.find(a => !a.startsWith('--'));

    let sql = `
        SELECT id, name, slug, email, industry_type, custom_domain, process_status
        FROM tenants
        WHERE status IN ('trial', 'active') AND process_status = 'running'
    `;
    const params = [];
    if (onlySlug) {
        sql += ' AND slug = ?';
        params.push(onlySlug);
    }

    const [tenants] = await pool.query(sql, params);
    console.log(`[backfill-legal-docs] ${tenants.length} tenant(s) to process${dryRun ? ' (dry run)' : ''}`);

    for (const tenant of tenants) {
        if (dryRun) {
            console.log(`  - would generate for ${tenant.slug} (${tenant.industry_type})`);
            continue;
        }

        console.log(`  → ${tenant.slug} ...`);
        const result = await generateAndPushLegalDocs(tenant);
        console.log(`    ${result.success ? 'OK' : 'FAILED'}: ${JSON.stringify(result)}`);
    }

    console.log('[backfill-legal-docs] Done.');
    process.exit(0);
}

main().catch(err => {
    console.error('[backfill-legal-docs] Fatal error:', err);
    process.exit(1);
});
