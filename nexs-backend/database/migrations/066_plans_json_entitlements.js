/**
 * Adds JSON entitlement columns to `plans` so the table can become the single
 * source of truth for tenant feature limits/features, matching the shape
 * `nexcrm-backend/services/featureConfig.js` already expects from
 * `createFeatureConfig(tenant, plan)` (currently dead code — the tenant only
 * ever uses its hardcoded DEFAULT_PLAN_CONFIGS fallback).
 *
 * Values below mirror the public pricing page (napnix.in/napcrm/pricing,
 * source nexs-agency/src/constants/crmPricing.js), confirmed authoritative
 * by Anu on 2026-09-27, and the corresponding fallback numbers in
 * nexcrm-backend/services/featureConfig.js DEFAULT_PLAN_CONFIGS.
 *
 * See nexcrm-backend/docs/PRD_plan_enforcement.md for the full plan — this
 * migration is step 1 only (catalog columns + seed). Wiring a tenant to
 * actually read this table live is a later step in that PRD.
 */
module.exports = async function (connection) {
    const alterations = [
        { col: 'feature_limits', sql: "ADD COLUMN feature_limits JSON DEFAULT NULL AFTER features" },
        { col: 'communication_limits', sql: "ADD COLUMN communication_limits JSON DEFAULT NULL AFTER feature_limits" },
        { col: 'enabled_features', sql: "ADD COLUMN enabled_features JSON DEFAULT NULL AFTER communication_limits" },
    ];
    for (const { col, sql } of alterations) {
        try { await connection.query(`ALTER TABLE plans ${sql}`); }
        catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') throw e; }
    }

    const catalog = {
        starter: {
            feature_limits: { users: 2, leads: 500, clients: 200, products: 50, workflows: 3, landing_pages: 0, storage_gb: 1, documents: 50, forms: 3 },
            communication_limits: { emails_per_month: 500, email_templates: 5, bulk_mail_limit: 0, sms_per_month: 0, whatsapp_enabled: false, team_chat: false, push_notifications: false },
            enabled_features: ['basic_reports', 'email_templates', 'in_app_notifications', 'lead_source_google_sheets', 'email_inbox']
        },
        growth: {
            feature_limits: { users: 5, leads: 2000, clients: 1000, products: 500, workflows: 10, landing_pages: 5, storage_gb: 5, documents: 200, forms: 10 },
            communication_limits: { emails_per_month: 5000, email_templates: 25, bulk_mail_limit: 500, sms_per_month: 0, whatsapp_enabled: true, team_chat: true, chat_history_days: 7, chat_channels: 3, push_notifications: true },
            enabled_features: ['basic_reports', 'email_templates', 'bulk_import', 'email_scheduling', 'bulk_mailing', 'auto_responders', 'team_chat_basic', 'push_notifications', 'in_app_notifications', 'ai_core', 'email_inbox', 'lead_source_google_sheets', 'whatsapp_business', 'api_access']
        },
        business: {
            feature_limits: { users: 15, leads: 10000, clients: 5000, products: 2000, workflows: 50, landing_pages: 25, storage_gb: 25, documents: 1000, forms: 50 },
            communication_limits: { emails_per_month: 25000, email_templates: -1, bulk_mail_limit: 5000, sms_per_month: 1000, sms_templates: 10, whatsapp_enabled: true, whatsapp_templates: 10, team_chat: true, chat_history_days: 90, chat_channels: 10, push_notifications: true, browser_push: true },
            enabled_features: ['basic_reports', 'advanced_reports', 'email_templates', 'bulk_import', 'email_scheduling', 'bulk_mailing', 'email_campaigns', 'campaign_analytics', 'custom_smtp', 'sms_notifications', 'whatsapp_business', 'whatsapp_templates', 'whatsapp_broadcast', 'team_chat_full', 'ai_chatbot_basic', 'auto_responders', 'workflow_triggers', 'push_notifications', 'browser_push', 'in_app_notifications', 'api_access', 'webhooks', 'ai_core', 'ai_agents', 'ai_playbooks', 'email_inbox', 'lead_source_google_sheets']
        },
        enterprise: {
            feature_limits: { users: -1, leads: -1, clients: -1, products: -1, workflows: -1, landing_pages: -1, storage_gb: 100, documents: -1, forms: -1 },
            communication_limits: { emails_per_month: -1, email_templates: -1, bulk_mail_limit: -1, sms_per_month: -1, sms_templates: -1, whatsapp_enabled: true, whatsapp_templates: -1, whatsapp_broadcast: true, team_chat: true, chat_history_days: -1, chat_channels: -1, push_notifications: true, browser_push: true, mobile_push: true },
            enabled_features: ['*']
        }
    };

    for (const [slug, entry] of Object.entries(catalog)) {
        await connection.query(
            `UPDATE plans SET feature_limits = ?, communication_limits = ?, enabled_features = ? WHERE slug = ?`,
            [JSON.stringify(entry.feature_limits), JSON.stringify(entry.communication_limits), JSON.stringify(entry.enabled_features), slug]
        );
    }

    // 'professional' is the legacy slug aliased to 'business' in nexcrm-backend
    // (featureConfig.js: DEFAULT_PLAN_CONFIGS.professional = DEFAULT_PLAN_CONFIGS.business).
    // Any tenant row still on that slug gets the same JSON as business.
    const [profRows] = await connection.query("SELECT id FROM plans WHERE slug = 'professional'");
    if (profRows.length) {
        const b = catalog.business;
        await connection.query(
            `UPDATE plans SET feature_limits = ?, communication_limits = ?, enabled_features = ? WHERE slug = 'professional'`,
            [JSON.stringify(b.feature_limits), JSON.stringify(b.communication_limits), JSON.stringify(b.enabled_features)]
        );
    }
};
