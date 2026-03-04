# Operations Runbook

## Purpose

Provide a fast, repeatable response guide for production incidents and routine operations.

## Service Map

- Public site: Next.js app on Vercel
- Contact persistence: Postgres via Drizzle (`contacts` table)
- Admin auth: middleware Basic Auth (`/admin`, `/api/admin/*`)
- Analytics APIs:
  - GA4: `/api/admin/ga4/overview`
  - GSC: `/api/admin/gsc/overview`

## Daily and Weekly Checks

### Daily

1. Confirm production homepage and contact page return `200`.
2. Submit one synthetic contact in non-production environment.
3. Verify Vercel deployment logs are clean.

### Weekly

1. Verify redirect and SEO assets:
   - `/robots.txt`
   - `/sitemap.xml`
   - `/llms.txt`
2. Verify admin analytics endpoints return healthy payloads.
3. Confirm GA4 Realtime and Search Console data are flowing.

## Incident Playbooks

## Incident: Admin login suddenly fails

Symptoms:

- `/admin` returns `401` for valid credentials, or
- `/admin` returns `503 missing_config`

Actions:

1. Check `ADMIN_PASSWORD` exists in Vercel production env.
2. Re-test using:
   - `curl -i -u "admin:<password>" https://<domain>/api/admin/contacts`
3. If `503 missing_config`, set `ADMIN_PASSWORD` and redeploy.
4. If still failing, rotate secret and update password manager entry.

## Incident: Contact form returns 500

Symptoms:

- `POST /api/contacts` fails with `500`

Actions:

1. Check Vercel function logs for storage error.
2. Confirm `DATABASE_URL` is set for production.
3. Confirm database connectivity.
4. Run schema push if table drift is suspected:
   - `npm run db:push`
5. Re-test submit flow.

## Incident: Admin contacts list fails

Symptoms:

- `/api/admin/contacts` returns `500`

Actions:

1. Verify auth first (401 vs 500).
2. Check Postgres connectivity and table existence.
3. Verify no schema mismatch in `contacts` columns.
4. Confirm environment has correct `DATABASE_URL`.

## Incident: GA4/GSC cards show missing config

Symptoms:

- endpoint returns `503` + `missing_config`

Actions:

1. Validate `GA4_PROPERTY_ID` and `GSC_SITE_URL`.
2. Validate one credential mode:
   - `GOOGLE_SERVICE_ACCOUNT_JSON`, or
   - `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`, or
   - `GOOGLE_APPLICATION_CREDENTIALS`
3. Confirm service account permissions in:
   - GA4 property access
   - Search Console property access
4. Re-test endpoints.

## Incident: Legacy redirects broken

Symptoms:

- old URLs no longer resolve to expected targets

Actions:

1. Verify redirect rules in `next.config.ts`.
2. Verify middleware redirects for:
   - `www` host to apex
   - `/?page_id=1073` to `/patient-info`
3. Deploy fix and run redirect smoke tests.

## Routine Operational Tasks

## Rotate admin password

1. Create new strong value for `ADMIN_PASSWORD`.
2. Update Vercel env:
   - `vercel env add ADMIN_PASSWORD production`
3. Redeploy production.
4. Validate with authenticated admin API request.

## Add a new public route to sitemap

1. Add route in `src/content/routes.ts`.
2. Ensure metadata mapping is added if needed.
3. Deploy and verify `/sitemap.xml` includes route.

## Backup and recovery note

- Postgres backup/restore is handled at provider level.
- Before high-risk schema changes, ensure a backup checkpoint exists.

## On-Call Escalation Template

When escalating, include:

1. Incident start time (UTC and local)
2. Blast radius (public routes, admin only, API only)
3. First failing endpoint and status code
4. Recent deployment SHA
5. Logs excerpt and attempted mitigations
