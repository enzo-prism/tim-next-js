import { createHash, timingSafeEqual } from "crypto";
import { sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { allCanonicalRoutes } from "@/content/routes";
import { LEAD_STATUS_VALUES } from "@/server/schema";
import type { IStorage } from "@/server/storage";

export const OUTCOME_TIME_ZONE = "America/Los_Angeles";
const knownRoutes = new Set(allCanonicalRoutes);
const instant = z.string().datetime({ offset: true });
const opaqueId = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
const attributionKey = z.string().regex(/^[a-z0-9_.-]{1,80}$/);
export const lostReasonValues = ["unreachable", "declined", "not-a-fit", "duplicate", "other"] as const;
export const leadOutcomeSchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(LEAD_STATUS_VALUES),
  expectedUpdatedAt: instant,
  lostReason: z.enum(lostReasonValues).optional(),
}).strict().refine((value) => value.status !== "lost" || Boolean(value.lostReason));
export const callOutcomeSchema = z.object({
  provider: attributionKey,
  callId: opaqueId,
  occurredAt: instant,
  sourceObservedAt: instant,
  status: z.enum(LEAD_STATUS_VALUES),
  source: z.enum(["google-ads", "meta", "microsoft-ads", "organic", "direct", "referral", "other", "unknown"]).default("unknown"),
  campaign: attributionKey.nullish(),
  linkedLeadId: z.string().uuid().nullish(),
}).strict().refine((value) => new Date(value.occurredAt) <= new Date(value.sourceObservedAt));
export type CallOutcomeInput = z.infer<typeof callOutcomeSchema>;
export type OutcomeDatabase = { execute(query: SQL): Promise<{ rows: unknown[] }> };

export const outcomeAuthorizationStatus = (authorization: string | null, secret: string | undefined): 200 | 401 | 503 => {
  if (!secret || secret.length < 32) return 503;
  if (!authorization || authorization.length > 4096) return 401;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(authorization), digest(`Bearer ${secret}`)) ? 200 : 401;
};

export const reportRangeSchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).strict().superRefine(({ start, end }, ctx) => {
  const a = new Date(`${start}T00:00:00Z`);
  const b = new Date(`${end}T00:00:00Z`);
  if (!Number.isFinite(a.getTime()) || !Number.isFinite(b.getTime()) || a.toISOString().slice(0, 10) !== start || b.toISOString().slice(0, 10) !== end || b < a || b.getTime() - a.getTime() > 364 * 86_400_000) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Use a valid inclusive date range of at most 365 days." });
  }
});
export type ReportRange = z.infer<typeof reportRangeSchema>;

export async function recordLeadOutcome(storage: IStorage, input: z.infer<typeof leadOutcomeSchema>) {
  const result = await storage.updateContactLifecycle(input.leadId, {
    leadStatus: input.status,
    expectedUpdatedAt: new Date(input.expectedUpdatedAt),
    lostReason: input.lostReason,
  });
  if (result.status !== "updated") return result;
  return { status: "updated" as const, leadStatus: result.contact.leadStatus, updatedAt: result.contact.updatedAt.toISOString() };
}

