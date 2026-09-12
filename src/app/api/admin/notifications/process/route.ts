import { NextRequest } from "next/server";
import { processScheduledNotifications } from "@/server/notification-processor";
import { cronJsonResponse, requireCronAuth } from "@/server/cron-auth";

export const runtime = "nodejs";

const handleProcess = async () => {
  const result = await processScheduledNotifications();
  return cronJsonResponse({ ok: true, ...result });
};

export async function POST(req: NextRequest) {
  const authResponse = requireCronAuth(req);
  if (authResponse) return authResponse;
  return handleProcess();
}

export async function GET(req: NextRequest) {
  const authResponse = requireCronAuth(req);
  if (authResponse) return authResponse;
  return handleProcess();
}
