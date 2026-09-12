import { after, NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { z } from "zod";
import { storage } from "@/server/storage";
import { processOutboxBatch } from "@/server/notification-processor";
import {
  mapGoogleAdsColumnsToContact,
  parseGoogleAdsColumnData,
} from "@/server/google-ads-lead";
import { GOOGLE_ADS_WEBHOOK_KEY_SETUP } from "@/server/lead-capture-setup";

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

const verifyGoogleKey = (providedKey: string): boolean => {
  const configuredKey = process.env.GOOGLE_ADS_WEBHOOK_KEY;
  if (!configuredKey) return false;
  const provided = Buffer.from(providedKey, "utf-8");
  const expected = Buffer.from(configuredKey, "utf-8");
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
};

const errorResponse = (message: string, status: number, extra?: Record<string, unknown>) =>
  NextResponse.json({ message, ...extra }, { status });

const sanitizePayload = (body: Record<string, unknown>): Record<string, unknown> => {
  const sanitized = { ...body };
  delete sanitized.google_key;
  return sanitized;
};

export async function POST(req: NextRequest) {
  if (!process.env.GOOGLE_ADS_WEBHOOK_KEY) {
    console.error("google_ads_webhook_key_not_configured", {
      setup: GOOGLE_ADS_WEBHOOK_KEY_SETUP,
    });
    return errorResponse("Webhook key not configured.", 503, {
      error: "webhook_key_not_configured",
      setup: GOOGLE_ADS_WEBHOOK_KEY_SETUP,
    });
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

  const parsed = googleAdsWebhookSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("Invalid payload.", 400);
  }

  const payload = parsed.data;

  if (!verifyGoogleKey(payload.google_key)) {
    return errorResponse("Invalid key.", 401);
  }

  const columns = parseGoogleAdsColumnData(payload.user_column_data);
  const email = columns.EMAIL?.trim() || null;
  const phone = columns.PHONE_NUMBER?.trim() || null;

  if (!email && !phone) {
    return errorResponse("No contact information provided.", 400);
  }

  const contactData = mapGoogleAdsColumnsToContact({
    leadId: payload.lead_id,
    campaignId: payload.campaign_id != null ? String(payload.campaign_id) : null,
    gclid: payload.gcl_id || null,
    isTest: payload.is_test ?? false,
    ingestedVia: "webhook",
    columns,
    rawPayload: sanitizePayload(body as Record<string, unknown>),
  });

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
