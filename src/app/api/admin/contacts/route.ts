import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/server/storage";

export const runtime = "nodejs";

const parseIntQuery = (value: string | null, fallback: number) => {
  if (typeof value !== "string") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const jsonResponse = (payload: unknown, init?: ResponseInit) => {
  const response = NextResponse.json(payload, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
};

export async function GET(req: NextRequest) {
  const limitRaw = parseIntQuery(req.nextUrl.searchParams.get("limit"), 50);
  const offsetRaw = parseIntQuery(req.nextUrl.searchParams.get("offset"), 0);
  const limit = Math.min(Math.max(limitRaw, 1), 200);
  const offset = Math.max(offsetRaw, 0);
  const q = req.nextUrl.searchParams.get("q")?.trim().slice(0, 200) || undefined;

  try {
    const payload = await storage.listContacts({ limit, offset, q });
    return jsonResponse(payload);
  } catch (error: any) {
    console.error("Admin contacts error:", error);
    const message =
      typeof error?.message === "string" && error.message
        ? `Contacts API error: ${error.message}`
        : "Failed to load contacts.";

    return jsonResponse(
      {
        ok: false,
        error: "server_error",
        message,
      },
      { status: 500 },
    );
  }
}
