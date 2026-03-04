# API Reference

All APIs are implemented as Next.js route handlers in `src/app/api/**`.

## Authentication Model

- Public endpoint:
  - `POST /api/contacts`
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
- `service`: string, optional
- `message`: string, optional

## Endpoints

## `POST /api/contacts`

Create a contact submission.

Request body:

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "555-123-4567",
  "service": "Invisalign",
  "message": "Interested in a consult"
}
```

Responses:

- `201`
  - `{ "success": true, "contact": { ... } }`
- `400`
  - `{ "success": false, "message": "Invalid form data", "errors": [...] }`
- `500`
  - `{ "success": false, "message": "Failed to submit contact form" }`

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

## `GET /api/admin/contacts?limit=&offset=&q=`

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

Search fields:

- first name
- last name
- email
- phone
- service
- message

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
      "service": "Dental Exams",
      "message": "Deployment smoke test"
    }
  ]
}
```

Error response:

- `500`
  - `{ "ok": false, "error": "server_error", "message": "..." }`

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
  "topPages": [{ "page": "https://famfirstsmile.com/services", "clicks": 20, "impressions": 300, "ctr": 0.066, "position": 7.5 }]
}
```

Missing config response:

- `503`
  - `{ "ok": false, "error": "missing_config", "message": "...", "missing": [...] }`

Server error response:

- `500`
  - `{ "ok": false, "error": "server_error", "message": "..." }`
