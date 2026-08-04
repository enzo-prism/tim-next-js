import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  createContactIgnoreDuplicate: vi.fn(),
}));

vi.mock("@/server/storage", () => ({
  storage: {
    createContactIgnoreDuplicate: mocks.createContactIgnoreDuplicate,
  },
}));

import { POST } from "@/app/api/webhooks/google-ads/route";

const TEST_KEY = "test-google-webhook-key";

const officialNumericSample = {
  google_key: TEST_KEY,
  lead_id: "google-lead-001",
  campaign_id: 12345678901,
  gcl_id: "test-gclid-value",
  form_id: 9876543210,
  adgroup_id: 11122233344,
  creative_id: 55566677788,
  api_version: "2026-05",
  is_test: false,
  user_column_data: [
    { column_id: "FULL_NAME", column_name: "Full name", string_value: "Jane Doe" },
    { column_id: "EMAIL", column_name: "Email", string_value: "jane.doe@example.com" },
    { column_id: "PHONE_NUMBER", column_name: "Phone number", string_value: "408-555-0100" },
    { column_id: "SERVICE", column_name: "Service", string_value: "invisalign" },
    { column_id: "CAMPAIGN_NAME", column_name: "Campaign name", string_value: "Invisalign San Jose" },
    { column_id: "COMMENT", column_name: "Comment", string_value: "Please call after 3pm" },
    { column_id: "CUSTOM_QUESTION_1", column_name: "Do you have insurance?", string_value: "Yes, I have insurance" },
  ],
};

