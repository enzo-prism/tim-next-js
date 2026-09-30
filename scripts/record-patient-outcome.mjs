#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { z } from "zod";
const statuses = ["new", "contacted", "booked", "arrived", "no-show", "lost"];
const instant = z.string().datetime({ offset: true });
const key = z.string().regex(/^[a-z0-9_.-]{1,80}$/);
// Mirror the server's strict input contract; the server revalidates on every write.
export function validatePayload(kind, payload) {
  if (kind === "lead") return z.object({ leadId: z.string().uuid(), status: z.enum(statuses), expectedUpdatedAt: instant, lostReason: z.enum(["unreachable", "declined", "not-a-fit", "duplicate", "other"]).optional() }).strict().refine((value) => value.status !== "lost" || Boolean(value.lostReason)).parse(payload);
  if (kind === "call") return z.object({ provider: key, callId: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/), occurredAt: instant, sourceObservedAt: instant, status: z.enum(statuses), source: z.enum(["google-ads", "meta", "microsoft-ads", "organic", "direct", "referral", "other", "unknown"]).default("unknown"), campaign: key.nullish(), linkedLeadId: z.string().uuid().nullish() }).strict().refine((value) => new Date(value.occurredAt) <= new Date(value.sourceObservedAt)).parse(payload);
  throw new Error("Use --kind lead or --kind call.");
}
export function outcomeOrigin(value) {
  const url = new URL(value);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if ((url.protocol !== "https:" && !(local && url.protocol === "http:")) || url.username || url.password || url.search || url.hash || url.pathname !== "/") throw new Error("LEAD_OUTCOMES_ORIGIN must be an HTTPS origin (HTTP allowed only on loopback).");
  return url.origin;
}
async function main() {
  const args = process.argv.slice(2);
  const allowed = new Set(["--kind", "--payload", "--send"]);
  const options = {};
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (!allowed.has(arg) || Object.hasOwn(options, arg)) throw new Error("Usage: node scripts/record-patient-outcome.mjs --kind lead|call --payload <file.json> [--send]");
    options[arg] = arg === "--send" ? true : args[++index];
  }
  if (!options["--payload"] || !options["--kind"]) throw new Error("Supply --kind and --payload. Dry run is the default; --send explicitly writes.");
  const raw = await readFile(options["--payload"]);
  if (raw.byteLength > 8192) throw new Error("Payload exceeds 8 KiB.");
  const payload = validatePayload(options["--kind"], JSON.parse(raw.toString("utf8")));
  if (!options["--send"]) {
    console.log(JSON.stringify({ mode: "review-only", endpoint: options["--kind"] === "call" ? "/api/admin/outcomes/calls" : "/api/admin/outcomes", payload }, null, 2));
    return;
  }
  const secret = process.env.LEAD_OUTCOMES_SECRET;
  if (!secret || secret.length < 32) throw new Error("Set a dedicated LEAD_OUTCOMES_SECRET of at least 32 characters.");
  const origin = outcomeOrigin(process.env.LEAD_OUTCOMES_ORIGIN || "");
  const endpoint = options["--kind"] === "call" ? "/api/admin/outcomes/calls" : "/api/admin/outcomes";
  const response = await fetch(`${origin}${endpoint}`, { method: "POST", redirect: "error", headers: { "content-type": "application/json", authorization: `Bearer ${secret}` }, body: JSON.stringify(payload), signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Outcome write returned HTTP ${response.status}; verify current state before retrying a lead update.`);
  const result = await response.json();
  console.log(JSON.stringify({ ok: Boolean(result.ok), status: result.status, updatedAt: result.updatedAt }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(() => {
  // Avoid printing filesystem contents, server responses, URLs or credential-bearing exceptions.
  console.error("Outcome command failed. Check arguments, strict payload, configured origin/secret, and authenticated server state. No request body or secret was logged.");
  process.exitCode = 1;
});
