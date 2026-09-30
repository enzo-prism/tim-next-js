import { db } from "@/server/db";
import { callOutcomeSchema, recordCallOutcome } from "@/server/outcome-reporting";
import { outcomeJson, readOutcomeBody, requireOutcomeAccess } from "@/server/outcome-api";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const blocked = requireOutcomeAccess(request);
  if (blocked) return blocked;
  let payload: unknown;
  try { payload = await readOutcomeBody(request); } catch { return outcomeJson({ ok: false, error: "invalid_request" }, 400); }
  const parsed = callOutcomeSchema.safeParse(payload);
  if (!parsed.success) return outcomeJson({ ok: false, error: "invalid_request" }, 400);
  try {
    const result = await recordCallOutcome(db!, parsed.data);
    const status = ["recorded", "duplicate"].includes(result.status) ? 200 : result.status === "lead_not_found" ? 404 : result.status === "invalid_observation_time" ? 400 : 409;
    return outcomeJson({ ok: status === 200, ...result }, status);
  } catch { return outcomeJson({ ok: false, error: "outcome_unavailable" }, 503); }
}