export async function recordCallOutcome(database: OutcomeDatabase, input: CallOutcomeInput, now = new Date()) {
  if (new Date(input.sourceObservedAt).getTime() > now.getTime() + 300_000) return { status: "invalid_observation_time" as const };
  if (input.linkedLeadId) {
    const match = await database.execute(sql`SELECT id FROM contacts WHERE id = ${input.linkedLeadId} AND is_test = false`);
    if (match.rows.length === 0) return { status: "lead_not_found" as const };
  }
  const result = await database.execute(sql`
    INSERT INTO call_outcomes (provider, call_id, occurred_at, source_observed_at, status, source, campaign, linked_lead_id, booked_at, arrived_at)
    VALUES (${input.provider}, ${input.callId}, ${input.occurredAt}::timestamptz, ${input.sourceObservedAt}::timestamptz, ${input.status}, ${input.source}, ${input.campaign ?? null}, ${input.linkedLeadId ?? null},
      CASE WHEN ${input.status} IN ('booked', 'arrived', 'no-show') THEN ${input.sourceObservedAt}::timestamptz ELSE NULL END,
      CASE WHEN ${input.status} = 'arrived' THEN ${input.sourceObservedAt}::timestamptz ELSE NULL END)
    ON CONFLICT (provider, call_id) DO UPDATE SET
      source_observed_at = EXCLUDED.source_observed_at, status = EXCLUDED.status,
      source = EXCLUDED.source, campaign = EXCLUDED.campaign,
      linked_lead_id = COALESCE(EXCLUDED.linked_lead_id, call_outcomes.linked_lead_id),
      booked_at = COALESCE(call_outcomes.booked_at, EXCLUDED.booked_at),
      arrived_at = COALESCE(call_outcomes.arrived_at, EXCLUDED.arrived_at), updated_at = now()
    WHERE EXCLUDED.source_observed_at > call_outcomes.source_observed_at
      AND EXCLUDED.occurred_at = call_outcomes.occurred_at
      AND (call_outcomes.linked_lead_id IS NULL OR EXCLUDED.linked_lead_id IS NULL OR call_outcomes.linked_lead_id = EXCLUDED.linked_lead_id)
    RETURNING status
  `);
  if (result.rows.length) return { status: "recorded" as const };
  const existing = await database.execute(sql`SELECT status, occurred_at, source_observed_at, source, campaign, linked_lead_id FROM call_outcomes WHERE provider = ${input.provider} AND call_id = ${input.callId}`);
  const row = existing.rows[0] as Record<string, unknown> | undefined;
  if (row && new Date(String(row.source_observed_at)).getTime() === new Date(input.sourceObservedAt).getTime() && new Date(String(row.occurred_at)).getTime() === new Date(input.occurredAt).getTime() && row.status === input.status && row.source === input.source && row.campaign === (input.campaign ?? null) && (!input.linkedLeadId || row.linked_lead_id === input.linkedLeadId)) return { status: "duplicate" as const };
  return { status: "stale_or_conflicting" as const };
}

const campaignKey = (value: unknown) => typeof value === "string" && value.trim() ? `campaign-${createHash("sha256").update(value.trim()).digest("hex").slice(0, 16)}` : "unattributed";
export const safeLandingPage = (value: unknown) => {
  if (typeof value !== "string" || !value) return "unattributed";
  try {
    const path = new URL(value, "https://www.famfirstsmile.com").pathname.replace(/\/$/, "") || "/";
    return knownRoutes.has(path) ? path : "other-page";
  } catch { return "other-page"; }
};
const sourceKey = (value: unknown, hasGoogleClickId: unknown, medium: unknown) => {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  const channel = typeof medium === "string" ? medium.trim().toLowerCase() : "";
  if (hasGoogleClickId || ["google ads", "googleads", "adwords", "google-ads"].includes(raw) || (raw === "google" && ["cpc", "ppc", "paid", "paid-search", "paid_search", "cpm"].includes(channel))) return "Google Ads";
  if (raw === "google") return channel === "organic" ? "Google organic" : "Google (unspecified)";
  if (["facebook", "fb", "instagram", "meta"].includes(raw)) return "Meta";
  if (["bing", "microsoft", "microsoft ads", "microsoft-ads"].includes(raw)) return "Microsoft Ads";
  if (["organic", "direct", "referral"].includes(raw)) return raw;
  return !raw ? "Website form" : "Other / unknown";
};
type AggregateRow = { source: unknown; landing_page: unknown; campaign: unknown; has_google_click_id?: unknown; medium?: unknown; total: unknown; booked: unknown; arrived: unknown; updated: unknown; new: unknown; contacted: unknown; current_booked: unknown; current_arrived: unknown; no_show: unknown; lost: unknown };
type Counts = { total: number; everBooked: number; everArrived: number; outcomeUpdated: number; currentStatuses: Record<string, number> };
const emptyCounts = (): Counts => ({ total: 0, everBooked: 0, everArrived: 0, outcomeUpdated: 0, currentStatuses: Object.fromEntries(LEAD_STATUS_VALUES.map((status) => [status, 0])) });
const addCounts = (counts: Counts, row: AggregateRow) => {
  counts.total += Number(row.total); counts.everBooked += Number(row.booked); counts.everArrived += Number(row.arrived); counts.outcomeUpdated += Number(row.updated);
  for (const [status, key] of Object.entries({ new: "new", contacted: "contacted", booked: "current_booked", arrived: "current_arrived", "no-show": "no_show", lost: "lost" })) counts.currentStatuses[status] += Number(row[key as keyof AggregateRow]);
};
export const summarizeOutcomeRows = (rows: AggregateRow[]) => {
  const totals = emptyCounts();
  const groups = new Map<string, { source: string; landingPage: string; campaign: string } & Counts>();
  for (const row of rows) {
    const dimensions = { source: sourceKey(row.source, row.has_google_click_id, row.medium), landingPage: safeLandingPage(row.landing_page), campaign: campaignKey(row.campaign) };
    const key = JSON.stringify(dimensions);
    const group = groups.get(key) ?? { ...dimensions, ...emptyCounts() };
    addCounts(totals, row); addCounts(group, row); groups.set(key, group);
  }
  return { totals, outcomeCompleteness: totals.total ? totals.outcomeUpdated / totals.total : null, byAttribution: [...groups.values()].sort((a, b) => b.total - a.total) };
};

