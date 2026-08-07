import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/app/api/admin/contacts/admin-auth";
import { toAdminContactDetail, toAdminContactItem } from "@/app/api/admin/contacts/contact-dto";
import type { UpdateAdminContactResponse } from "@/app/api/admin/contacts/types";
import { LEAD_STATUS_VALUES } from "@/server/schema";
import { storage } from "@/server/storage";

export const runtime = "nodejs";

const updateSchema = z
  .object({
    leadStatus: z.enum(LEAD_STATUS_VALUES).optional(),
    lostReason: z.string().trim().max(500).nullable().optional(),
    staffNotes: z.string().trim().max(4000).nullable().optional(),
    expectedUpdatedAt: z.string().datetime(),
  })
  .strict()
  .refine(
    (value) =>
      value.leadStatus !== undefined ||
      value.lostReason !== undefined ||
      value.staffNotes !== undefined,
    { message: "Provide at least one lifecycle update." },
  )
  .refine(
    (value) => value.leadStatus !== "lost" || Boolean(value.lostReason?.trim()),
    { message: "A reason is required when marking a lead lost.", path: ["lostReason"] },
  );

const jsonResponse = (payload: unknown, init?: ResponseInit) => {
  const response = NextResponse.json(payload, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authResponse = await requireAdminSession(request);
  if (authResponse) return authResponse;

  const { id } = await context.params;
  if (!id || id.length > 100) {
    return jsonResponse(
      { ok: false, error: "invalid_id", message: "Invalid contact id." },
      { status: 400 },
    );
  }

  try {
    const contact = await storage.getContact(id);
    if (!contact) {
      return jsonResponse(
        { ok: false, error: "not_found", message: "Lead not found." },
        { status: 404 },
      );
    }
    return jsonResponse({ ok: true, item: toAdminContactDetail(contact) });
  } catch {
    console.error("admin_contact_detail_fetch_failed");
    return jsonResponse(
      { ok: false, error: "server_error", message: "Failed to load lead." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authResponse = await requireAdminSession(request);
  if (authResponse) return authResponse;

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 12_000) {
    return jsonResponse(
      { ok: false, error: "payload_too_large", message: "Update is too large." },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { ok: false, error: "invalid_json", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse(
      {
        ok: false,
        error: "invalid_update",
        message: parsed.error.issues[0]?.message || "Invalid lifecycle update.",
      },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  if (!id || id.length > 100) {
    return jsonResponse(
      { ok: false, error: "invalid_id", message: "Invalid contact id." },
      { status: 400 },
    );
  }

  try {
    const result = await storage.updateContactLifecycle(id, {
      ...parsed.data,
      expectedUpdatedAt: new Date(parsed.data.expectedUpdatedAt),
    });
    if (result.status === "not_found") {
      return jsonResponse(
        { ok: false, error: "not_found", message: "Lead not found." },
        { status: 404 },
      );
    }
    if (result.status === "conflict") {
      return jsonResponse(
        {
          ok: false,
          error: "update_conflict",
          message: "This lead changed since you opened it. Refresh and try again.",
        },
        { status: 409 },
      );
    }
    if (result.status === "invalid_lost_reason") {
      return jsonResponse(
        {
          ok: false,
          error: "invalid_update",
          message: "A reason is required while a lead is marked lost.",
        },
        { status: 400 },
      );
    }

    const payload: UpdateAdminContactResponse = {
      ok: true,
      item: toAdminContactItem(result.contact),
    };
    return jsonResponse(payload);
  } catch {
    console.error("Admin contact lifecycle update failed.");
    return jsonResponse(
      { ok: false, error: "server_error", message: "Failed to update lead." },
      { status: 500 },
    );
  }
}