const buildRequest = (body: unknown): NextRequest => {
  return new NextRequest("http://localhost/api/webhooks/google-ads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

describe("Google Ads webhook POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_ADS_WEBHOOK_KEY = TEST_KEY;
    mocks.createContactIgnoreDuplicate.mockResolvedValue({ id: "new-contact-id" });
  });

  it("returns 503 with message when webhook key is not configured", async () => {
    delete process.env.GOOGLE_ADS_WEBHOOK_KEY;
    const response = await POST(buildRequest(officialNumericSample));
    expect(response.status).toBe(503);
    const json = await response.json();
    expect(json.message).toBeDefined();
    expect(mocks.createContactIgnoreDuplicate).not.toHaveBeenCalled();
  });

  it("returns 400 with message for invalid JSON", async () => {
    const request = new NextRequest("http://localhost/api/webhooks/google-ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.message).toBeDefined();
    expect(mocks.createContactIgnoreDuplicate).not.toHaveBeenCalled();
  });

  it("returns 400 with message for malformed payload", async () => {
    const payload = { google_key: TEST_KEY, user_column_data: [] };
    const response = await POST(buildRequest(payload));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.message).toBeDefined();
    expect(mocks.createContactIgnoreDuplicate).not.toHaveBeenCalled();
  });

  it("returns 401 with message when google_key does not match", async () => {
    const payload = { ...officialNumericSample, google_key: "wrong-key" };
    const response = await POST(buildRequest(payload));
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.message).toBeDefined();
    expect(mocks.createContactIgnoreDuplicate).not.toHaveBeenCalled();
  });

  it("returns 400 when no contact info (email or phone) is present", async () => {
    const payload = {
      google_key: TEST_KEY,
      lead_id: "lead-no-contact",
      user_column_data: [
        { column_id: "FULL_NAME", string_value: "Jane Doe" },
      ],
    };
    const response = await POST(buildRequest(payload));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.message).toBeDefined();
    expect(mocks.createContactIgnoreDuplicate).not.toHaveBeenCalled();
  });

  it("returns 413 when body exceeds size limit", async () => {
    const largePayload = {
      ...officialNumericSample,
      user_column_data: [
        { column_id: "FULL_NAME", string_value: "Jane Doe" },
        { column_id: "EMAIL", string_value: "jane@example.com" },
        { column_id: "COMMENT", string_value: "x".repeat(70_000) },
      ],
    };
    const response = await POST(buildRequest(largePayload));
    expect(response.status).toBe(413);
    const json = await response.json();
    expect(json.message).toBeDefined();
    expect(mocks.createContactIgnoreDuplicate).not.toHaveBeenCalled();
  });

  it("creates contact from exact numeric official sample and returns 200 {}", async () => {
    const response = await POST(buildRequest(officialNumericSample));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({});
    expect(mocks.createContactIgnoreDuplicate).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane.doe@example.com",
        phone: "408-555-0100",
        service: "invisalign",
        message: "Please call after 3pm",
        requestType: "google_ads_lead",
        googleAdsLeadId: "google-lead-001",
        campaignId: "12345678901",
        campaignName: "Invisalign San Jose",
        ingestedVia: "webhook",
        gclid: "test-gclid-value",
        utmSource: "google",
        utmMedium: "cpc",
        leadStatus: "new",
        isTest: false,
      }),
    );
  });

  it("sanitizes google_key from rawPayload before storage", async () => {
    const response = await POST(buildRequest(officialNumericSample));
    expect(response.status).toBe(200);
    const call = mocks.createContactIgnoreDuplicate.mock.calls[0][0];
    expect(call.rawPayload).not.toHaveProperty("google_key");
    expect(call.rawPayload).toHaveProperty("lead_id", "google-lead-001");
    expect(call.rawPayload).toHaveProperty("campaign_id", 12345678901);
    expect(call.rawPayload).toHaveProperty("adgroup_id", 11122233344);
    expect(call.rawPayload).toHaveProperty("creative_id", 55566677788);
    expect(call.rawPayload).toHaveProperty("api_version", "2026-05");
    expect(call.rawPayload).toHaveProperty("is_test", false);
  });

  it("preserves all user_column_data in rawPayload including custom fields", async () => {
    const response = await POST(buildRequest(officialNumericSample));
    expect(response.status).toBe(200);
    const call = mocks.createContactIgnoreDuplicate.mock.calls[0][0];
    expect(call.rawPayload.user_column_data).toHaveLength(7);
    expect(call.rawPayload.user_column_data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ column_id: "CUSTOM_QUESTION_1", column_name: "Do you have insurance?" }),
      ]),
    );
  });

  it("uses stable top-level lead_id for deduplication", async () => {
    const response = await POST(buildRequest(officialNumericSample));
    expect(response.status).toBe(200);
    expect(mocks.createContactIgnoreDuplicate).toHaveBeenCalledWith(
      expect.objectContaining({
        googleAdsLeadId: "google-lead-001",
      }),
    );
  });

  it("returns 200 {} for duplicate delivery (storage returns null)", async () => {
    mocks.createContactIgnoreDuplicate.mockResolvedValue(null);
    const response = await POST(buildRequest(officialNumericSample));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({});
    expect(mocks.createContactIgnoreDuplicate).toHaveBeenCalledTimes(1);
  });

  it("supports phone-only leads with email null", async () => {
    const payload = {
      google_key: TEST_KEY,
      lead_id: "phone-only-lead",
      campaign_id: 11122233344,
      user_column_data: [
        { column_id: "FULL_NAME", string_value: "John Smith" },
        { column_id: "PHONE_NUMBER", string_value: "408-555-0200" },
      ],
    };
    const response = await POST(buildRequest(payload));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({});
    expect(mocks.createContactIgnoreDuplicate).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "John",
        lastName: "Smith",
        email: null,
        phone: "408-555-0200",
        googleAdsLeadId: "phone-only-lead",
      }),
    );
  });

  it("marks test leads with is_test flag", async () => {
    const payload = {
      ...officialNumericSample,
      is_test: true,
      lead_id: "test-lead-001",
    };
    const response = await POST(buildRequest(payload));
    expect(response.status).toBe(200);
    expect(mocks.createContactIgnoreDuplicate).toHaveBeenCalledWith(
      expect.objectContaining({
        isTest: true,
        googleAdsLeadId: "test-lead-001",
      }),
    );
  });

  it("returns 500 with message when storage throws unexpected error", async () => {
    mocks.createContactIgnoreDuplicate.mockRejectedValue(new Error("db down"));
    const response = await POST(buildRequest(officialNumericSample));
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.message).toBeDefined();
    expect(mocks.createContactIgnoreDuplicate).toHaveBeenCalledTimes(1);
  });

  it("parses FIRST_NAME/LAST_NAME when FULL_NAME is absent", async () => {
    const payload = {
      google_key: TEST_KEY,
      lead_id: "split-name-lead",
      user_column_data: [
        { column_id: "FIRST_NAME", string_value: "John" },
        { column_id: "LAST_NAME", string_value: "Smith" },
        { column_id: "EMAIL", string_value: "john.smith@example.com" },
      ],
    };
    const response = await POST(buildRequest(payload));
    expect(response.status).toBe(200);
    expect(mocks.createContactIgnoreDuplicate).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "John",
        lastName: "Smith",
      }),
    );
  });

  it("handles null string_value in columns gracefully", async () => {
    const payload = {
      google_key: TEST_KEY,
      lead_id: "null-values-lead",
      user_column_data: [
        { column_id: "FULL_NAME", string_value: "Jane Doe" },
        { column_id: "EMAIL", string_value: "jane@example.com" },
        { column_id: "PHONE_NUMBER", string_value: null },
        { column_id: "SERVICE", string_value: null },
      ],
    };
    const response = await POST(buildRequest(payload));
    expect(response.status).toBe(200);
    expect(mocks.createContactIgnoreDuplicate).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: null,
        service: null,
      }),
    );
  });

  it("rejects null, boolean, and object values for campaign_id", async () => {
    for (const badValue of [null, true, { id: 1 }]) {
      const payload = { ...officialNumericSample, campaign_id: badValue };
      const response = await POST(buildRequest(payload));
      expect(response.status).toBe(400);
    }
    expect(mocks.createContactIgnoreDuplicate).not.toHaveBeenCalled();
  });
});
