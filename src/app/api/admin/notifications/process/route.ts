import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { processOutboxBatch } from "@/server/notification-processor";

export const runtime = "nodejs";

const jsonResponse = (payload: unknown, init?: ResponseInit) => {
  const response = NextResponse.json(payload, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
};

const requireCronAuth = (req: NextRequest): NextResponse | null => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return jsonResponse(
      { ok: false, error: "cron_not_configured", message: "Cron secret is not configured." },
      { status: 503 },
    );
  }

  const authHeader = req.headers.get("authorization") || "";
  const provided = Buffer.from(authHeader, "utf-8");
  const expected = Buffer.from(`Bearer ${cronSecret}`, "utf-8");

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return jsonResponse(
      { ok: false, error: "unauthorized", message: "Invalid cron authorization." },
      { status: 401 },
    );
  }

  return null;
};

const handleProcess = async () => {
  const result = await processOutboxBatch();
  return jsonResponse({ ok: true, ...result });
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
