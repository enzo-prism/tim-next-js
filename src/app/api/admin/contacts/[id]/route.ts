import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminBasicAuth } from "@/app/api/admin/contacts/admin-auth";
import { toAdminContactItem } from "@/app/api/admin/contacts/contact-dto";
import type { UpdateAdminContactResponse } from "@/app/api/admin/contacts/types";
import { LEAD_STATUS_VALUES } from "@/server/schema";
import { storage } from "@/server/storage";

export const runtime = "nodejs";

const updateSchema = z
  .object({
    leadStatus: z.enum(LEAD_STATUS_VALUES).optional(),
    lostReason: z.string().trim().max(500).nullable().optional(),
    staffNotes: z.string().trim().max(4000).nullable().optional(),
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authResponse = requireAdminBasicAuth(request);
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
    const contact = await storage.updateContactLifecycle(id, parsed.data);
    if (!contact) {
      return jsonResponse(
        { ok: false, error: "not_found", message: "Lead not found." },
        { status: 404 },
      );
    }

    const payload: UpdateAdminContactResponse = {
      ok: true,
      item: toAdminContactItem(contact),
    };
    return jsonResponse(payload);
  } catch (error) {
    console.error("Admin contact lifecycle update error:", error);
    return jsonResponse(
      { ok: false, error: "server_error", message: "Failed to update lead." },
      { status: 500 },
    );
  }
}
