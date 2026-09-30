import { open, readFile, rename, unlink, lstat } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";

const issueCodes = new Set([
  "database_unavailable", "health_storage_unavailable", "cron_not_configured",
  "notification_worker_missed", "notification_worker_failed", "formspree_backlog",
  "formspree_indeterminate", "staff_alerts_unconfigured", "staff_alert_backlog",
  "staff_alert_exhausted", "reconciliation_disabled", "reconciliation_missed",
  "reconciliation_failed",
]);
const monitorCodes = new Set(["endpoint_unavailable", "monitor_auth_failed", "invalid_health_response"]);
const validFingerprint = (value) => value === "healthy" || (
  typeof value === "string" && value.length < 1024 && value.split(",").every((code) => issueCodes.has(code) || monitorCodes.has(code))
);

function secureUrl(value, healthEndpoint = false) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.hash ||
    (healthEndpoint && (url.pathname !== "/api/admin/lead-health" || url.search))) throw new Error("invalid_configuration");
  return url.href;
}

function configuration(env) {
  try {
    if (!env.CRON_SECRET || env.CRON_SECRET.length < 32 || !env.LEAD_HEALTH_MONITOR_STATE_FILE ||
      !isAbsolute(env.LEAD_HEALTH_MONITOR_STATE_FILE) || env.LEAD_HEALTH_MONITOR_STATE_FILE.endsWith("/")) throw new Error();
    return {
      healthUrl: secureUrl(env.LEAD_HEALTH_MONITOR_URL, true),
      webhookUrl: secureUrl(env.LEAD_HEALTH_ALERT_WEBHOOK_URL),
      statePath: env.LEAD_HEALTH_MONITOR_STATE_FILE,
      secret: env.CRON_SECRET,
    };
  } catch { throw new Error("invalid_configuration"); }
}

async function readState(statePath) {
  try {
    const info = await lstat(statePath);
    if (!info.isFile() || info.isSymbolicLink() || info.size > 2048) throw new Error();
    const state = JSON.parse(await readFile(statePath, "utf8"));
    if (state.version !== 1 || !validFingerprint(state.fingerprint)) throw new Error();
    return state.fingerprint;
  } catch (error) {
    if (error.code === "ENOENT") return "healthy";
    throw new Error("invalid_monitor_state");
  }
}

async function readBoundedJson(response) {
  if (!response.body) throw new Error();
  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > 32_768) { await reader.cancel(); throw new Error(); }
      chunks.push(chunk.value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function healthFingerprint(config, fetchImpl) {
  let response;
  try {
    response = await fetchImpl(config.healthUrl, {
      headers: { Authorization: `Bearer ${config.secret}`, Accept: "application/json" },
      redirect: "error", signal: AbortSignal.timeout(10_000),
    });
  } catch { return "endpoint_unavailable"; }
  if (response.status === 401 || response.status === 403) return "monitor_auth_failed";
  try {
    const health = await readBoundedJson(response);
    if (typeof health.ok !== "boolean" || !Array.isArray(health.issues) || health.issues.length > issueCodes.size ||
      health.issues.some((issue) => !issue || !issueCodes.has(issue.code))) throw new Error();
    if (health.ok && health.issues.length === 0 && response.ok) return "healthy";
    if (!health.ok && health.issues.length) return [...new Set(health.issues.map((issue) => issue.code))].sort().join(",");
  } catch { /* Never expose the response body or parsing error. */ }
  return response.ok ? "invalid_health_response" : "endpoint_unavailable";
}

async function writeState(statePath, fingerprint, now) {
  const temporary = `${statePath}.${randomUUID()}.tmp`;
  try {
    const file = await open(temporary, "wx", 0o600);
    try { await file.writeFile(JSON.stringify({ version: 1, fingerprint, updatedAt: now.toISOString() })); await file.sync(); }
    finally { await file.close(); }
    await rename(temporary, statePath);
  } finally { await unlink(temporary).catch(() => {}); }
}

/** Runs outside Vercel and depends only on the operator's filesystem and webhook. */
export async function runLeadHealthMonitor({ env = process.env, fetchImpl = globalThis.fetch, now = new Date() } = {}) {
  const config = configuration(env);
  const lockPath = `${config.statePath}.lock`;
  let lock;
  try { lock = await open(lockPath, "wx", 0o600); }
  catch (error) { throw new Error(error.code === "EEXIST" ? "monitor_already_running" : "monitor_state_unavailable"); }
  try {
    const previous = await readState(config.statePath);
    const fingerprint = await healthFingerprint(config, fetchImpl);
    if (fingerprint === previous) return { ok: fingerprint === "healthy", alert: "unchanged" };
    const recovered = fingerprint === "healthy";
    let response;
    try {
      response = await fetchImpl(config.webhookUrl, {
        method: "POST", redirect: "error",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: recovered ? "Website lead delivery recovered" : "Website lead delivery needs attention",
          body: recovered ? "The independent website delivery check is healthy again." :
            `Independent monitor detected: ${fingerprint}. Check website delivery, database access, scheduled jobs, and provider status.`,
          metadata: { source: "independent_lead_health_monitor", status: recovered ? "healthy" : "degraded", checkedAt: now.toISOString() },
        }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch { throw new Error("monitor_alert_failed"); }
    if (!response.ok) throw new Error("monitor_alert_failed");
    try { await writeState(config.statePath, fingerprint, now); }
    catch { throw new Error("monitor_state_write_failed"); }
    return { ok: recovered, alert: "sent" };
  } finally { await lock.close(); await unlink(lockPath); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await runLeadHealthMonitor();
    console.log(JSON.stringify(result));
    process.exitCode = result.ok ? 0 : 1;
  } catch (error) {
    // Only errors created here are logged; environment values and remote bodies stay private.
    const safeErrors = new Set(["invalid_configuration", "invalid_monitor_state", "monitor_already_running", "monitor_state_unavailable", "monitor_alert_failed", "monitor_state_write_failed"]);
    console.error(safeErrors.has(error.message) ? error.message : "monitor_failed");
    process.exitCode = 2;
  }
}
