import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/server/db", () => ({ db: undefined }));
vi.mock("@/server/dashboard-notifications", () => ({ isNotificationEnabled: () => false }));
import {
  evaluateLeadDeliveryHealth, readLeadDeliveryHealth, sendLeadDeliveryHealthAlert,
  startNotificationHeartbeat, finishNotificationHeartbeat,
  type LeadDeliveryMetrics, type HealthRequirements, type HealthDatabase,
} from "@/server/lead-delivery-health";

const metrics: LeadDeliveryMetrics = {
  failedForms: 0, oldestFailedFormMinutes: null, indeterminateForms: 0,
  oldestIndeterminateFormMinutes: null, pendingAlerts: 0, oldestPendingAlertMinutes: null,
  exhaustedAlerts: 0, notificationWorkerAgeMinutes: 10, notificationWorkerStatus: "healthy",
  reconciliation: [
    { provider: "google_ads", ageMinutes: null, status: null },
    { provider: "formspree", ageMinutes: null, status: null },
  ],
};
const optional: HealthRequirements = {
  staffAlertsRequired: false, staffAlertsEnabled: false, staffAlertsConfigured: false,
  reconciliationRequired: false, reconciliationEnabled: false, cronConfigured: true,
};
const now = new Date("2026-09-30T12:00:00Z");
const codes = (changes: Partial<LeadDeliveryMetrics>, requirements = optional) =>
  evaluateLeadDeliveryHealth({ ...metrics, ...changes }, requirements, now).issues.map((entry) => entry.code);
const fakeDatabase = (execute: ReturnType<typeof vi.fn>) => ({ execute }) as unknown as HealthDatabase;

describe("delivery health evaluates actual operational states", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
  it("does not treat unused optional integrations as hard failures", () => {
    expect(evaluateLeadDeliveryHealth(metrics, optional, now).ok).toBe(true);
    expect(codes({ exhaustedAlerts: 4, oldestPendingAlertMinutes: 200 })).toEqual([]);
  });
  it("reports missed worker runs even on an idle day", () => {
    expect(codes({ notificationWorkerAgeMinutes: 46 })).toContain("notification_worker_missed");
    expect(codes({ notificationWorkerAgeMinutes: null })).toContain("notification_worker_missed");
  });
  it("distinguishes normal queued delivery from overdue or uncertain delivery", () => {
    expect(codes({ failedForms: 1, oldestFailedFormMinutes: 3 })).toEqual([]);
    expect(codes({ failedForms: 1, oldestFailedFormMinutes: 31 })).toContain("formspree_backlog");
    expect(codes({ indeterminateForms: 1, oldestIndeterminateFormMinutes: 16 })).toContain("formspree_indeterminate");
  });
  it("reports required disabled integrations, configured exhausted alerts and failed jobs", () => {
    const required = { ...optional, staffAlertsRequired: true, reconciliationRequired: true };
    expect(codes({}, required)).toEqual(["staff_alerts_unconfigured", "reconciliation_disabled"]);
    expect(codes({ exhaustedAlerts: 2 }, { ...required, staffAlertsConfigured: true })).toContain("staff_alert_exhausted");
    expect(codes({ notificationWorkerStatus: "failed" })).toContain("notification_worker_failed");
  });
  it("checks both configured reconciliation providers and collapses duplicate issue codes", () => {
    expect(codes({}, { ...optional, reconciliationEnabled: true })).toEqual(["reconciliation_missed"]);
    expect(codes({ reconciliation: [
      { provider: "google_ads", ageMinutes: 2000, status: "failed" },
      { provider: "formspree", ageMinutes: 3, status: "completed" },
    ] }, { ...optional, reconciliationEnabled: true })).toEqual(["reconciliation_failed", "reconciliation_missed"]);
  });
  it("returns failure for unavailable database or health schema", async () => {
    expect((await readLeadDeliveryHealth(undefined, now)).issues[0].code).toBe("database_unavailable");
    expect((await readLeadDeliveryHealth(fakeDatabase(vi.fn().mockRejectedValue(new Error("table missing"))), now)).issues[0].code).toBe("health_storage_unavailable");
  });
});

describe("health alerts persist deduplication and never include patient data", () => {
  beforeEach(() => { vi.stubEnv("LEAD_HEALTH_ALERT_WEBHOOK_URL", "https://alerts.example.test"); });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
  it("stays disabled until the specific health alert webhook is configured", async () => {
    vi.stubEnv("LEAD_HEALTH_ALERT_WEBHOOK_URL", "");
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    expect(await sendLeadDeliveryHealthAlert(evaluateLeadDeliveryHealth(metrics, optional, now))).toBe("disabled");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("does not resend unchanged incidents or initially healthy checks", async () => {
    const execute = vi.fn().mockResolvedValue({ rows: [] }); const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    expect(await sendLeadDeliveryHealthAlert(evaluateLeadDeliveryHealth(metrics, optional, now), fakeDatabase(execute))).toBe("unchanged");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("sends only action codes and records successful notification after provider acknowledgement", async () => {
    const execute = vi.fn().mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ event_key: "event-test" }] }).mockResolvedValue({ rows: [] });
    const fetch = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal("fetch", fetch);
    const health = evaluateLeadDeliveryHealth({ ...metrics, failedForms: 3, oldestFailedFormMinutes: 40 }, optional, now);
    expect(await sendLeadDeliveryHealthAlert(health, fakeDatabase(execute))).toBe("sent");
    expect(execute).toHaveBeenCalledTimes(3);
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.body).toContain("formspree_backlog");
    expect(body).not.toHaveProperty("metrics"); expect(body).not.toHaveProperty("contacts");
  });
  it("leaves a failed notification claim eligible for a bounded retry rather than marking it sent", async () => {
    const execute = vi.fn().mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ event_key: "event-test" }] });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    expect(await sendLeadDeliveryHealthAlert(evaluateLeadDeliveryHealth(metrics, optional, now), fakeDatabase(execute))).toBe("failed");
    expect(execute).toHaveBeenCalledTimes(2);
  });
  it("records worker heartbeat only for its matching run token", async () => {
    const execute = vi.fn().mockResolvedValue({ rows: [] }); const database = fakeDatabase(execute);
    const token = await startNotificationHeartbeat(database);
    expect(token).toEqual(expect.any(String));
    await finishNotificationHeartbeat(token, true, database);
    expect(execute).toHaveBeenCalledTimes(2);
  });
});
