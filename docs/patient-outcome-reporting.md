# Patient outcome reporting

The website now supports protected machine-to-machine outcome ingestion and aggregate cohort reporting. The public `/admin` UI remains removed. The separately hosted leads dashboard is SELECT-only; this change does not modify it, grant write permissions, or connect a telephone provider.

## Deployment and remaining connection work

Apply `drizzle/0012_patient_outcomes.sql` to the same durable database as the lead ledger, and configure a **dedicated** random `LEAD_OUTCOMES_SECRET` of at least 32 characters in the website and the authorized staff integration. Do not reuse the cron/import secret or expose this token in a browser, query string, Git, or analytics. All endpoints fail closed without this secret or a database; development in-memory storage is intentionally unavailable to these endpoints. The new call ledger does not contain caller names, phone numbers, email, recordings, transcripts, free-text notes, or clinical details.

The real practice-management and telephone-provider connections are **pending configuration**. Until an authorized staff system or operator supplies outcomes, report completeness will remain low and call totals may be zero. Zero calls means no ingested call records, not proof of zero telephone inquiries. No Ads/GA4 credentials or live conversion mappings were changed. A website deployment alone does not complete this integration.

## API contract

Every request uses `Authorization: Bearer <LEAD_OUTCOMES_SECRET>`. JSON mutation bodies are strict and bounded to 8 KiB. Unknown fields are rejected. Responses are private/no-store, suppress database exceptions and PII, and do not send outcome information to browser analytics.

- `GET /api/admin/outcomes?leadId=<UUID>` returns only a non-test lead's current `status` and `updatedAt` for optimistic concurrency; it returns no contact details.
- `POST /api/admin/outcomes` accepts `{leadId, status, expectedUpdatedAt, lostReason?}`. Known statuses: `new`, `contacted`, `booked`, `arrived`, `no-show`, `lost`. A `lost` status requires one operational reason: `unreachable`, `declined`, `not-a-fit`, `duplicate`, or `other`. Use existing storage lifecycle logic; an outdated timestamp returns 409. Read fresh state before resolving a conflict. Lead milestone timestamps reflect when staff record the lifecycle in this website, not a backdated appointment time. Test leads are excluded from read/write endpoints.
- `POST /api/admin/outcomes/calls` accepts `{provider, callId, occurredAt, sourceObservedAt, status, source?, campaign?, linkedLeadId?}`. Both times are ISO timestamps with offsets. `sourceObservedAt` cannot precede `occurredAt` or be more than five minutes in the future. `source` is one of `google-ads`, `meta`, `microsoft-ads`, `organic`, `direct`, `referral`, `other`, `unknown`. Provider/campaign are nonpersonal machine keys (lowercase letters, digits, dot, hyphen, underscore; 80 characters maximum), and `callId` is an opaque identifier (letters, digits, hyphen, underscore; 128 maximum). Never use a caller's phone number as `callId` or names in attribution keys. Supply only metadata, never caller/clinical data. A linked lead must exist and be non-test.
- `GET /api/admin/outcomes/report?start=YYYY-MM-DD&end=YYYY-MM-DD` returns an inclusive, at-most-365-day cohort with source, canonical landing page and opaque campaign grouping. A date cohort is based on first inquiry/creation, not the day an appointment is attended. It includes eventual outcomes known at query time, so historical cohorts can change as staff record outcomes.

Call identity is unique on `(provider, callId)`. Exact retry returns `duplicate`. Only a strictly newer observation can update an existing call; stale or same-time conflicting messages return 409. `occurredAt` is immutable to preserve cohort identity. A call can acquire a lead link later, but an existing link cannot be switched to another lead. Booking and attendance milestones survive later status changes. For historical imports, preserve each original observation time and send in order. The endpoint records caller events, not unique people; separate calls by the same person require a lead link for deduplication.

## Reading the report correctly

