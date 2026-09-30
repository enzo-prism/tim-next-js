import { storage } from "@/server/storage";
import { leadOutcomeSchema, recordLeadOutcome } from "@/server/outcome-reporting";
import { outcomeJson, readOutcomeBody, requireOutcomeAccess } from "@/server/outcome-api";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const blocked = requireOutcomeAccess(request);
  if (blocked) return blocked;
  const leadId = new URL(request.url).searchParams.get("leadId");
  const id = leadOutcomeSchema.innerType().shape.leadId.safeParse(leadId);
  if (!id.success) return outcomeJson({ ok: false, error: "invalid_request" }, 400);
  try {
    const lead = await storage.getContact(id.data);
    if (!lead || lead.isTest) return outcomeJson({ ok: false, error: "not_found" }, 404);
    return outcomeJson({ ok: true, status: lead.leadStatus, updatedAt: lead.updatedAt.toISOString() });
  } catch { return outcomeJson({ ok: false, error: "outcome_unavailable" }, 503); }
}
export async function POST(request: Request) {
  const blocked = requireOutcomeAccess(request);
  if (blocked) return blocked;
  let payload: unknown;
  try { payload = await readOutcomeBody(request); } catch { return outcomeJson({ ok: false, error: "invalid_request" }, 400); }
  const parsed = leadOutcomeSchema.safeParse(payload);
  if (!parsed.success) return outcomeJson({ ok: false, error: "invalid_request" }, 400);
  try {
    const existing = await storage.getContact(parsed.data.leadId);
    if (!existing || existing.isTest) return outcomeJson({ ok: false, error: "not_found" }, 404);
    const result = await recordLeadOutcome(storage, parsed.data);
    const status = result.status === "updated" ? 200 : result.status === "not_found" ? 404 : result.status === "conflict" ? 409 : 400;
    return outcomeJson({ ok: status === 200, ...result }, status);
  } catch { return outcomeJson({ ok: false, error: "outcome_unavailable" }, 503); }
}
