import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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

type ContactListInput = {
  limit: number;
  offset: number;
  q?: string;
  status?: LeadStatus;
  source?: string;
};

const listContacts = async (input: ContactListInput) => {
  try {
    const [contactsResult, sourceSummary, countsByStatus] = await Promise.all([
      storage.listContacts(input),
      storage.getLeadSourceSummary(),
      storage.getCountsByStatus(),
    ]);
    const payload: AdminContactsResponse = {
      total: contactsResult.total,
      items: contactsResult.items.map(toAdminContactItem),
      sourceSummary,
      countsByStatus,
    };
    return jsonResponse(payload);
  } catch {
    console.error("Admin contacts query failed.");
    return jsonResponse(
      {
        ok: false,
        error: "server_error",
        message: "Failed to load contacts.",
      },
      { status: 500 },
    );
  }
};

export async function GET(req: NextRequest) {
  const authResponse = requireAdminBasicAuth(req);
  if (authResponse) return authResponse;

  if (req.nextUrl.searchParams.has("q")) {
    return jsonResponse(
      {
        ok: false,
        error: "search_body_required",
        message: "Send private search terms in a POST request body.",
      },
      { status: 400 },
    );
  }

  const limitRaw = parseIntQuery(req.nextUrl.searchParams.get("limit"), 50);
  const offsetRaw = parseIntQuery(req.nextUrl.searchParams.get("offset"), 0);
  const statusParam = req.nextUrl.searchParams.get("status")?.trim();
  if (statusParam && !isLeadStatus(statusParam)) {
    return jsonResponse(
      { ok: false, error: "invalid_status", message: "Invalid lead status." },
      { status: 400 },
    );
  }

  return listContacts({
    limit: Math.min(Math.max(limitRaw, 1), 200),
    offset: Math.max(offsetRaw, 0),
    status: statusParam && isLeadStatus(statusParam) ? statusParam : undefined,
    source: req.nextUrl.searchParams.get("source")?.trim().slice(0, 200) || undefined,
  });
}

const searchSchema = z
  .object({
    limit: z.number().int().min(1).max(200).default(50),
    offset: z.number().int().min(0).default(0),
    q: z.string().trim().max(200).optional(),
    status: z.enum(LEAD_STATUS_VALUES).optional(),
    source: z.string().trim().max(200).optional(),
  })
  .strict();

export async function POST(req: NextRequest) {
  const authResponse = requireAdminBasicAuth(req);
  if (authResponse) return authResponse;

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 4_000) {
    return jsonResponse(
      { ok: false, error: "payload_too_large", message: "Search request is too large." },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(
      { ok: false, error: "invalid_json", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = searchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse(
      { ok: false, error: "invalid_search", message: "Invalid contact search." },
      { status: 400 },
    );
  }

  return listContacts({
    ...parsed.data,
    q: parsed.data.q || undefined,
    source: parsed.data.source || undefined,
  });
}
