import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { db } from "@/server/db";
import { isNotificationEnabled } from "@/server/dashboard-notifications";

export type HealthDatabase = NonNullable<typeof db>;
export type HealthIssueCode =
  | "database_unavailable" | "health_storage_unavailable" | "cron_not_configured"
  | "notification_worker_missed" | "notification_worker_failed"
  | "formspree_backlog" | "formspree_indeterminate"
  | "staff_alerts_unconfigured" | "staff_alert_backlog" | "staff_alert_exhausted"
  | "reconciliation_disabled" | "reconciliation_missed" | "reconciliation_failed";

export type LeadDeliveryMetrics = {
  failedForms: number;
  oldestFailedFormMinutes: number | null;
  indeterminateForms: number;
  oldestIndeterminateFormMinutes: number | null;
  pendingAlerts: number;
  oldestPendingAlertMinutes: number | null;
  exhaustedAlerts: number;
  notificationWorkerAgeMinutes: number | null;
  notificationWorkerStatus: string | null;
  reconciliation: Array<{ provider: string; ageMinutes: number | null; status: string | null }>;
};
export type LeadDeliveryHealth = {
  ok: boolean;
  checkedAt: string;
  issues: Array<{ code: HealthIssueCode; action: string }>;
  metrics: LeadDeliveryMetrics | null;
};
export type HealthRequirements = {
  staffAlertsRequired: boolean;
  staffAlertsEnabled: boolean;
  staffAlertsConfigured: boolean;
  reconciliationRequired: boolean;
  reconciliationEnabled: boolean;
  cronConfigured: boolean;
};

const issueActions: Record<HealthIssueCode, string> = {
  database_unavailable: "Restore DATABASE_URL and database connectivity; saved requests require durable storage.",
  health_storage_unavailable: "Verify migrations through 0011 and database connectivity; health could not be read.",
  cron_not_configured: "Set CRON_SECRET and verify scheduled notification and health jobs authenticate successfully.",
  notification_worker_missed: "Check the 15-minute notification cron; no recent successful run is recorded.",
  notification_worker_failed: "Inspect the notification worker error code and provider availability; queued requests remain saved.",
  formspree_backlog: "Review overdue failed office notifications and restore delivery; requests are saved in the staff system.",
  formspree_indeterminate: "Check provider records before resolving sending rows; do not resend uncertain notifications automatically.",
  staff_alerts_unconfigured: "Configure the required staff alert recipients and webhook, or explicitly make this integration optional.",
  staff_alert_backlog: "Check the staff alert webhook and worker; pending alerts are overdue.",
  staff_alert_exhausted: "Review staff alert events that exhausted retries and notify staff through a working channel.",
  reconciliation_disabled: "Enable the required reconciliation integration and configure its provider credentials.",
  reconciliation_missed: "Check twice-daily reconciliation and provider credentials; a recent successful run is missing.",
  reconciliation_failed: "Inspect the latest reconciliation failure and restore provider access before retrying.",
};
const issue = (code: HealthIssueCode) => ({ code, action: issueActions[code] });

export const evaluateLeadDeliveryHealth = (
  metrics: LeadDeliveryMetrics,
  requirements: HealthRequirements,
  now = new Date(),
): LeadDeliveryHealth => {
  const codes: HealthIssueCode[] = [];
  if (!requirements.cronConfigured) codes.push("cron_not_configured");
  if (metrics.notificationWorkerAgeMinutes === null || metrics.notificationWorkerAgeMinutes > 45) {
    codes.push("notification_worker_missed");
  }
  if (metrics.notificationWorkerStatus === "failed") codes.push("notification_worker_failed");
  if ((metrics.oldestFailedFormMinutes ?? 0) > 30) codes.push("formspree_backlog");
  if ((metrics.oldestIndeterminateFormMinutes ?? 0) > 15) codes.push("formspree_indeterminate");
  if ((requirements.staffAlertsRequired || requirements.staffAlertsEnabled) && !requirements.staffAlertsConfigured) codes.push("staff_alerts_unconfigured");
  if (requirements.staffAlertsConfigured) {
    if ((metrics.oldestPendingAlertMinutes ?? 0) > 30) codes.push("staff_alert_backlog");
    if (metrics.exhaustedAlerts > 0) codes.push("staff_alert_exhausted");
  }
  if (requirements.reconciliationRequired && !requirements.reconciliationEnabled) codes.push("reconciliation_disabled");
  if (requirements.reconciliationEnabled) {
    for (const run of metrics.reconciliation) {
      if (run.status === "failed") codes.push("reconciliation_failed");
      if (run.ageMinutes === null || run.ageMinutes > 26 * 60) codes.push("reconciliation_missed");
    }
  }
  return { ok: codes.length === 0, checkedAt: now.toISOString(), issues: [...new Set(codes)].map(issue), metrics };
};

