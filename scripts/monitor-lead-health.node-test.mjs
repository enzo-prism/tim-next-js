import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile, access } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runLeadHealthMonitor } from "./monitor-lead-health.mjs";

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), "ffsc-monitor-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const env = {
    CRON_SECRET: "test-secret-".repeat(4),
    LEAD_HEALTH_MONITOR_URL: "https://website.example/api/admin/lead-health",
    LEAD_HEALTH_ALERT_WEBHOOK_URL: "https://alerts.example/receiver?token=private-secret",
    LEAD_HEALTH_MONITOR_STATE_FILE: join(directory, "state.json"),
  };
  return { env, statePath: env.LEAD_HEALTH_MONITOR_STATE_FILE };
}
const healthy = () => Response.json({ ok: true, issues: [] });
const degraded = (code = "database_unavailable") => Response.json({ ok: false, issues: [{ code, action: "PRIVATE PATIENT DETAILS" }] }, { status: 503 });

test("first healthy check makes no webhook request or persistent state write", async (t) => {
  const { env, statePath } = await fixture(t);
  let calls = 0;
  const result = await runLeadHealthMonitor({ env, fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url, env.LEAD_HEALTH_MONITOR_URL);
    assert.equal(options.headers.Authorization, `Bearer ${env.CRON_SECRET}`);
    assert.equal(options.redirect, "error");
    return healthy();
  } });
  assert.deepEqual(result, { ok: true, alert: "unchanged" });
  assert.equal(calls, 1);
  await assert.rejects(access(statePath));
});

test("database outage alerts without database, deduplicates, then reports recovery", async (t) => {
  const { env, statePath } = await fixture(t);
  let current = degraded;
  const alerts = [];
  const fetchImpl = async (url, options) => {
    if (url === env.LEAD_HEALTH_MONITOR_URL) return current();
    assert.equal(options.redirect, "error");
    assert.equal(options.headers.Authorization, undefined);
    alerts.push(JSON.parse(options.body));
    return new Response(null, { status: 202 });
  };
  assert.deepEqual(await runLeadHealthMonitor({ env, fetchImpl }), { ok: false, alert: "sent" });
  assert.deepEqual(await runLeadHealthMonitor({ env, fetchImpl }), { ok: false, alert: "unchanged" });
  current = () => degraded("formspree_indeterminate");
  assert.deepEqual(await runLeadHealthMonitor({ env, fetchImpl }), { ok: false, alert: "sent" });
  current = healthy;
  assert.deepEqual(await runLeadHealthMonitor({ env, fetchImpl }), { ok: true, alert: "sent" });
  assert.equal(alerts.length, 3);
  assert.match(alerts[0].body, /database_unavailable/);
  assert.equal(alerts[2].metadata.status, "healthy");
  assert.doesNotMatch(JSON.stringify(alerts), /PRIVATE|private-secret|test-secret/);
  assert.equal(JSON.parse(await readFile(statePath, "utf8")).fingerprint, "healthy");
});

test("network/timeout failure and non-JSON server failure still produce external alerts", async (t) => {
  for (const failure of [() => { throw new DOMException("sensitive request URL", "TimeoutError"); }, () => new Response("PRIVATE patient data", { status: 502 })]) {
    const { env } = await fixture(t);
    let alert;
    await runLeadHealthMonitor({ env, fetchImpl: async (url, options) => {
      if (url === env.LEAD_HEALTH_MONITOR_URL) return failure();
      alert = options.body;
      return new Response(null, { status: 200 });
    } });
    assert.match(alert, /endpoint_unavailable/);
    assert.doesNotMatch(alert, /PRIVATE|sensitive/);
  }
});

test("unknown/oversized health data cannot leak into alerts", async (t) => {
  for (const response of [Response.json({ ok: false, issues: [{ code: "patient-name-secret" }] }), new Response("x".repeat(40_000))]) {
    const { env } = await fixture(t);
    let alert;
    await runLeadHealthMonitor({ env, fetchImpl: async (url, options) => {
      if (url === env.LEAD_HEALTH_MONITOR_URL) return response;
      alert = options.body;
      return new Response(null, { status: 200 });
    } });
    assert.match(alert, /invalid_health_response/);
    assert.doesNotMatch(alert, /patient-name-secret|xxxxx/);
  }
});

test("failed webhook leaves previous state intact and retries on next execution", async (t) => {
  const { env, statePath } = await fixture(t);
  await writeFile(statePath, JSON.stringify({ version: 1, fingerprint: "healthy" }));
  let receiverOk = false;
  const fetchImpl = async (url) => url === env.LEAD_HEALTH_MONITOR_URL ? degraded() : new Response(null, { status: receiverOk ? 200 : 503 });
  await assert.rejects(runLeadHealthMonitor({ env, fetchImpl }), /monitor_alert_failed/);
  assert.equal(JSON.parse(await readFile(statePath, "utf8")).fingerprint, "healthy");
  receiverOk = true;
  assert.equal((await runLeadHealthMonitor({ env, fetchImpl })).alert, "sent");
});

test("requires explicit absolute persistent state and HTTPS URLs before making requests", async (t) => {
  const { env } = await fixture(t);
  const invalid = [
    { LEAD_HEALTH_MONITOR_STATE_FILE: undefined }, { LEAD_HEALTH_MONITOR_STATE_FILE: "state.json" },
    { CRON_SECRET: "short" }, { LEAD_HEALTH_MONITOR_URL: "http://localhost/api/admin/lead-health" },
    { LEAD_HEALTH_MONITOR_URL: "https://website.example/api/admin/lead-health?secret=private" },
    { LEAD_HEALTH_ALERT_WEBHOOK_URL: "https://user:secret@alerts.example/hook" },
    { LEAD_HEALTH_MONITOR_URL: "https://website.example/contact" },
  ];
  for (const override of invalid) {
    await assert.rejects(runLeadHealthMonitor({ env: { ...env, ...override }, fetchImpl: async () => assert.fail("No request expected") }), /invalid_configuration/);
  }
});

test("corrupt state and overlapping execution fail closed without sending", async (t) => {
  const { env, statePath } = await fixture(t);
  await writeFile(statePath, "PRIVATE state corruption");
  await assert.rejects(runLeadHealthMonitor({ env, fetchImpl: async () => assert.fail("No request expected") }), /invalid_monitor_state/);
  await rm(statePath);
  await writeFile(`${statePath}.lock`, "");
  await assert.rejects(runLeadHealthMonitor({ env, fetchImpl: async () => assert.fail("No request expected") }), /monitor_already_running/);
});
