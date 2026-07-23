-- =============================================
-- Migration: Enable lead_source_google_sheets feature flag
-- =============================================
-- nexcrm-backend's featureConfig.js DEFAULT_PLAN_CONFIGS already lists this
-- feature for growth/business (fallback used only when a plan row is missing
-- enabled_features). Real tenants read plans.enabled_features from this DB
-- (see featureConfig.js createFeatureConfig()), so the flag has to land here
-- too or the Lead Sources page 403s for every live tenant on those plans.
--
-- NOTE: this turned out to be a no-op in production — the live `plans` table
-- uses slugs starter/professional/enterprise, not growth/business (see
-- 060_lead_source_google_sheets_feature_fix.sql for the corrected version).
-- Left as-is (already executed and tracked in the `migrations` table) rather
-- than rewritten, so this file matches what actually ran.

UPDATE plans
SET enabled_features = JSON_ARRAY_APPEND(enabled_features, '$', 'lead_source_google_sheets')
WHERE (name IN ('Growth', 'Business') OR slug IN ('growth', 'business'))
  AND enabled_features IS NOT NULL
  AND NOT JSON_CONTAINS(enabled_features, '"lead_source_google_sheets"');

-- Enterprise already carries '*' (all features) — no row to touch.
