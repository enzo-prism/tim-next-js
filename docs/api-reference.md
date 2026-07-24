# API Reference

All APIs are implemented as Next.js route handlers in `src/app/api/**`.

## Authentication Model

- Public endpoint:
  - `POST /api/contacts`
  - `POST /api/appointments`
- Admin endpoints (Basic Auth required, enforced by middleware):
  - `/api/admin/*`

Unauthorized admin calls return:

- `401`
- `WWW-Authenticate: Basic realm="Admin"`
- JSON: `{ ok: false, error: "unauthorized", message: "Unauthorized" }`

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
- `413`: request body exceeds 32,000 bytes
- `415`: content type is not JSON
- `429`: per-instance submission limit exceeded
- `500`
  - `{ "success": false, "message": "Failed to submit appointment request" }`

## `GET /api/admin/changelog`

Returns recent git commit history for admin dashboard display.

Behavior:

- Uses in-memory cache (TTL 60 seconds).
- Tries to read `public/admin-changelog.json` if present.
- Falls back to runtime `git log` generation.

Success response:

```json
{
  "generatedAt": "2026-03-04T20:00:00.000Z",
  "entries": [
    {
      "hash": "abc123...",
      "shortHash": "abc1234",
      "date": "2026-03-04",
      "subject": "Commit message",
      "url": "https://github.com/org/repo/commit/abc123..."
    }
  ]
}
```

Error responses:

- `503` when changelog cannot be generated
- `500` on read/parse failures

## `GET /api/admin/contacts?limit=&offset=&q=&status=&source=`

Query paginated contact submissions.

Query params:

- `limit`:
  - default `50`
  - clamped to `1..200`
- `offset`:
  - default `0`
  - minimum `0`
- `q`:
  - optional search string
  - trimmed and truncated to 200 chars
- `status`: optional lifecycle value (`new`, `contacted`, `booked`, `arrived`, `no-show`, `lost`)
- `source`: optional normalized stored acquisition source

Search fields:

- first name
- last name
- email
- phone
- service
- message
- request type
- preferred date
- preferred time
- Formspree status

Success response:

```json
{
  "total": 123,
  "items": [
    {
      "id": "uuid",
      "createdAt": "2026-03-04T19:57:52.452Z",
      "firstName": "Smoke",
      "lastName": "Test",
      "email": "smoke@example.com",
      "phone": "555-111-2222",
      "service": "dental-exams",
      "message": "Deployment smoke test",
      "requestType": "appointment",
      "preferredDate": "2026-08-10",
      "preferredTime": "morning",
      "formspreeStatus": "delivered",
      "leadStatus": "booked",
      "contactedAt": "2026-07-16T16:00:00.000Z",
      "bookedAt": "2026-07-16T16:10:00.000Z",
      "arrivedAt": null,
      "lostReason": null,
      "staffNotes": "Confirmed by phone"
    }
  ]
}
```

The response also includes `sourceSummary`, an array of source-level `leads`, `booked`, `arrived`, `bookingRate`, and `arrivalRate` values.

Error response:

- `500`
  - `{ "ok": false, "error": "server_error", "message": "..." }`

## `PATCH /api/admin/contacts/:id`

Update a protected lead lifecycle record. The JSON body accepts `leadStatus`, `lostReason`, and `staffNotes`; at least one is required. `lostReason` is required when setting `leadStatus` to `lost`. The server sets lifecycle timestamps rather than trusting client timestamps.

## `GET /api/admin/ga4/overview?days=7|30|90`

Returns GA4 overview metrics.

Dependencies:

- `GA4_PROPERTY_ID` (or legacy aliases in code)
- Google service account credentials

Caching:

- in-memory cache keyed by range, TTL 10 minutes

Success shape:

```json
{
  "range": { "days": 30, "startDate": "2026-02-03", "endDate": "2026-03-03" },
  "totals": { "activeUsers": 1234, "sessions": 2345, "screenPageViews": 3456 },
  "series": [{ "date": "2026-03-01", "activeUsers": 12, "sessions": 22, "screenPageViews": 33 }],
  "topPages": [{ "pagePath": "/services", "screenPageViews": 100 }]
}
```

Missing config response:

- `503`
  - `{ "ok": false, "error": "missing_config", "message": "...", "missing": [...] }`

Server error response:

- `500`
  - `{ "ok": false, "error": "server_error", "message": "..." }`

## `GET /api/admin/gsc/overview?days=7|30|90`

Returns Google Search Console overview metrics.

Dependencies:

- `GSC_SITE_URL`
- Google service account credentials

Caching:

- in-memory cache keyed by range, TTL 10 minutes

Success shape:

```json
{
  "range": { "days": 30, "startDate": "2026-02-03", "endDate": "2026-03-03" },
  "totals": { "clicks": 123, "impressions": 4567, "ctr": 0.0269, "position": 18.2 },
  "series": [{ "date": "2026-03-01", "clicks": 5, "impressions": 140, "ctr": 0.035, "position": 17.8 }],
  "topQueries": [{ "query": "family dentist los gatos", "clicks": 10, "impressions": 120, "ctr": 0.083, "position": 5.2 }],
  "topPages": [{ "page": "https://www.famfirstsmile.com/services", "clicks": 20, "impressions": 300, "ctr": 0.066, "position": 7.5 }],
  "queryPageRows": [{ "page": "https://www.famfirstsmile.com/services/invisalign", "query": "invisalign los gatos", "clicks": 4, "impressions": 300, "ctr": 0.013, "position": 8 }],
  "searchOpportunities": [{ "page": "https://www.famfirstsmile.com/services/invisalign", "query": "invisalign los gatos", "clicks": 4, "impressions": 300, "ctr": 0.013, "position": 8, "opportunityScore": 226.41 }]
}
```

Missing config response:

- `503`
  - `{ "ok": false, "error": "missing_config", "message": "...", "missing": [...] }`

Server error response:

- `500`
  - `{ "ok": false, "error": "server_error", "message": "..." }`