export const getHealthRequirements = (): HealthRequirements => ({
  staffAlertsRequired: process.env.LEAD_HEALTH_STAFF_ALERTS_REQUIRED === "true",
  staffAlertsEnabled: process.env.LEAD_DASHBOARD_NOTIFICATIONS_ENABLED === "true",
  staffAlertsConfigured: isNotificationEnabled(),
  reconciliationRequired: process.env.LEAD_HEALTH_RECONCILIATION_REQUIRED === "true",
  reconciliationEnabled: process.env.RECONCILIATION_ENABLED === "true",
  cronConfigured: Boolean(process.env.CRON_SECRET),
});

const numberValue = (value: unknown) => Number(value ?? 0);
const nullableNumber = (value: unknown) => value === null || value === undefined ? null : Math.max(0, Number(value));

export const readLeadDeliveryHealth = async (database = db, now = new Date()): Promise<LeadDeliveryHealth> => {
  if (!database) return { ok: false, checkedAt: now.toISOString(), issues: [issue("database_unavailable")], metrics: null };
  try {
    const result = await database.execute(sql`
      SELECT
        (SELECT count(*) FROM contacts WHERE is_test = false AND request_type IN ('contact','appointment') AND formspree_status = 'failed') AS failed_forms,
        (SELECT EXTRACT(EPOCH FROM (${now}::timestamptz - MIN(created_at AT TIME ZONE 'UTC'))) / 60 FROM contacts WHERE is_test = false AND request_type IN ('contact','appointment') AND formspree_status = 'failed') AS oldest_failed_form_minutes,
        (SELECT count(*) FROM contacts WHERE is_test = false AND request_type IN ('contact','appointment') AND formspree_status = 'sending') AS indeterminate_forms,
        (SELECT EXTRACT(EPOCH FROM (${now}::timestamptz - MIN(updated_at AT TIME ZONE 'UTC'))) / 60 FROM contacts WHERE is_test = false AND request_type IN ('contact','appointment') AND formspree_status = 'sending') AS oldest_indeterminate_form_minutes,
        (SELECT count(*) FROM notification_outbox WHERE status IN ('pending','sending')) AS pending_alerts,
        (SELECT EXTRACT(EPOCH FROM (${now}::timestamptz - MIN(created_at AT TIME ZONE 'UTC'))) / 60 FROM notification_outbox WHERE status IN ('pending','sending')) AS oldest_pending_alert_minutes,
        (SELECT count(*) FROM notification_outbox WHERE status = 'failed') AS exhausted_alerts,
        (SELECT EXTRACT(EPOCH FROM (${now}::timestamptz - last_success_at)) / 60 FROM lead_delivery_worker_state WHERE worker = 'notifications') AS worker_age,
        (SELECT status FROM lead_delivery_worker_state WHERE worker = 'notifications') AS worker_status
    `);
    const runs = await database.execute(sql`
      SELECT provider,
        EXTRACT(EPOCH FROM (${now}::timestamptz - MAX(completed_at AT TIME ZONE 'UTC') FILTER (WHERE status = 'completed'))) / 60 AS age_minutes,
        (array_agg(status ORDER BY started_at DESC))[1] AS status
      FROM reconciliation_runs GROUP BY provider
    `);
    const row = result.rows[0] as Record<string, unknown>;
    const runRows = runs.rows as Array<{ provider: string; age_minutes: unknown; status: string }>;
    const metrics: LeadDeliveryMetrics = {
      failedForms: numberValue(row.failed_forms), oldestFailedFormMinutes: nullableNumber(row.oldest_failed_form_minutes),
      indeterminateForms: numberValue(row.indeterminate_forms), oldestIndeterminateFormMinutes: nullableNumber(row.oldest_indeterminate_form_minutes),
      pendingAlerts: numberValue(row.pending_alerts), oldestPendingAlertMinutes: nullableNumber(row.oldest_pending_alert_minutes),
      exhaustedAlerts: numberValue(row.exhausted_alerts), notificationWorkerAgeMinutes: nullableNumber(row.worker_age),
      notificationWorkerStatus: typeof row.worker_status === "string" ? row.worker_status : null,
      reconciliation: ["google_ads", "formspree"].map((provider) => {
        const run = runRows.find((entry) => entry.provider === provider);
        return { provider, ageMinutes: nullableNumber(run?.age_minutes), status: run?.status ?? null };
      }),
    };
    return evaluateLeadDeliveryHealth(metrics, getHealthRequirements(), now);
  } catch {
    console.error("lead_delivery_health_read_failed");
    return { ok: false, checkedAt: now.toISOString(), issues: [issue("health_storage_unavailable")], metrics: null };
  }
};

