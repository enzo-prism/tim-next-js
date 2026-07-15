import { NextRequest, NextResponse } from "next/server";
import { requireAdminBasicAuth } from "@/app/api/admin/contacts/admin-auth";
import { toAdminContactItem } from "@/app/api/admin/contacts/contact-dto";
import type { AdminContactsResponse } from "@/app/api/admin/contacts/types";
import { LEAD_STATUS_VALUES, type LeadStatus } from "@/server/schema";
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

const isLeadStatus = (value: string): value is LeadStatus =>
  LEAD_STATUS_VALUES.some((status) => status === value);

export async function GET(req: NextRequest) {
  const authResponse = requireAdminBasicAuth(req);
  if (authResponse) return authResponse;

  const limitRaw = parseIntQuery(req.nextUrl.searchParams.get("limit"), 50);
  const offsetRaw = parseIntQuery(req.nextUrl.searchParams.get("offset"), 0);
  const limit = Math.min(Math.max(limitRaw, 1), 200);
  const offset = Math.max(offsetRaw, 0);
  const q = req.nextUrl.searchParams.get("q")?.trim().slice(0, 200) || undefined;
  const statusParam = req.nextUrl.searchParams.get("status")?.trim();
  if (statusParam && !isLeadStatus(statusParam)) {
    return jsonResponse(
      { ok: false, error: "invalid_status", message: "Invalid lead status." },
      { status: 400 },
    );
  }
  const status = statusParam && isLeadStatus(statusParam) ? statusParam : undefined;
  const source = req.nextUrl.searchParams.get("source")?.trim().slice(0, 200) || undefined;

  try {
    const [contactsResult, sourceSummary] = await Promise.all([
      storage.listContacts({
        limit,
        offset,
        q,
        status,
        source,
      }),
      storage.getLeadSourceSummary(),
    ]);
    const payload: AdminContactsResponse = {
      total: contactsResult.total,
      items: contactsResult.items.map(toAdminContactItem),
      sourceSummary,
    };
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