const countsSql = sql`count(*)::int AS total, count(*) FILTER (WHERE booked_at IS NOT NULL)::int AS booked, count(*) FILTER (WHERE arrived_at IS NOT NULL)::int AS arrived,
  count(*) FILTER (WHERE status <> 'new' OR booked_at IS NOT NULL OR arrived_at IS NOT NULL)::int AS updated,
  count(*) FILTER (WHERE status = 'new')::int AS new, count(*) FILTER (WHERE status = 'contacted')::int AS contacted,
  count(*) FILTER (WHERE status = 'booked')::int AS current_booked, count(*) FILTER (WHERE status = 'arrived')::int AS current_arrived,
  count(*) FILTER (WHERE status = 'no-show')::int AS no_show, count(*) FILTER (WHERE status = 'lost')::int AS lost`;
export async function getOutcomeReport(database: OutcomeDatabase, range: ReportRange) {
  const parsed = reportRangeSchema.parse(range);
  const leadRows = await database.execute(sql`WITH cohort AS (
    SELECT l.utm_source AS source, l.utm_medium AS medium, l.landing_page, COALESCE(l.campaign_id, l.utm_campaign, l.campaign_name) AS campaign,
      (COALESCE(NULLIF(l.gclid, ''), NULLIF(l.gbraid, ''), NULLIF(l.wbraid, '')) IS NOT NULL) AS has_google_click_id,
      l.lead_status AS status, COALESCE(l.booked_at, call_history.booked_at) AS booked_at,
      COALESCE(l.arrived_at, call_history.arrived_at) AS arrived_at FROM contacts l
    LEFT JOIN LATERAL (SELECT min(c.booked_at) AS booked_at, min(c.arrived_at) AS arrived_at FROM call_outcomes c WHERE c.linked_lead_id = l.id) call_history ON true
    WHERE l.is_test = false AND ((l.created_at AT TIME ZONE 'UTC') AT TIME ZONE 'America/Los_Angeles')::date BETWEEN ${parsed.start}::date AND ${parsed.end}::date
  ) SELECT source, medium, landing_page, campaign, has_google_click_id, ${countsSql} FROM cohort GROUP BY source, medium, landing_page, campaign, has_google_click_id`);
  const callRows = await database.execute(sql`WITH cohort AS (
    SELECT c.source, NULL::text AS landing_page, c.campaign, c.status, c.booked_at, c.arrived_at FROM call_outcomes c
    WHERE c.linked_lead_id IS NULL AND (c.occurred_at AT TIME ZONE 'America/Los_Angeles')::date BETWEEN ${parsed.start}::date AND ${parsed.end}::date
  ) SELECT source, landing_page, campaign, ${countsSql} FROM cohort GROUP BY source, landing_page, campaign`);
  const coverage = await database.execute(sql`SELECT count(*) FILTER (WHERE c.linked_lead_id IS NOT NULL AND l.is_test = false)::int AS linked_calls_excluded,
    count(*) FILTER (WHERE c.linked_lead_id IS NULL)::int AS unlinked_calls
    FROM call_outcomes c LEFT JOIN contacts l ON l.id = c.linked_lead_id
    WHERE (c.occurred_at AT TIME ZONE 'America/Los_Angeles')::date BETWEEN ${parsed.start}::date AND ${parsed.end}::date`);
  const coverageRow = coverage.rows[0] as { linked_calls_excluded: number; unlinked_calls: number };
  return { cohort: { ...parsed, timeZone: OUTCOME_TIME_ZONE }, leads: summarizeOutcomeRows(leadRows.rows as AggregateRow[]), unlinkedCalls: summarizeOutcomeRows(callRows.rows as AggregateRow[]), linkedCallsExcluded: Number(coverageRow.linked_calls_excluded),
    definitions: { arrived: "Records with an attended visit; not unique patients or confirmed new patients.", completeness: "Share of cohort records with a non-new current status or a recorded booking/attendance milestone; not a reconciliation with the practice schedule.", calls: "Unlinked calls are separate records, not deduplicated people. Linked calls enrich the linked lead booking/attendance milestones once and are excluded from call totals. Current lead status remains staff-owned. A linked lead may fall outside the selected lead cohort." } };
}
