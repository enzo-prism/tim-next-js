# Saved requests and delivery monitoring

## Patient receipt

A valid new contact or appointment request returns `202` only after the contact and its staff-alert outbox event are saved atomically. The response contains `success:true`, `created:true`, `delivered:false`, and `queued:true`. This is a normal receipt, not a delivery failure or a confirmed appointment. It does not ask the patient to call merely because delivery is pending.

Next.js `after()` attempts the office relay and staff alert after the response. The office relay may take up to eight seconds without holding the patient's receipt. If that callback never starts, the durable `failed` row remains eligible for the existing 15-minute retry worker. An already-delivered duplicate returns `200`, `created:false`, `delivered:true`, `queued:false`. The same UUID cannot be used for changed form data; older appointment rows with null preferences retain the equivalent default contact method and `self` visit preference.

The worker atomically claims `failed` as `sending` before calling Formspree. Explicit 4xx rejections, except 408, return the row to `failed`. Network failures, HTTP 408, HTTP 5xx, and a failed database write after delivery leave the claim `sending`: provider acceptance is uncertain. These rows require provider evidence and are never automatically reclaimed or resent. Reconciliation imports missing leads; it does not automatically resolve these ambiguous delivery claims.

The notification cron runs the office relay and generic staff-alert channels independently. A broken staff webhook cannot prevent Formspree retries, and a relay/storage failure cannot prevent the staff-alert channel from running. The cron records a persistent run heartbeat even on an idle day. Failed or indeterminate work returns `503` with redacted counters instead of reporting a successful empty batch.

## Protected health endpoint

`GET /api/admin/lead-health` requires `Authorization: Bearer $CRON_SECRET`, uses `Cache-Control:no-store`, and exposes only counters, ages, integration status, issue codes, and operational next actions. It does not return names, contact details, messages, lead IDs, or click IDs.

Apply `drizzle/0011_delivery_health.sql` after preceding migrations before deploying this monitor. It creates `lead_delivery_worker_state` and `lead_delivery_alert_state`, which contain no patient data. Missing monitoring tables produce a visible health failure rather than a silent healthy result.

The health job checks:

- notification worker has a successful heartbeat within 45 minutes, including on idle days;
- saved office notifications have not remained `failed` for more than 30 minutes;
- ambiguous `sending` claims have not remained unresolved for more than 15 minutes;
- configured staff alerts have no pending backlog older than 30 minutes and no exhausted retry events;
- enabled reconciliation has a successful run for both providers within 26 hours and no latest failed run.

Synthetic `is_test` contacts are excluded. A normally queued request below these age thresholds does not trigger an incident. A disabled optional integration does not make health fail; an explicitly enabled but incomplete staff-alert configuration is reported.

## Required versus optional integrations

Both flags default to false:

- `LEAD_HEALTH_STAFF_ALERTS_REQUIRED=true` reports staff-alert configuration as required even if the integration is disabled.
- `LEAD_HEALTH_RECONCILIATION_REQUIRED=true` reports reconciliation as required even if disabled.

Enable these requirements only after the relevant integration is intended to run. `RECONCILIATION_ENABLED` and existing staff-alert environment variables continue to control their jobs. No monitoring flag changes provider access or staff dashboard privileges.

## Actionable alerts

Set `LEAD_HEALTH_ALERT_WEBHOOK_URL` to enable health notifications through a server-side webhook. Optional `LEAD_HEALTH_ALERT_RECIPIENTS` is a comma-separated recipient list included as `to`; without it, the webhook owns routing. Health alerts are independent of the generic new-lead alert webhook, so delivery failures can still be reported through a different channel.

The webhook receives a JSON subject, an action-only body, and metadata describing health/recovery and check time. No patient data or raw error text is included. It must support the `Idempotency-Key` header for safe transport retries.

A database-backed claim prevents concurrent checks from sending the same health transition. An unchanged set of issue codes stays quiet. A changed incident or recovery produces one notification. Failed alert sends remain retryable after a bounded lease; notification failure itself makes the health endpoint return `503` for an external monitor to detect.

If the database is unreachable, this endpoint returns `503`. Webhook deduplication depends on that database, so it deliberately does not send uncontrolled repeat alerts during an outage. An external uptime monitor should probe the authenticated endpoint and own database-down escalation. Likewise, an external monitor is needed to detect failure of the health cron itself.

## Resolving uncertain delivery

Inspect the provider submission history using the internal submission UUID in the relay record. Confirmed delivered can be marked `delivered`; confirmed absent can be marked `failed` for the next retry. Never bulk-reset `sending` rows without provider evidence. Staff still need to work the saved request in the dedicated staff system, and a submitted request is not an appointment booking.

The default staff-alert destination is the separate `https://chuang-leads-dashboard.vercel.app` board. The public website does not recreate the retired `/admin` dashboard or grant additional database permissions to that board.

## Verification

Focused unit tests cover queued timing, post-response delivery, persistence failure, changed-UUID conflicts, single-contact-method intake, simultaneous claims, ambiguous sends, independent worker channels, configuration thresholds, authentication, and alert failures. Isolated Postgres integration tests cover real aggregation, migrations, heartbeat ordering, provider heartbeat ages, concurrent alert deduplication, and recovery notifications. All webhook requests are stubbed in automated tests; test schemas use only a `_test` database and are removed afterward.

A runnable independent monitor with persistent transition deduplication is included; see [Independent delivery monitoring](./independent-health-monitor.md).
