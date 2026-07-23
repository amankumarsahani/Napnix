-- =============================================
-- Migration: Fix lead_source_google_sheets feature flag (correct plan names)
-- =============================================
-- 059 targeted growth/business, which don't exist in this DB — the live
-- `plans` table (seeded in 013_create_tenant_tables.sql) uses starter /
-- professional / enterprise. Migration 016 also only ever populated
-- enabled_features for Starter and Enterprise (its Growth/Business UPDATEs
-- matched nothing), so `professional` has had enabled_features = NULL since
-- the column was added — that's a pre-existing gap, not introduced here.
--
-- IFNULL seeds a fresh array for any plan still at NULL instead of relying
-- on JSON_ARRAY_APPEND (which returns NULL when the target is NULL).

UPDATE plans
SET enabled_features = JSON_ARRAY_APPEND(
    IFNULL(enabled_features, JSON_ARRAY()),
    '$', 'lead_source_google_sheets'
)
WHERE (name IN ('Professional', 'Growth', 'Business') OR slug IN ('professional', 'growth', 'business'))
  AND NOT JSON_CONTAINS(IFNULL(enabled_features, JSON_ARRAY()), '"lead_source_google_sheets"');

-- Enterprise already carries '*' (all features) via migration 016 — no row to touch.
