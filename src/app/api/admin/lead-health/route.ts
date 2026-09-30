import { NextRequest } from "next/server";
import { cronJsonResponse, requireCronAuth } from "@/server/cron-auth";
import { readLeadDeliveryHealth, sendLeadDeliveryHealthAlert } from "@/server/lead-delivery-health";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const denied = requireCronAuth(request);
  if (denied) return denied;
  const health = await readLeadDeliveryHealth();
  const alert = await sendLeadDeliveryHealthAlert(health);
  return cronJsonResponse({ ...health, alert }, { status: health.ok && alert !== "failed" ? 200 : 503 });
}
