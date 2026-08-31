# API Reference

All APIs are implemented as Next.js route handlers in `src/app/api/**`.

## Authentication Model

- Public endpoints:
  - `POST /api/contacts`
  - `POST /api/appointments`
- Cron-authenticated operational endpoints:
  - `GET|POST /api/admin/notifications/process`
  - `GET /api/admin/reconciliation/run`
- Retired staff-dashboard endpoints 404:
  - `/admin`, `/admin/login`
  - `/api/admin/contacts`, `/api/admin/session`, `/api/admin/changelog`
  - `/api/admin/ga4/overview`, `/api/admin/gsc/overview`

Cron jobs authenticate with `Authorization: Bearer $CRON_SECRET`. Missing configuration returns `503 cron_not_configured`. Invalid credentials return `401`.

## Data Types

### Contact Payload (`InsertContact`)

Defined by `insertContactSchema` in `src/server/schema.ts`:

- `firstName`: string, required
- `lastName`: string, required
- `email`: string, required
- `phone`: string, optional
- `service`: closed service ID, `"other"`, or empty, optional
- `message`: string, optional
- `consentToContact`: boolean `true`, required
- `consentVersion`: current version string, required
- `submissionId`: UUID, required for duplicate protection
- first-touch attribution fields: optional (`landingPage`, `referrer`, `ctaSource`, UTM fields, and Google click IDs)

### Appointment Payload (`InsertAppointment`)

Defined by `insertAppointmentSchema` in `src/server/schema.ts`:

- `firstName`: string, required
- `lastName`: string, required
- `email`: string, required
- `phone`: string, required
- `service`: closed service ID, required
- `preferredDate`: `YYYY-MM-DD`, optional
- `preferredTime`: `"morning" | "afternoon" | "flexible"`, optional
- `message`: string, optional
- `consentToContact`: boolean `true`, required
- `consentVersion`: current version string, required
- `submissionId`: UUID, required for duplicate protection
- first-touch attribution fields: optional (`landingPage`, `referrer`, `ctaSource`, UTM fields, and Google click IDs)

### Stored Contact Record Fields

The `contacts` table now also includes:

- `requestType`: `"contact"` or `"appointment"`
- `preferredDate`: string or null
- `preferredTime`: string or null
- `formspreeStatus`: `"failed" | "sending" | "delivered" | null`
- `submissionId`: unique browser-generated UUID
- campaign, landing-page, referrer, and CTA attribution fields
- contact consent and consent-version fields
- lifecycle fields: `leadStatus`, `contactedAt`, `bookedAt`, `arrivedAt`, `lostReason`, and private `staffNotes`

## Endpoints

### Notification delivery state

Before either public endpoint calls Formspree, it atomically claims the stored lead by changing `formspreeStatus` from `failed` to `sending`. A known relay failure changes it back to `failed`, which allows a later retry. A successful relay changes it to `delivered`.

`sending` is never reclaimed automatically because Formspree does not provide a verified idempotency key. If the process stops after the provider call, or delivery succeeds but the final database update fails, the row stays `sending` and requires manual reconciliation. This prevents an automatic retry from sending the office a duplicate notification.

The submission UUID is bound to the form type and normalized stored payload. An exact retry reuses the stored row and relays only its canonical data. Reusing a UUID for changed data or the other public form returns `409`.

## `POST /api/contacts`

Persist a contact submission and notify the office through Formspree.

Request body:

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "555-123-4567",
  "service": "invisalign",
  "message": "Interested in a consult",
  "consentToContact": true,
  "consentVersion": "2026-07-15",
  "submissionId": "0d9f6471-7120-4b5a-a1af-e1f77b0dcacf",
  "landingPage": "/services/invisalign",
  "utmSource": "google"
}
```

Responses:

- `201` (new lead persisted and notification delivered)
  - `{ "success": true, "created": true, "delivered": true, "leadId": "...", "serviceId": "invisalign" }`
- `200` (duplicate already delivered)
  - `{ "success": true, "created": false, "delivered": true, "leadId": "...", "serviceId": "invisalign" }`
- `202` (lead persisted, notification not confirmed)
  - `{ "success": true, "created": true, "delivered": false, "leadId": "...", "serviceId": "invisalign", "fallbackMessage": "..." }`
- `400`
  - `{ "success": false, "message": "Invalid form data", "errors": [...] }`
- `403`: untrusted browser origin
- `409`: submission UUID is already bound to different form data
- `413`: request body exceeds 32,000 bytes
- `415`: content type is not JSON
- `429`: per-instance submission limit exceeded
- `500`
  - `{ "success": false, "message": "Failed to submit contact form" }`

## `POST /api/appointments`

Create an appointment request, persist it internally, then relay to Formspree.

Request body:

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "555-123-4567",
  "service": "invisalign",
  "preferredDate": "2026-08-10",
  "preferredTime": "morning",
  "message": "Morning is best",
  "consentToContact": true,
  "consentVersion": "2026-07-15",
  "submissionId": "0d9f6471-7120-4b5a-a1af-e1f77b0dcacf"
}
```

Responses:

- `201` (DB + Formspree delivered)
  - `{ "success": true, "created": true, "delivered": true, "leadId": "...", "serviceId": "invisalign" }`
- `200` (duplicate already delivered)
  - `{ "success": true, "created": false, "delivered": true, "leadId": "...", "serviceId": "invisalign" }`
- `202` (DB persisted, Formspree notification not confirmed)
  - `{ "success": true, "created": true, "delivered": false, "leadId": "...", "serviceId": "invisalign", "fallbackMessage": "..." }`
- `400`
  - `{ "success": false, "message": "Invalid appointment data", "errors": [...] }`
- `403`: untrusted browser origin
- `409`: submission UUID is already bound to different form data
- `413`: request body exceeds 32,000 bytes
- `415`: content type is not JSON
- `429`: per-instance submission limit exceeded
- `500`
  - `{ "success": false, "message": "Failed to submit appointment request" }`

## `GET|POST /api/admin/notifications/process`

Cron job that retries Formspree office notifications from the outbox. Requires `Authorization: Bearer $CRON_SECRET`.

## `GET /api/admin/reconciliation/run`

Cron job that compares stored leads with provider records when `RECONCILIATION_ENABLED=true`. Requires `Authorization: Bearer $CRON_SECRET`. Outcomes are redacted and do not include patient contact details.

The former staff-dashboard APIs (`/api/admin/contacts`, `/api/admin/session`, `/api/admin/changelog`, `/api/admin/ga4/overview`, `/api/admin/gsc/overview`) are removed and 404.
