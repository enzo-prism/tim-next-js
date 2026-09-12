import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { CRON_SECRET_SETUP } from "@/server/lead-capture-setup";

const jsonResponse = (payload: unknown, init?: ResponseInit) => {
  const response = NextResponse.json(payload, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
};

export const cronJsonResponse = jsonResponse;

export const requireCronAuth = (req: NextRequest): NextResponse | null => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("cron_not_configured", { setup: CRON_SECRET_SETUP });
    return jsonResponse(
      {
        ok: false,
        error: "cron_not_configured",
        message: "Cron secret is not configured.",
        setup: CRON_SECRET_SETUP,
      },
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
