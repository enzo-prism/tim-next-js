import { timingSafeEqual } from "crypto";
import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storage } from "@/server/storage";
import { processOutboxBatch } from "@/server/notification-processor";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 65_536;

class WebhookPayloadTooLargeError extends Error {
  constructor() {
    super("Webhook payload too large");
    this.name = "WebhookPayloadTooLargeError";
  }
}

const readWebhookBody = async (request: Request): Promise<string> => {
  const reader = request.body?.getReader();
  if (!reader) return "";

  const decoder = new TextDecoder();
  let byteCount = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    byteCount += value.byteLength;
    if (byteCount > MAX_BODY_BYTES) {
      await reader.cancel().catch(() => undefined);
      throw new WebhookPayloadTooLargeError();
    }
    body += decoder.decode(value, { stream: true });
  }

  body += decoder.decode();
  return body;
};

const ID_FIELD_PATTERN =
  /("(?:campaign_id|form_id|adgroup_id|creative_id)"\s*:\s*)(\d+)/g;

const preserveNumericIdsAsStrings = (rawBody: string): string =>
  rawBody.replace(ID_FIELD_PATTERN, (_match, prefix: string, digits: string) => {
    if (digits.length > 15 || Number(digits) > Number.MAX_SAFE_INTEGER) {
      return `${prefix}"${digits}"`;
    }
    return `${prefix}${digits}`;
  });

const numericOrStringId = z.union([
  z.string().min(1),
  z.number().int().nonnegative(),
]);

const userColumnDataSchema = z.object({
  column_id: z.string(),
  column_name: z.string().optional(),
  string_value: z.string().nullable().optional(),
});

const googleAdsWebhookSchema = z.object({
  google_key: z.string().min(1),
  lead_id: z.string().min(1),
  campaign_id: numericOrStringId.optional(),
  gcl_id: z.string().optional(),
  form_id: numericOrStringId.optional(),
  adgroup_id: numericOrStringId.optional(),
  creative_id: numericOrStringId.optional(),
  api_version: z.string().optional(),
  is_test: z.boolean().optional(),
  user_column_data: z.array(userColumnDataSchema).min(1),
});

export type GoogleAdsWebhookPayload = z.infer<typeof googleAdsWebhookSchema>;

const COLUMN_IDS = {
  FULL_NAME: "FULL_NAME",
  FIRST_NAME: "FIRST_NAME",
  LAST_NAME: "LAST_NAME",
  EMAIL: "EMAIL",
  PHONE_NUMBER: "PHONE_NUMBER",
  CITY: "CITY",
  POSTAL_CODE: "POSTAL_CODE",
  COUNTRY: "COUNTRY",
  STATE: "STATE",
  STREET_ADDRESS: "STREET_ADDRESS",
  COMMENT: "COMMENT",
  SERVICE: "SERVICE",
  PREFERRED_CONTACT_METHOD: "PREFERRED_CONTACT_METHOD",
  PREFERRED_CONTACT_TIME: "PREFERRED_CONTACT_TIME",
} as const;

const parseColumnData = (
  columns: Array<{ column_id: string; string_value?: string | null }>,
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const col of columns) {
    if (col.string_value) {
      result[col.column_id] = col.string_value;
    }
  }
  return result;
};

const verifyGoogleKey = (providedKey: string): boolean => {
  const configuredKey = process.env.GOOGLE_ADS_WEBHOOK_KEY;
  if (!configuredKey) return false;
  const provided = Buffer.from(providedKey, "utf-8");
  const expected = Buffer.from(configuredKey, "utf-8");
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
};

const parseName = (
  columns: Record<string, string>,
  email?: string,
): { firstName: string; lastName: string } => {
  const fullName = columns[COLUMN_IDS.FULL_NAME]?.trim();
  if (fullName) {
    const parts = fullName.split(/\s+/);
    if (parts.length >= 2) {
      return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
    }
    return { firstName: fullName, lastName: "Lead" };
  }

  const firstName = columns[COLUMN_IDS.FIRST_NAME]?.trim();
  const lastName = columns[COLUMN_IDS.LAST_NAME]?.trim();
  if (firstName || lastName) {
    return {
      firstName: firstName || "Unknown",
      lastName: lastName || "Lead",
    };
  }

  if (email) {
    const localPart = email.split("@")[0]?.trim();
    if (localPart) {
      const parts = localPart.split(/[._-]/).filter(Boolean);
      if (parts.length >= 2) {
        return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
      }
      return { firstName: localPart, lastName: "Lead" };
    }
  }

  return { firstName: "Unknown", lastName: "Lead" };
};

const errorResponse = (message: string, status: number) =>
  NextResponse.json({ message }, { status });

const sanitizePayload = (body: Record<string, unknown>): Record<string, unknown> => {
  const sanitized = { ...body };
  delete sanitized.google_key;
  return sanitized;
};

export async function POST(req: NextRequest) {
  if (!process.env.GOOGLE_ADS_WEBHOOK_KEY) {
    return errorResponse("Webhook key not configured.", 503);
  }

  let rawBody: string;
  try {
    rawBody = await readWebhookBody(req);
  } catch (error) {
    if (error instanceof WebhookPayloadTooLargeError) {
      return errorResponse("Request body too large.", 413);
    }
    return errorResponse("Invalid request body.", 400);
  }

  let body: unknown;
  try {
    body = JSON.parse(preserveNumericIdsAsStrings(rawBody));
  } catch {
    return errorResponse("Invalid JSON.", 400);
  }

  const result = googleAdsWebhookSchema.safeParse(body);
  if (!result.success) {
    return errorResponse("Invalid payload.", 400);
  }

  const payload = result.data;

  if (!verifyGoogleKey(payload.google_key)) {
    return errorResponse("Invalid key.", 401);
  }

  const columns = parseColumnData(payload.user_column_data);
  const email = columns[COLUMN_IDS.EMAIL]?.trim() || null;
  const phone = columns[COLUMN_IDS.PHONE_NUMBER]?.trim() || null;

  if (!email && !phone) {
    return errorResponse("No contact information provided.", 400);
  }

  const { firstName, lastName } = parseName(columns, email ?? undefined);

  const contactData = {
    firstName,
    lastName,
    email,
    phone,
    service: columns[COLUMN_IDS.SERVICE]?.trim() || null,
    message: columns[COLUMN_IDS.COMMENT]?.trim() || null,
    requestType: "google_ads_lead" as const,
    googleAdsLeadId: payload.lead_id,
    campaignId: payload.campaign_id != null ? String(payload.campaign_id) : null,
    campaignName: columns["CAMPAIGN_NAME"]?.trim() || null,
    ingestedVia: "webhook" as const,
    gclid: payload.gcl_id || null,
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: columns["CAMPAIGN_NAME"]?.trim() || null,
    consentToContact: true,
    leadStatus: "new" as const,
    isTest: payload.is_test ?? false,
    rawPayload: sanitizePayload(body as Record<string, unknown>),
  };

  try {
    const result = await storage.createContactWithOutbox(contactData);
    if (result.outboxEnqueued) {
      after(async () => {
        await processOutboxBatch().catch(() => undefined);
      });
    }
  } catch {
    console.error("google_ads_webhook_insert_failed");
    return errorResponse("Internal server error.", 500);
  }

  return NextResponse.json({}, { status: 200 });
}
