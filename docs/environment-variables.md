# Environment Variables

Copy `.env.example` to `.env.local` for local development.

```bash
cp .env.example .env.local
```

## Required in Production

- `DATABASE_URL`
  - Postgres connection string
  - Required for contact and appointment persistence

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

## Capture, cron, and staff alerts (server variables)

These fail closed when unset. Generate secrets with `openssl rand -hex 32`. Do not put them in git.

- `CRON_SECRET`
  - required for `/api/admin/notifications/process` and `/api/admin/reconciliation/run`
  - Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically once the env exists
- `GOOGLE_ADS_WEBHOOK_KEY`
  - required for `POST /api/webhooks/google-ads`
  - paste the same value as `google_key` on the Google Ads Lead Form webhook pointing at `https://www.famfirstsmile.com/api/webhooks/google-ads`
- `RECONCILIATION_ENABLED`
  - set to `true` only after provider credentials below are in place
- `FORMSPREE_API_KEY`
  - Formspree Forms API key that can list submissions for form `mojngolr`
- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `GOOGLE_ADS_CUSTOMER_ID`
  - Family First account `353-904-6031`; dashes optional
- `GOOGLE_ADS_OAUTH_CLIENT_ID`
- `GOOGLE_ADS_OAUTH_CLIENT_SECRET`
- `GOOGLE_ADS_REFRESH_TOKEN`
- `LEAD_DASHBOARD_NOTIFICATIONS_ENABLED`
  - set to `true` to send no-PII “new lead” alerts from the outbox
- `LEAD_DASHBOARD_NOTIFICATION_RECIPIENTS`
  - comma-separated staff emails for the alert webhook
- `LEAD_DASHBOARD_URL`
  - optional link included in the alert body; the live staff board is `https://chuang-leads-dashboard.vercel.app`
- `LEAD_NOTIFICATION_WEBHOOK_URL`
  - HTTPS endpoint that accepts `{ subject, body, to, metadata }` with no patient fields

## Local Development Notes

- Without `DATABASE_URL` in development:
  - app uses in-memory storage for contacts

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

## Delivery health and outcomes

- `CRON_SECRET` also protects `/api/admin/lead-health`, scheduled every 15 minutes.
- `LEAD_HEALTH_ALERT_WEBHOOK_URL`: optional HTTPS receiver for actionable issue changes and recovery; no patient fields. Without a receiver, health remains available to a protected external monitor.
- `LEAD_HEALTH_ALERT_RECIPIENTS`: optional comma-separated staff addresses for this receiver.
- `LEAD_HEALTH_STAFF_ALERTS_REQUIRED` / `LEAD_HEALTH_RECONCILIATION_REQUIRED`: set to `true` only when the practice requires those integrations; health then flags missing configuration.
- `LEAD_OUTCOMES_SECRET`: separate server-only bearer secret, at least 32 characters, for outcome reads/writes and aggregate reports. Keep out of browser code and dashboards with public clients. Missing/short secret disables these APIs with 503.

Apply SQL migrations through `0012` before deploying the new server code. Existing staff dashboard database permissions remain read-only. Configure an authorized server integration or use the outcome CLI; adding API code does not establish call-provider ingestion or Ads conversion imports.

## Delivery-health monitoring (server-only)

- `LEAD_HEALTH_ALERT_WEBHOOK_URL`: optional, enables action-only incident/change/recovery webhook alerts. Use an independent route from generic lead alerts and support `Idempotency-Key`.
- `LEAD_HEALTH_ALERT_RECIPIENTS`: optional comma-separated recipients; otherwise the webhook owns routing.
- `LEAD_HEALTH_STAFF_ALERTS_REQUIRED`: defaults false; true makes missing/disabled staff-alert configuration an incident.
- `LEAD_HEALTH_RECONCILIATION_REQUIRED`: defaults false; true makes disabled reconciliation an incident.
- Existing `CRON_SECRET` also protects `/api/admin/lead-health`. Apply migration 0011 before deployment.

See [Saved requests and delivery monitoring](./lead-delivery-reliability.md) for heartbeat thresholds and external-monitor escalation when the database or health cron is unavailable.
