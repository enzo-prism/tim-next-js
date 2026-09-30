import { db } from "@/server/db";
import { getOutcomeReport, reportRangeSchema } from "@/server/outcome-reporting";
import { outcomeJson, requireOutcomeAccess } from "@/server/outcome-api";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const blocked = requireOutcomeAccess(request);
  if (blocked) return blocked;
  const params = new URL(request.url).searchParams;
  const parsed = reportRangeSchema.safeParse({ start: params.get("start"), end: params.get("end") });
  if (!parsed.success) return outcomeJson({ ok: false, error: "invalid_date_range" }, 400);
  try { return outcomeJson({ ok: true, report: await getOutcomeReport(db!, parsed.data) }); }
  catch { return outcomeJson({ ok: false, error: "outcome_unavailable" }, 503); }
}
