/**
 * Pushes a tenant's plan entitlements to its already-running nexcrm-backend
 * process, so a plan change (payment webhook or admin edit) applies instantly
 * instead of waiting for a manual/relaunch restart to pick it up.
 *
 * Companion to nexcrm-backend/routes/internal.routes.js POST /reload-plan-config
 * and FeatureConfig.reloadPlanConfig(). See docs/PRD_plan_enforcement.md.
 *
 * Deliberately does NOT touch industries/modules — which industry routes are
 * mounted is decided once at boot, so an industry change still needs the full
 * relaunch path in tenant.controller.js (`_relaunchTenantForConfigChange`).
 */

const axios = require('axios');

const INTERNAL_OAUTH_KEY = process.env.INTERNAL_OAUTH_KEY;
const CRM_DOMAIN = process.env.NEXCRM_DOMAIN || 'napnix.in';

/**
 * @param {object} tenant - tenant row (needs slug, custom_domain optionally)
 * @param {object} plan - plan row from `plans` table (needs feature_limits /
 *   communication_limits / enabled_features JSON columns — see migration 066).
 *   Falls back to nothing (no-op) if the plan has no JSON entitlements yet,
 *   since the tenant's own DEFAULT_PLAN_CONFIGS fallback already matches the
 *   published catalog (see nexcrm-backend/services/featureConfig.js).
 */
async function pushPlanConfig(tenant, plan) {
    if (!tenant?.slug || !plan) return { skipped: true, reason: 'missing tenant or plan' };

    const { feature_limits, communication_limits, enabled_features } = plan;
    if (!feature_limits && !communication_limits && !enabled_features) {
        return { skipped: true, reason: 'plan has no JSON entitlements (migration 066 not run / not seeded for this slug)' };
    }

    const apiUrl = tenant.custom_domain
        ? `https://${tenant.custom_domain}`
        : `https://${tenant.slug}-crm-api.${CRM_DOMAIN}`;

    try {
        await axios.post(
            `${apiUrl}/api/internal/reload-plan-config`,
            {
                limits: feature_limits || undefined,
                communication: communication_limits || undefined,
                features: enabled_features || undefined
            },
            {
                headers: { 'X-Internal-Key': INTERNAL_OAUTH_KEY },
                timeout: 8000
            }
        );
        console.log(`[PlanConfigSync] Pushed plan '${plan.slug}' to tenant ${tenant.slug}`);
        return { success: true };
    } catch (error) {
        // Non-fatal by design: the tenant process may be stopped/restarting,
        // in which case it will pick up the right plan on its own next boot
        // via getDefaultPlanConfig(PLAN_SLUG) anyway. Never block the payment
        // or admin-edit flow on this call.
        console.warn(`[PlanConfigSync] Failed to push plan to tenant ${tenant.slug}: ${error.message}`);
        return { success: false, error: error.message };
    }
}

module.exports = { pushPlanConfig };
