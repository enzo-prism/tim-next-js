# Growth and Lead Measurement

## Purpose

The public site is designed around one primary outcome: help a qualified local visitor confidently request a new-patient appointment. Calls, contact messages, and appointment requests are measured separately so acquisition quality and funnel loss can be diagnosed without collecting health details in analytics.

## Primary Patient Paths

1. Local search or campaign landing page -> service proof -> service-prefilled appointment request.
2. Homepage -> appointment request or direct phone call.
3. Educational article -> relevant service -> appointment request.
4. Contact page -> general question or direct phone/map action.

Appointment links use `buildAppointmentUrl(...)` to carry a closed service ID and a short CTA source. Patient-facing claims must remain verifiable; review totals include their verification date.

## Funnel Events

| Stage | Event | Meaning |
| --- | --- | --- |
| Intent | `cta_click` | Visitor chose an appointment CTA; this is not a conversion. |
| Engagement | `form_start` | Visitor first focused a lead form. |
| Step | `appointment_step_view` | One of the two booking steps was shown. |
| Step | `appointment_step_complete` | A booking step passed client validation. |
| Funnel loss | `appointment_form_abandon` | A started booking flow exited before a durable lead. |
| Attempt | `form_submit_attempt` | Visitor attempted to submit. |
| Lead | `generate_lead` | A new lead was durably persisted. |
| Delivery risk | `form_submit_fallback` | Lead was saved but office relay was delayed. |
| Error | `form_submit_error` | Validation or request failure prevented completion. |
| Phone | `phone_click` | Visitor chose a phone call path. |

The Google Ads appointment conversion fires only for a newly created durable appointment lead. Its `transaction_id` is the submission UUID, which prevents conversion duplication on retries.

## Persisted Attribution

The first touch within the browser session can persist:

- landing page path
- external referrer hostname
- CTA source
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- `gclid`, `gbraid`, `wbraid`
- consent flag and consent-copy version
- submission UUID

Attribution values are length-bounded. Analytics payloads use an allow-list and exclude names, email addresses, phone numbers, free-text messages, form contents, health details, and URL query strings.

## Reliability Rules

- Persist before notifying the office.
- Treat the submission UUID as an idempotency key and enforce it with a unique production index.
- On Formspree failure, keep the database lead, show a call fallback, and retain `formspreeStatus="failed"` for staff follow-up.
- Reject unknown service IDs, past appointment dates, oversized bodies, untrusted browser origins, honeypot submissions, and excessive repeated attempts.
- Do not use Hotjar or session replay on patient-facing flows.

## Operating Metrics

Review these by landing page, service, campaign, and device where volume permits:

1. Qualified traffic: local organic/campaign landing sessions.
2. CTA rate: `cta_click / landing sessions`.
3. Form-start rate: `form_start / appointment-page sessions`.
4. Completion rate: `generate_lead / form_start`.
5. Failure rate: `(form_submit_error + form_submit_fallback) / form_submit_attempt`.
6. Call intent: `phone_click / landing sessions`.
7. Booking rate: admin `booked / leads` by stored source.
8. Arrival rate: admin `arrived / leads` by stored source.

Office staff maintain the outcome in the protected admin dashboard using `new`, `contacted`, `booked`, `arrived`, `no-show`, or `lost`. Private notes and lost reasons stay in Postgres and are never copied into public analytics.

Search Console opportunities pair each query with its ranking page, keep average positions 4-20, and rank candidates using impressions, proximity to position 4, and remaining CTR headroom. Use the score to choose content/CTA tests; do not treat it as a traffic forecast.

Do not optimize only for raw form volume. The durable business outcome is confirmed new-patient appointments, while analytics and stored attribution explain which pages and campaigns contributed.

## Release Verification

Before production deployment:

1. Apply all `drizzle/*.sql` migrations in numeric order to the intended production database, including the safe `0000` baseline and public-form contract migration.
2. Run `npm run db:verify` against that database.
3. Confirm GA4, Ads, Formspree, canonical host, and both admin credentials are configured.
4. Run `npm run quality:all` and CI E2E.
5. Test one realistic synthetic submission in preview, not production.
6. After deployment, use invalid public API payloads for non-mutating guard checks and verify authorized admin access using status-only output.
