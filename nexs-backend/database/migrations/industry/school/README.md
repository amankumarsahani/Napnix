# School / College — provisioning schema

**This folder is what actually creates a new school tenant's tables.**

`provisioner.js → runMigrations()` runs, in order:

1. `database/migrations/nexcrm_base_schema.sql` (core tables)
2. every `*.sql` in `database/migrations/industry/<industry_type>/`, sorted by filename

It does **not** run `nexcrm-backend/database/migrations/school/*.js`. Those JS migrations are
what `npm run migrate:school` and `npm run migrate:tenants` use — i.e. dev setup and
migrating *already-live* tenants.

## The duplication, stated plainly

The school schema therefore has to exist in two places:

| File | Used by | When |
|---|---|---|
| `nexs-backend/database/migrations/industry/school/*.sql` | `provisioner.js` | Provisioning a **new** tenant |
| `nexcrm-backend/database/migrations/school/*.js` | `npm run migrate:school`, `migrate:tenants` | Dev setup, migrating **existing** tenants |

This is pre-existing platform behaviour — `education/`, `ecommerce/` and every other industry
folder here has the same split. It is a known wart, not a school-specific one.

**If the two drift, a newly provisioned school gets a different schema from an existing one,
and the bug will surface weeks later as a mystery 500.** Phase 1 must pick one of:

- **(a)** Author each table's DDL once as `.sql` and have the `nexcrm-backend` JS migration read
  and execute that same file (one source of truth, requires the two repos to agree on a path).
- **(b)** Keep both, and add a CI check that diffs the resulting `SHOW CREATE TABLE` output of a
  provisioner-built DB against a `migrate:school`-built DB.

Do not start Phase 1 without deciding. Recommendation: **(a)**.

See `nexcrm-backend/docs/school-napcrm/` for the schema itself.
