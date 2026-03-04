# Deployment on Vercel

## Goal

Deploy the Next.js app from `main` to Vercel with full production parity:

- public routes and redirects
- admin auth and APIs
- contact persistence (Postgres)
- SEO assets (`robots.txt`, `sitemap.xml`, `llms.txt`)

## Prerequisites

1. Access to GitHub repo: `enzo-prism/tim-next-js`
2. Access to linked Vercel project
3. CLI tools installed and authenticated:
   - `gh auth status`
   - `vercel whoami`
4. Production secrets available:
   - `DATABASE_URL`
   - `ADMIN_PASSWORD`
   - analytics variables from `docs/environment-variables.md`

## One-Time Project Linking

If not already linked:

```bash
vercel link
```

This repo currently contains `.vercel/project.json`, so it is already linked unless intentionally reset.

## Pre-Deploy Local Checks

Run from repo root:

```bash
npm ci
npm run check
npm run build
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
vercel env add NEXT_PUBLIC_GOOGLE_ADS_TAG_ID production
vercel env add NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_EVENT production
vercel env add NEXT_PUBLIC_HOTJAR_ID production
vercel env add NEXT_PUBLIC_HOTJAR_SNIPPET_VERSION production
vercel env add NEXT_PUBLIC_APPOINTMENT_FORM_URL production
vercel env add GA4_PROPERTY_ID production
vercel env add GSC_SITE_URL production
vercel env add GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 production
```

Inspect current env values:

```bash
vercel env ls
```

## Database Provisioning and Schema

1. Ensure `DATABASE_URL` points to the intended Vercel Postgres instance.
2. Apply schema:

```bash
npm run db:push
```

Use production credentials locally only in a controlled release window.

## Deploy Flow

### Preview deploy

```bash
vercel
```

Validate preview URL before production promotion.

### Production deploy

```bash
vercel --prod
```

## Post-Deploy Smoke Tests

Use production domain and preview domain checks.

### Route checks

```bash
curl -I https://famfirstsmile.com/
curl -I https://famfirstsmile.com/services
curl -I https://famfirstsmile.com/contact
curl -I https://famfirstsmile.com/tmj
```

### Redirect checks

```bash
curl -I https://famfirstsmile.com/hello-world
curl -I "https://famfirstsmile.com/?page_id=1073"
curl -I https://www.famfirstsmile.com/
curl -I https://famfirstsmile.com/services/tmj
```

### SEO asset checks

```bash
curl -I https://famfirstsmile.com/robots.txt
curl -I https://famfirstsmile.com/sitemap.xml
curl -I https://famfirstsmile.com/llms.txt
```

### API checks

Public:

```bash
curl -X POST https://famfirstsmile.com/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Deploy","lastName":"Test","email":"deploy@example.com"}'
```

Admin unauthorized check:

```bash
curl -i https://famfirstsmile.com/api/admin/contacts
```

Admin authorized check:

```bash
curl -i -u "admin:${ADMIN_PASSWORD}" "https://famfirstsmile.com/api/admin/contacts?limit=5&offset=0"
```

## Rollback Strategy

1. In Vercel dashboard, promote previous known-good deployment.
2. If issue is env-related, correct env vars and redeploy.
3. If issue is schema-related, restore DB and redeploy previous commit.
4. Keep a short incident note in release logs.

## GitHub Workflow

Recommended deployment discipline:

1. open PR from `codex/*` -> `main`
2. require CI success (`typecheck`, `lint`, `test`, `build`)
3. squash merge
4. deploy from clean `main`

Useful commands:

```bash
gh pr create
gh pr view --web
gh run list
```
