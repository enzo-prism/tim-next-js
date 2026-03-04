# Environment Variables

Copy `.env.example` to `.env.local` for local development.

```bash
cp .env.example .env.local
```

## Required in Production

- `DATABASE_URL`
  - Postgres connection string
  - Required for contact persistence and admin contacts listing
- `ADMIN_PASSWORD`
  - Required by middleware for `/admin` and `/api/admin/*`
  - If missing in production, admin routes return `503 missing_config`

## Core Site and Canonical

- `CANONICAL_HOST`
  - Server-side canonical host and metadata base
  - default fallback: `https://famfirstsmile.com`
- `NEXT_PUBLIC_CANONICAL_HOST`
  - Client-visible canonical host override where needed

## Tracking (Public Variables)

These are exposed to the browser because they are prefixed with `NEXT_PUBLIC_`.

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
  - default fallback: `G-L7MH47XYXL`
- `NEXT_PUBLIC_GOOGLE_ADS_TAG_ID`
  - default fallback: `AW-11373090310`
- `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_EVENT`
  - default fallback: `ads_conversion_Submit_lead_form_1`
- `NEXT_PUBLIC_HOTJAR_ID`
  - default fallback: `6487571`
- `NEXT_PUBLIC_HOTJAR_SNIPPET_VERSION`
  - default fallback: `6`
- `NEXT_PUBLIC_APPOINTMENT_FORM_URL`
  - default fallback Typeform URL

## Admin Analytics Variables

- `GA4_PROPERTY_ID`
  - used by `/api/admin/ga4/overview`
  - expected format: numeric property ID (for this site currently `518867337`)
- `GSC_SITE_URL`
  - used by `/api/admin/gsc/overview`
  - either:
    - `sc-domain:famfirstsmile.com`
    - `https://famfirstsmile.com/`

## Google Service Account Credentials (One Required Mode)

At least one credential mode must be configured for GA4/GSC admin APIs:

1. `GOOGLE_SERVICE_ACCOUNT_JSON`
   - raw JSON key as string
2. `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`
   - base64-encoded JSON key
3. `GOOGLE_APPLICATION_CREDENTIALS`
   - absolute file path to JSON key (runtime file access required)

If none are set, admin analytics endpoints return:

```json
{
  "ok": false,
  "error": "missing_config",
  "missing": [
    "GOOGLE_SERVICE_ACCOUNT_JSON",
    "GOOGLE_SERVICE_ACCOUNT_JSON_BASE64",
    "GOOGLE_APPLICATION_CREDENTIALS"
  ]
}
```

## Local Development Notes

- Without `DATABASE_URL` in development:
  - app uses in-memory storage for contacts
- Without Google credentials:
  - GA4/GSC admin API routes return `503 missing_config`

## Vercel Notes

- Set variables in all environments you actively use:
  - `production`
  - `preview`
  - `development`
- Useful commands:

```bash
vercel env ls
vercel env add <NAME> production
vercel env pull .env --environment=development
```