export const startNotificationHeartbeat = async (database = db): Promise<string | null> => {
  if (!database) return null;
  const token = randomUUID();
  try {
    await database.execute(sql`
      INSERT INTO lead_delivery_worker_state (worker, status, run_token)
      VALUES ('notifications', 'running', ${token})
      ON CONFLICT (worker) DO UPDATE SET last_started_at = NOW(), status = 'running', run_token = ${token}, error_code = NULL
    `);
    return token;
  } catch { console.error("lead_delivery_heartbeat_start_failed"); return null; }
};

export const finishNotificationHeartbeat = async (token: string | null, failed: boolean, database = db) => {
  if (!database || !token) return;
  try {
    await database.execute(sql`
      UPDATE lead_delivery_worker_state SET
        last_completed_at = NOW(), status = ${failed ? "failed" : "healthy"},
        last_success_at = CASE WHEN ${failed} THEN last_success_at ELSE NOW() END,
        error_code = ${failed ? "notification_delivery_failed" : null}
      WHERE worker = 'notifications' AND run_token = ${token}
    `);
  } catch { console.error("lead_delivery_heartbeat_finish_failed"); }
};

export const sendLeadDeliveryHealthAlert = async (
  health: LeadDeliveryHealth,
  database = db,
): Promise<"sent" | "unchanged" | "disabled" | "failed"> => {
  const webhook = process.env.LEAD_HEALTH_ALERT_WEBHOOK_URL?.trim();
  if (!webhook) return "disabled";
  // The database owns deduplication across replicas; do not fall back to a
  // process-local state or spam staff if it is unavailable.
  if (!database) return "failed";
  const fingerprint = health.ok ? "healthy" : health.issues.map((entry) => entry.code).sort().join(",");
  const token = randomUUID();
  try {
    await database.execute(sql`
      INSERT INTO lead_delivery_alert_state (monitor) VALUES ('lead-delivery') ON CONFLICT DO NOTHING
    `);
    const claim = await database.execute(sql`
      UPDATE lead_delivery_alert_state SET
        event_key = CASE WHEN pending_fingerprint = ${fingerprint} THEN COALESCE(event_key, ${token}) ELSE ${token} END,
        pending_fingerprint = ${fingerprint}, lease_token = ${token}, lease_expires_at = NOW() + INTERVAL '1 minute'
      WHERE monitor = 'lead-delivery' AND sent_fingerprint <> ${fingerprint}
        AND (lease_expires_at IS NULL OR lease_expires_at <= NOW()) RETURNING event_key
    `);
    if (claim.rows.length === 0) return "unchanged";
    const eventKey = String((claim.rows[0] as { event_key: string }).event_key);
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": `lead-health:${eventKey}` },
      body: JSON.stringify({
        subject: health.ok ? "Website lead delivery recovered" : "Website lead delivery needs attention",
        body: health.ok ? "Office delivery checks are healthy again." : health.issues.map((entry) => `${entry.code}: ${entry.action}`).join("\n"),
        ...(process.env.LEAD_HEALTH_ALERT_RECIPIENTS ? { to: process.env.LEAD_HEALTH_ALERT_RECIPIENTS.split(",").map((value) => value.trim()).filter(Boolean) } : {}),
        metadata: { source: "lead_delivery_health", status: health.ok ? "healthy" : "degraded", checkedAt: health.checkedAt },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error("health_alert_rejected");
    await database.execute(sql`
      UPDATE lead_delivery_alert_state SET sent_fingerprint = ${fingerprint}, last_sent_at = NOW(), lease_token = NULL, lease_expires_at = NULL
      WHERE monitor = 'lead-delivery' AND lease_token = ${token}
    `);
    return "sent";
  } catch {
    console.error("lead_delivery_health_alert_failed");
    // The bounded lease permits another attempt after a failed request.
    return "failed";
  }
};
