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
  - the only dashboard sign-in credential; `ADMIN_USERNAME` is intentionally unused
  - required in every deployed environment; there is no built-in password fallback
  - use a non-default, randomly generated value stored in the password manager
  - a successful sign-in creates an HTTP-only session cookie; missing configuration returns
    `503 missing_config`, and unauthenticated admin APIs return `401`

## Core Site and Canonical

- `CANONICAL_HOST`
  - Server-side canonical host and metadata base
  - default fallback: `https://www.famfirstsmile.com`
- `NEXT_PUBLIC_CANONICAL_HOST`
  - Client-visible canonical host override where needed

## Tracking (Public Variables)

These are exposed to the browser because they are prefixed with `NEXT_PUBLIC_`.

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
  - live ID: `G-L7MH47XYXL` (property `518867337`)
  - empty, whitespace, `G-54ESSN4BF8` (retired property `500238593`), and any other value are ignored
- `NEXT_PUBLIC_GOOGLE_ADS_TAG_ID`
  - optional; empty, whitespace, and the rejected Exquisite Dentistry Ads fallback are treated as unset
  - there is no default Ads tag
- `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_EVENT`
  - used only when a valid Ads tag is configured
  - default fallback: `ads_conversion_Submit_lead_form_1`
## Vercel Web Analytics

- no repo-level env var is required for Vercel Web Analytics in this codebase
- the integration is enabled by:
  - installing `@vercel/analytics`
  - mounting the analytics component in the app layout
  - turning on Web Analytics in the Vercel project dashboard
- data is collected from deployed environments after real visits; local development does not behave like production analytics

## Lead Notification Relays (Server Variables)

- `FORMSPREE_APPOINTMENT_ENDPOINT`
  - server-side relay target for `POST /api/appointments`
  - default fallback in code: `https://formspree.io/f/mojngolr`
  - keep configured in Vercel for explicit environment control
- `FORMSPREE_CONTACT_ENDPOINT`
  - server-side notification target for `POST /api/contacts`
  - falls back to the appointment endpoint when omitted
  - guarded production releases require both endpoint names explicitly; this practice uses
    `https://formspree.io/f/mojngolr` for both

## Admin Analytics Variables

- `GA4_PROPERTY_ID`
  - used by `/api/admin/ga4/overview`
  - expected format: numeric property ID (for this site currently `518867337`)
- `GSC_SITE_URL`
  - used by `/api/admin/gsc/overview`
  - either:
    - `sc-domain:famfirstsmile.com`
    - `https://www.famfirstsmile.com/`

## Google Service Account Credentials (One Required Mode)

At least one credential mode must be configured for GA4/GSC admin APIs:

1. `GOOGLE_SERVICE_ACCOUNT_JSON`
   - raw JSON key as string
2. `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`
   - base64-encoded JSON key
   - recommended for Vercel because it has no dependency on a runtime file path
   - add it as a sensitive production variable and never commit or print the decoded key
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
