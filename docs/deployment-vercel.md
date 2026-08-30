# Deployment on Vercel

## Goal

Deploy the Next.js app from `main` to Vercel with full production parity:

- public routes and redirects
- admin auth and APIs
- contact persistence (Postgres)
- SEO assets (`robots.txt`, `sitemap.xml`, `llms.txt`)
- Vercel Web Analytics pageview collection on public routes

## Prerequisites

1. Node.js `20.9.0` or newer
2. Access to GitHub repo: `enzo-prism/tim-next-js`
3. Access to the production Vercel project:
   - project name: `tim-next-js`
   - project id: `prj_bzwJ806oFI1FxU70DEIi2iyV0sl1`
   - org id: `team_NbogaPSGlnnTm8RNaeS0B4Pl`
4. CLI tools installed and authenticated:
   - `gh auth status`
   - `vercel whoami`
5. Production secrets available:
   - `DATABASE_URL`
   - `ADMIN_PASSWORD`
   - `FORMSPREE_APPOINTMENT_ENDPOINT`
   - `FORMSPREE_CONTACT_ENDPOINT`
   - analytics variables and one Google service-account credential mode from
     `docs/environment-variables.md`
6. Vercel Web Analytics enabled for the production Vercel project

## Critical Deployment Guardrails

The most common failure mode is branch/config drift:

- GitHub default branch is not `main`
- Vercel project is not connected to the GitHub repo
- local `.vercel/project.json` points at the wrong Vercel project

Verify before release:

```bash
gh repo view enzo-prism/tim-next-js --json defaultBranchRef
cat .vercel/project.json
vercel git connect https://github.com/enzo-prism/tim-next-js.git
```

If the default branch is not `main`, stop and correct the repository setting as a separate, explicit administrative action.
`vercel git connect` is safe to run repeatedly; it will report if already connected.
`.vercel/project.json` must match this production target:

- `projectName`: `tim-next-js`
- `projectId`: `prj_bzwJ806oFI1FxU70DEIi2iyV0sl1`
- `orgId`: `team_NbogaPSGlnnTm8RNaeS0B4Pl`

If it does not match, relink explicitly:

```bash
vercel link --yes --project prj_bzwJ806oFI1FxU70DEIi2iyV0sl1 --team team_NbogaPSGlnnTm8RNaeS0B4Pl
```

## One-Time Project Linking

If not already linked:

```bash
vercel link --yes --project prj_bzwJ806oFI1FxU70DEIi2iyV0sl1 --team team_NbogaPSGlnnTm8RNaeS0B4Pl
```

`.vercel/project.json` is local and intentionally ignored. The guarded release script links this exact project when the checkout is not linked, and it fails fast if the checkout is linked to any other Vercel project.

Before any production deploy, the guarded release script also validates production env names without printing secret values. It blocks the release if a required env is missing, including the Google credential one-of group used by admin analytics.

## Pre-Deploy Local Checks

Run from repo root:

```bash
npm ci
npm run quality:all
npm run test:e2e
```

If any command fails, do not deploy.

## Environment Setup

Set variables in Vercel for `production` (and `preview` where needed):

```bash
vercel env add DATABASE_URL production
vercel env add ADMIN_PASSWORD production
vercel env add CANONICAL_HOST production
vercel env add NEXT_PUBLIC_CANONICAL_HOST production
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production
# Ads tagging is optional. Do not set the rejected Exquisite Dentistry Ads fallback.
# vercel env add NEXT_PUBLIC_GOOGLE_ADS_TAG_ID production
# vercel env add NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_EVENT production
vercel env add FORMSPREE_APPOINTMENT_ENDPOINT production
vercel env add FORMSPREE_CONTACT_ENDPOINT production
vercel env add GA4_PROPERTY_ID production
vercel env add GSC_SITE_URL production
```

For this practice, both Formspree endpoint values are
`https://formspree.io/f/mojngolr`. `ADMIN_PASSWORD` is the only admin sign-in credential;
do not create an `ADMIN_USERNAME` variable.