Lead totals exclude `is_test = true` rows. Calls linked to a lead contribute booking/attendance milestones to that lead once, including when staff have not yet updated its lead status. Multiple linked calls do not multiply lead milestones. The current lead status remains owned by the staff system; report `currentStatuses.new` can therefore coexist with a recorded linked-call booking or attendance milestone. Send a separate concurrency-protected lead update when staff need to reconcile its current status.

Unlinked calls are reported **separately**; linked calls are excluded from these call totals. Do not add lead and call totals and call the result unique patients. A linked call within the selected dates may link to a lead created outside those dates; it will be included only in that lead's creation cohort, and `linkedCallsExcluded` makes that exclusion visible. `everBooked` and `everArrived` count records with retained milestones. `arrived` describes an attended visit; it does not establish a unique patient or a **new** patient. Confirm new-patient status against the practice's patient records before claiming patient acquisition.

`outcomeCompleteness` is the share of cohort records with a current status other than `new` or a booking/attendance milestone. It measures recorded follow-up, not whether the practice schedule is fully reconciled. Recently received inquiries naturally need more time. To judge acquisition, compare matured cohorts, follow up on old `new` records, reconcile against actual practice bookings/attendance, and track the manual/system reporting cadence. No provider heartbeat or completeness of historical phone import is implied.

Source classification requires paid medium or a Google click identifier to label generic `google` traffic as Google Ads; `google` + `organic` remains Google organic, and unspecified Google traffic remains unspecified. Explicit provider `google-ads` is treated as paid. The current source data can still be missing/mistagged and requires integration verification. Arbitrary raw source text is collapsed into `Other / unknown`. Landing pages are checked against canonical public routes, query strings are removed, and unrecognized paths are collapsed. Campaign values are returned as deterministic opaque SHA-256-derived keys rather than raw labels; the authorized source system can calculate the same key for approved nonpersonal campaign IDs. Campaign labels should never contain personal data; hashing is an extra output minimization step, not permission to ingest PII.

Date grouping uses `America/Los_Angeles`, including daylight-saving boundaries. Existing `contacts.created_at` is a timestamp without time zone and is interpreted as UTC, matching the deployment's UTC database convention. Confirm the database timezone (`SHOW timezone`) and historical storage convention before relying on imported history from another deployment. New call timestamps use `timestamptz` and explicit offsets.

Saved website requests, browser conversion events, Google Ads conversions, bookings, and attended visits represent different stages. Consent, blocked scripts, repeated clicks, imported Ads leads and delayed outcomes can create differences between the durable ledger and consented analytics. Do not treat those differences as lost leads by default. Audit the Google Ads conversion-action mapping and consented-event coverage separately, then reconcile aggregate periods without sending names, phone numbers, email, private clinical details, free-text messages, or appointment details to analytics. This implementation does not automatically upload offline conversions or claim that Ads mapping has been confirmed.

## Operator helper

Create a JSON file in a private working directory with the API payload. Start with a review-only run:

```sh
node scripts/record-patient-outcome.mjs --kind lead --payload work/lead-outcome.json
node scripts/record-patient-outcome.mjs --kind call --payload work/call-outcome.json
```

The helper prints only the validated review payload and endpoint and performs no network request by default. Keep opaque identifiers and linkage files private. When the operator intentionally invokes `--send`, the helper writes the payload, using `LEAD_OUTCOMES_ORIGIN` (for example `https://www.famfirstsmile.com`) and the dedicated secret already set securely in the environment. Remote origins must use HTTPS; loopback HTTP is supported for local testing. Redirects are refused so the bearer token is not forwarded. Avoid inline secrets in shell history. If a request times out, read state before retrying a lead update; call retries with identical identity/observation/payload are idempotent.

```sh
node scripts/record-patient-outcome.mjs --kind lead --payload work/lead-outcome.json --send
```

Test only against an isolated `_test` database. Do not submit sample outcomes to production. Unit/API tests cover authentication, strict payloads, size limits, concurrency conflicts and privacy. PostgreSQL tests cover actual optimistic updates, call retry/stale behavior, link validation, deduplicated milestones, test-row exclusion and Los Angeles DST cohort boundaries.
