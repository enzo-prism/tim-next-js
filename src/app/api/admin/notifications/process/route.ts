import { NextRequest, NextResponse } from "next/server";
import { processOutboxBatch } from "@/server/notification-processor";

export const runtime = "nodejs";

const jsonResponse = (payload: unknown, init?: ResponseInit) => {
  const response = NextResponse.json(payload, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
};

const requireCronAuth = (req: NextRequest): NextResponse | null => {
  const cronSecret = process.env.NOTIFICATION_CRON_SECRET;
  if (!cronSecret) {
    return jsonResponse(
      { ok: false, error: "cron_not_configured", message: "Cron secret is not configured." },
      { status: 503 },
    );
  }

  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${cronSecret}`;
  if (authHeader !== expected) {
    return jsonResponse(
      { ok: false, error: "unauthorized", message: "Invalid cron authorization." },
      { status: 401 },
    );
  }

  return null;
};

export async function POST(req: NextRequest) {
  const authResponse = requireCronAuth(req);
  if (authResponse) return authResponse;

  const result = await processOutboxBatch();

  return jsonResponse({
    ok: true,
    ...result,
  });
}