For Vercel, stream the service-account key into a sensitive base64 variable so the value does not
appear in command output or depend on a local runtime path:

```bash
node -e 'const fs=require("node:fs");process.stdout.write(fs.readFileSync(process.argv[1]).toString("base64"))' \
  /secure/path/service-account.json |
  vercel env add GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 production --sensitive
```

Never commit the JSON key, its base64 representation, or a pulled production env file.

Vercel Web Analytics does not require an app env var in this repo. It is controlled from the Vercel project dashboard plus the `@vercel/analytics` component already mounted in the app layout.

Inspect current env values:

```bash
vercel env ls
```

## Database Provisioning and Schema

1. Ensure `DATABASE_URL` points to the intended Vercel Postgres instance.
2. If the release adds migrations, identify which migration files are not yet applied and apply
only those files in numeric order. Never replay non-idempotent production migrations. **Do not use
`db:push`** — migrations 0007–0009 contain PL/pgSQL functions and constraints that `db:push`
cannot create.

Two Neon-specific requirements, both of which fail loudly if you miss them. The `neondb_owner` role has an empty `search_path`, so unqualified table names in the migrations resolve to nothing and the first statement fails with `relation "contacts" does not exist`; you must set it explicitly. And Neon's **pooled** endpoint rejects `search_path` as a startup parameter, so the migration run has to go over `DATABASE_URL_UNPOOLED`. Run the verified unapplied set in one transaction so a mid-run failure rolls everything back.

The command below is for a **fresh database bootstrap only**. For an existing production database,
remove every `-f` entry except the files independently verified as unapplied:

```bash
PGOPTIONS="--search_path=public" psql "$DATABASE_URL_UNPOOLED" \
  -v ON_ERROR_STOP=1 --single-transaction \
  -f drizzle/0000_base_schema.sql \
  -f drizzle/0001_growth_lead_attribution.sql \
  -f drizzle/0002_closed_loop_lead_pipeline.sql \
  -f drizzle/0003_public_form_contract.sql \
  -f drizzle/0004_google_ads_lead_ingestion.sql \
  -f drizzle/0005_notification_outbox.sql \
  -f drizzle/0006_outbox_lease_fields.sql \
  -f drizzle/0007_reconciliation.sql \
  -f drizzle/0008_reconciliation_lease.sql \
  -f drizzle/0009_finalize_function.sql
```

`0000_base_schema.sql` makes a fresh database bootstrapable and is safe to run against an existing database because it uses `IF NOT EXISTS`. Migration `0009` creates the `finalize_reconciliation_run()` PL/pgSQL function required by the reconciliation service.

Before running `0004` against a database with existing rows, confirm nothing violates the constraints it tightens. `0004` replaces the request-type check and drops `NOT NULL` from `email`:

```bash
psql "$DATABASE_URL" -At -c \
  "select request_type, count(*) from contacts group by 1"
```

Every value must already be `contact`, `appointment`, or `google_ads_lead`.

3. Read the production schema back before deployment. This checks every public-form runtime column, required defaults and nullability, the submission UUID index, lifecycle indexes, validated state constraints, reconciliation tables, and the finalize function:

```bash
npm run db:verify
```

`db:verify` is SELECT-only. Use production credentials locally only in a controlled release window.
If credentials are pulled into a transient env file, create it with owner-only permissions, remove it
immediately after verification, and never commit or log it.

## Deploy Flow

### Git-integrated production release (default)

After applying the migration, verifying its read-back, and passing local checks, push the reviewed
commit to `main`. Wait for the Git-connected Vercel deployment whose source commit matches GitHub
`main`. When that deployment is `READY`, verify the production aliases and stop; do not create a
second deployment with the CLI.

### Guarded CLI fallback

If no matching Git deployment appears, run the guarded fallback from clean `main` aligned with
`origin/main`:

