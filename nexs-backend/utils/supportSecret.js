/**
 * Per-tenant support secret.
 *
 * Instead of one shared SUPPORT_API_KEY sitting in every tenant's env (leak one, forge all),
 * each tenant gets a unique key derived from the master root secret + its slug. The master
 * never ships the root secret anywhere; it re-derives the expected key to verify a request.
 * A leaked tenant key therefore only compromises that one tenant, and cannot be used to
 * impersonate any other slug.
 *
 * Mirrors the existing deriveTenantJwtSecret() approach in provisioner.js.
 */

const crypto = require('crypto');

/** Canonical slug form — must match the tenant's own TENANT_SLUG normalisation. */
function normalizeSlug(slug) {
    return String(slug || '')
        .trim()
        .toLowerCase()
        .replace(/^nexcrm_/, '')
        .replace(/_/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

/** The signing root. Reuses JWT_SECRET (master-only, already length-checked) unless overridden. */
function rootSecret() {
    const root = process.env.SUPPORT_SIGNING_SECRET || process.env.JWT_SECRET;
    if (!root || String(root).length < 32) {
        throw new Error('SUPPORT_SIGNING_SECRET / JWT_SECRET must be at least 32 characters');
    }
    return String(root);
}

function deriveSupportSecret(slug) {
    const normalized = normalizeSlug(slug);
    if (!normalized) throw new Error('Tenant slug is required to derive a support secret');
    return crypto
        .createHmac('sha256', rootSecret())
        .update(`napcrm:support:${normalized}:v1`)
        .digest('base64url');
}

/** Constant-time comparison so a wrong key cannot be recovered by timing the response. */
function safeEqual(a, b) {
    const bufA = Buffer.from(String(a || ''));
    const bufB = Buffer.from(String(b || ''));
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = { normalizeSlug, deriveSupportSecret, safeEqual };
