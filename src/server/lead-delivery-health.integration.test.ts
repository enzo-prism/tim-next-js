import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { randomUUID } from "node:crypto";
import { applyTestMigrations } from "@/server/test-migrations";
import { readLeadDeliveryHealth, startNotificationHeartbeat, finishNotificationHeartbeat, sendLeadDeliveryHealthAlert, type HealthDatabase } from "@/server/lead-delivery-health";

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl || !new URL(testUrl).pathname.endsWith("_test")) throw new Error("TEST_DATABASE_URL must target an isolated _test database");
const testSchema = `delivery_health_test_${randomUUID().replace(/-/g, "")}`;
const pool = new pg.Pool({ connectionString: testUrl });
let client: pg.PoolClient;
let database: HealthDatabase;
beforeAll(async () => {
  client = await pool.connect();
  await client.query(`CREATE SCHEMA ${testSchema}`);
  await client.query(`SET search_path TO ${testSchema}`);
  await applyTestMigrations(client);
  database = drizzle(client) as unknown as HealthDatabase;
});
afterAll(async () => {
  if (client) { await client.query(`DROP SCHEMA ${testSchema} CASCADE`); client.release(); }
  await pool.end();
});
beforeEach(async () => {
  vi.stubEnv("CRON_SECRET", "test-secret");
  vi.stubEnv("RECONCILIATION_ENABLED", "false");
  vi.stubEnv("LEAD_DASHBOARD_NOTIFICATIONS_ENABLED", "false");
  vi.stubEnv("LEAD_HEALTH_STAFF_ALERTS_REQUIRED", "false");
  vi.stubEnv("LEAD_HEALTH_RECONCILIATION_REQUIRED", "false");
  await client.query("TRUNCATE lead_delivery_alert_state, lead_delivery_worker_state, reconciliation_runs CASCADE");
  await client.query("DELETE FROM notification_outbox"); await client.query("DELETE FROM contacts");
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("real Postgres delivery health", () => {
  it("distinguishes an absent worker heartbeat from a healthy idle worker", async () => {
    expect((await readLeadDeliveryHealth(database)).issues.map((issue) => issue.code)).toContain("notification_worker_missed");
    const token = await startNotificationHeartbeat(database); await finishNotificationHeartbeat(token, false, database);
    const health = await readLeadDeliveryHealth(database);
    expect(health.ok).toBe(true); expect(health.metrics?.notificationWorkerStatus).toBe("healthy");
  });
  it("aggregates only patient-free ages/counts and excludes synthetic test leads", async () => {
    const token = await startNotificationHeartbeat(database); await finishNotificationHeartbeat(token, false, database);
    await client.query(`INSERT INTO contacts (first_name,last_name,email,request_type,formspree_status,is_test,created_at,updated_at)
      VALUES ('PRIVATE','NAME','private@example.com','appointment','failed',false,NOW()-INTERVAL '40 minutes',NOW()),
      ('PRIVATE','NAME','private@example.com','appointment','sending',false,NOW()-INTERVAL '30 minutes',NOW()-INTERVAL '20 minutes'),
      ('TEST','NAME','test@example.com','appointment','failed',true,NOW()-INTERVAL '5 days',NOW())`);
    const health = await readLeadDeliveryHealth(database);
    expect(health.metrics?.failedForms).toBe(1); expect(health.metrics?.indeterminateForms).toBe(1);
    expect(health.metrics?.oldestFailedFormMinutes).toBeGreaterThanOrEqual(39);
    expect(health.issues.map((issue) => issue.code)).toEqual(["formspree_backlog", "formspree_indeterminate"]);
    expect(JSON.stringify(health)).not.toContain("private@example.com"); expect(JSON.stringify(health)).not.toContain("PRIVATE");
  });
  it("keeps new worker runs safe from older concurrent completion", async () => {
    const first = await startNotificationHeartbeat(database); const second = await startNotificationHeartbeat(database);
    await finishNotificationHeartbeat(first, false, database);
    expect((await readLeadDeliveryHealth(database)).metrics?.notificationWorkerStatus).toBe("running");
    await finishNotificationHeartbeat(second, true, database);
    expect((await readLeadDeliveryHealth(database)).metrics?.notificationWorkerStatus).toBe("failed");
  });
  it("detects missed and failed configured provider runs", async () => {
    vi.stubEnv("RECONCILIATION_ENABLED", "true");
    const token = await startNotificationHeartbeat(database); await finishNotificationHeartbeat(token, false, database);
    await client.query(`INSERT INTO reconciliation_runs (run_key,provider,status,started_at,completed_at)
      VALUES ('old','google_ads','completed',NOW()-INTERVAL '28 hours',NOW()-INTERVAL '27 hours'),
      ('failed','google_ads','failed',NOW(),NOW()), ('healthy','formspree','completed',NOW(),NOW())`);
    const health = await readLeadDeliveryHealth(database);
    expect(health.issues.map((issue) => issue.code)).toEqual(["reconciliation_failed", "reconciliation_missed"]);
  });
  it("deduplicates simultaneous alert probes across workers and sends one recovery", async () => {
    vi.stubEnv("LEAD_HEALTH_ALERT_WEBHOOK_URL", "https://alerts.example.test");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal("fetch", fetchMock);
    const health = await readLeadDeliveryHealth(database);
    await Promise.all([sendLeadDeliveryHealthAlert(health, database), sendLeadDeliveryHealthAlert(health, database)]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(await sendLeadDeliveryHealthAlert(health, database)).toBe("unchanged");
    const token = await startNotificationHeartbeat(database); await finishNotificationHeartbeat(token, false, database);
    expect(await sendLeadDeliveryHealthAlert(await readLeadDeliveryHealth(database), database)).toBe("sent");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).subject).toContain("recovered");
  });
  it("reuses the transport idempotency key after an uncertain alert attempt", async () => {
    vi.stubEnv("LEAD_HEALTH_ALERT_WEBHOOK_URL", "https://alerts.example.test");
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error("network timeout")).mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const health = await readLeadDeliveryHealth(database);
    expect(await sendLeadDeliveryHealthAlert(health, database)).toBe("failed");
    await client.query("UPDATE lead_delivery_alert_state SET lease_expires_at = NOW()-INTERVAL '1 second'");
    expect(await sendLeadDeliveryHealthAlert(health, database)).toBe("sent");
    expect(fetchMock.mock.calls[0][1].headers["Idempotency-Key"]).toBe(fetchMock.mock.calls[1][1].headers["Idempotency-Key"]);
  });

});