```bash
npm run release:prod -- --schema-synced
```

This script enforces:

1. clean git working tree
2. local `main` aligned with `origin/main`
3. GitHub default branch verified as `main` without changing repository settings
4. `.vercel/project.json` matches the production Vercel project for this repo
5. Vercel Git integration connected to this repo
6. required production env names present in Vercel without exposing their values
7. explicit confirmation that the production schema was applied and verified
8. full quality checks (`npm run quality:all`)
9. a recent-deployment check for the exact Git commit: `READY` exits successfully, an in-progress
   deployment exits with retryable status `75`, and a failed terminal state exits with an error
10. production deploy via Vercel CLI only when the exact commit has no production deployment

Use this fallback only when the Git-integrated deployment did not already create the intended
production release.

### Preview deploy

```bash
vercel
```

Validate preview URL before production promotion.

### Production deploy

```bash
vercel --prod
```

If you already ran `npm run release:prod -- --schema-synced`, do not run `vercel --prod` again unless intentionally creating another deployment.

## Post-Deploy Smoke Tests

Use production domain and preview domain checks.

### Route checks

```bash
curl -I https://www.famfirstsmile.com/
curl -I https://www.famfirstsmile.com/services
curl -I https://www.famfirstsmile.com/contact
curl -I https://www.famfirstsmile.com/book-appointment
curl -I https://www.famfirstsmile.com/tmj
```

### Redirect checks

```bash
curl -I https://www.famfirstsmile.com/hello-world
curl -I "https://www.famfirstsmile.com/?page_id=1073"
curl -I https://famfirstsmile.com/
curl -I https://www.famfirstsmile.com/services/tmj
curl -I "https://www.famfirstsmile.com/Book-Appointment?utm_source=google"
curl -I "https://www.famfirstsmile.com/Services/Invisalign?gclid=test"
```

The mixed-case Ads routes should return `301`, use their lowercase canonical paths, and preserve
the supplied campaign parameters.

### SEO asset checks

```bash
curl -I https://www.famfirstsmile.com/robots.txt
curl -I https://www.famfirstsmile.com/sitemap.xml
curl -I https://www.famfirstsmile.com/llms.txt
```

### Vercel analytics checks

1. Open the latest production deployment in a browser.
2. Visit at least two public routes such as `/` and `/services`.
3. Wait roughly 30-60 seconds and confirm traffic appears in the Vercel Analytics dashboard.
4. If no data appears, disable content blockers and retry navigation between pages.

### Non-mutating API checks

These deliberately invalid payloads verify the live guards without creating a lead or triggering an office notification. Submit realistic synthetic leads only in preview/non-production.

```bash
curl -i -X POST https://www.famfirstsmile.com/api/contacts \
  -H "Content-Type: application/json" \
  -d '{}'

curl -i -X POST https://www.famfirstsmile.com/api/appointments \
  -H "Content-Type: application/json" \
  -d '{}'
```

Both should return `400` and must not create a database row.

Admin unauthorized check:

```bash
curl -i https://www.famfirstsmile.com/api/admin/contacts
```

For the authorized check, use the password-manager-backed browser session: sign in at
`/admin/login`, then request `/api/admin/contacts?limit=1&offset=0` in the same session and confirm
only the `200` status. Do not interpolate `ADMIN_PASSWORD` into a command, and do not copy patient
records into terminal output, logs, or screenshots.

## Rollback Strategy

1. In Vercel dashboard, promote previous known-good deployment.
2. If issue is env-related, correct env vars and redeploy.
3. If issue is schema-related, restore DB and redeploy previous commit.
4. Keep a short incident note in release logs.

## GitHub Workflow

Recommended deployment discipline:

1. open PR from `codex/*` -> `main`
2. require CI success (`typecheck`, `lint`, `test`, design/minimal guards, `build`, E2E)
3. squash merge
4. deploy from clean `main`

Useful commands:

```bash
gh pr create
gh pr view --web
gh run list
```
