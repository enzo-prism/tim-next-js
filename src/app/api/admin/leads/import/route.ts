import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, or, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { contacts } from "@/server/schema";
import { LEADS_IMPORT_SETUP } from "@/server/lead-capture-setup";

export const runtime = "nodejs";

const MAX_LEADS_PER_REQUEST = 50;
const DUPLICATE_WINDOW_MINUTES = 10;

const emailLeadSchema = z.object({
  gmailMessageId: z.string().min(1).max(128),
  internalDate: z.string().regex(/^\d{1,16}$/),
  fullName: z.string().min(1).max(200),
  email: z.string().email().max(320).nullish(),
  phone: z.string().max(32).nullish(),
  campaignName: z.string().max(200).nullish(),
  campaignId: z.string().max(32).nullish(),
});

const importRequestSchema = z.object({
  leads: z.array(emailLeadSchema).min(1).max(MAX_LEADS_PER_REQUEST),
});

type LeadStatus = "inserted" | "exists" | "duplicate" | "invalid" | "error";

const jsonResponse = (payload: unknown, init?: ResponseInit) => {
  const response = NextResponse.json(payload, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
};

const requireImportAuth = (req: NextRequest): NextResponse | null => {
  const importSecret = process.env.LEADS_IMPORT_SECRET;
  if (!importSecret) {
    console.error("leads_import_not_configured", { setup: LEADS_IMPORT_SETUP });
    return jsonResponse(
      {
        ok: false,
        error: "import_not_configured",
        message: "Lead import secret is not configured.",
        setup: LEADS_IMPORT_SETUP,
      },
      { status: 503 },
    );
  }

  const authHeader = req.headers.get("authorization") || "";
  const provided = Buffer.from(authHeader, "utf-8");
  const expected = Buffer.from(`Bearer ${importSecret}`, "utf-8");

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return jsonResponse(
      { ok: false, error: "unauthorized", message: "Invalid import authorization." },
      { status: 401 },
    );
  }

  return null;
};

const splitName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Unknown", lastName: "Lead" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
};

export async function POST(req: NextRequest) {
  const authResponse = requireImportAuth(req);
  if (authResponse) return authResponse;

  if (!db) {
    return jsonResponse(
      { ok: false, error: "database_unavailable", message: "Database is not configured." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(
      { ok: false, error: "invalid_json", message: "Request body must be JSON." },
      { status: 400 },
    );
  }

  const parsed = importRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse(
      { ok: false, error: "invalid_request", message: "Invalid lead payload." },
      { status: 400 },
    );
  }

  const database = db;
  const results: Array<{ index: number; status: LeadStatus }> = [];
  let inserted = 0;
  let skippedExisting = 0;
  let skippedDuplicate = 0;

  for (const [index, lead] of parsed.data.leads.entries()) {
    const receivedAt = new Date(Number(lead.internalDate));
    if (Number.isNaN(receivedAt.getTime())) {
      results.push({ index, status: "invalid" });
      continue;
    }

    try {
      const existingById = await database
        .select({ id: contacts.id })
        .from(contacts)
        .where(eq(contacts.googleAdsLeadId, lead.gmailMessageId))
        .limit(1);
      if (existingById.length > 0) {
        skippedExisting += 1;
        results.push({ index, status: "exists" });
        continue;
      }

      const email = lead.email?.trim() || null;
      const phone = lead.phone?.trim() || null;
      if (email || phone) {
        const matchers = [];
        if (email) matchers.push(sql`lower(${contacts.email}) = lower(${email})`);
        if (phone) matchers.push(eq(contacts.phone, phone));
        const nearDuplicate = await database
          .select({ id: contacts.id })
          .from(contacts)
          .where(
            and(
              or(...matchers),
              sql`${contacts.createdAt} BETWEEN ${receivedAt.toISOString()}::timestamp - make_interval(mins => ${DUPLICATE_WINDOW_MINUTES}) AND ${receivedAt.toISOString()}::timestamp + make_interval(mins => ${DUPLICATE_WINDOW_MINUTES})`,
            ),
          )
          .limit(1);
        if (nearDuplicate.length > 0) {
          skippedDuplicate += 1;
          results.push({ index, status: "duplicate" });
          continue;
        }
      }

      const { firstName, lastName } = splitName(lead.fullName);
      await database.insert(contacts).values({
        firstName,
        lastName,
        email,
        phone,
        requestType: "google_ads_lead",
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: lead.campaignName ?? null,
        leadStatus: "new",
        googleAdsLeadId: lead.gmailMessageId,
        campaignId: lead.campaignId ?? null,
        campaignName: lead.campaignName ?? null,
        ingestedVia: "email-import",
        isTest: false,
        rawPayload: {
          source: "google-ads-lead-email",
          gmail_message_id: lead.gmailMessageId,
          received_at: receivedAt.toISOString(),
        },
        createdAt: receivedAt,
        updatedAt: receivedAt,
      });
      inserted += 1;
      results.push({ index, status: "inserted" });
    } catch (error) {
      console.error("lead_import_failed", { index, error: error instanceof Error ? error.message : String(error) });
      results.push({ index, status: "error" });
    }
  }

  return jsonResponse({
    ok: true,
    received: parsed.data.leads.length,
    inserted,
    skippedExisting,
    skippedDuplicate,
    results,
  });
}
