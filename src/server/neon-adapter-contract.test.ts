import { describe, expect, it, vi } from "vitest";
import { DatabaseStorage } from "@/server/storage";

const buildNeonHttpMock = (rows: Array<Record<string, unknown>>) => ({
  execute: vi.fn().mockResolvedValue({ rows }),
});

const CONTACT_ROW = {
  id: "contact-uuid-001",
  submission_id: null,
  first_name: "Jane",
  last_name: "Doe",
  email: "jane@example.com",
  phone: null,
  service: null,
  message: null,
  request_type: "google_ads_lead",
  preferred_date: null,
  preferred_time: null,
  formspree_status: null,
  landing_page: null,
  referrer: null,
  cta_source: null,
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: null,
  utm_term: null,
  utm_content: null,
  gclid: null,
  gbraid: null,
  wbraid: null,
  consent_to_contact: true,
  consent_version: null,
  lead_status: "new",
  contacted_at: null,
  booked_at: null,
  arrived_at: null,
  lost_reason: null,
  staff_notes: null,
  google_ads_lead_id: "lead-001",
  campaign_id: "12345",
  campaign_name: null,
  ingested_via: "webhook",
  updated_by: null,
  is_test: false,
  raw_payload: null,
  created_at: "2026-08-04T00:00:00.000Z",
  updated_at: "2026-08-04T00:00:00.000Z",
  outbox_enqueued: true,
};

describe("Neon HTTP adapter contract", () => {
  it("createContactWithOutbox does not call .transaction()", () => {
    const source = DatabaseStorage.prototype.createContactWithOutbox.toString();
    expect(source).not.toContain(".transaction(");
    expect(source).not.toContain("transaction(async");
  });

  it("createContactWithOutbox uses a single execute() call (Neon HTTP compatible)", () => {
    const source = DatabaseStorage.prototype.createContactWithOutbox.toString();
    expect(source).toContain("execute(");
    expect(source).toContain("WITH inserted_contact");
  });

  it("behavioral: createContactWithOutbox maps result.rows from Neon HTTP adapter shape", async () => {
    const mockDb = buildNeonHttpMock([CONTACT_ROW]);
    const storage = new DatabaseStorage(mockDb as never);

    const result = await storage.createContactWithOutbox({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      requestType: "google_ads_lead",
      googleAdsLeadId: "lead-001",
      ingestedVia: "webhook",
      leadStatus: "new",
      consentToContact: true,
      isTest: false,
    });

    expect(mockDb.execute).toHaveBeenCalledTimes(1);
    expect(result.contact).not.toBeNull();
    expect(result.contact!.id).toBe("contact-uuid-001");
    expect(result.contact!.firstName).toBe("Jane");
    expect(result.contact!.lastName).toBe("Doe");
    expect(result.contact!.email).toBe("jane@example.com");
    expect(result.contact!.googleAdsLeadId).toBe("lead-001");
    expect(result.contact!.isTest).toBe(false);
    expect(result.contact!.createdAt).toBeInstanceOf(Date);
    expect(result.outboxEnqueued).toBe(true);
  });

  it("behavioral: returns null contact when rows is empty (duplicate)", async () => {
    const mockDb = buildNeonHttpMock([]);
    const storage = new DatabaseStorage(mockDb as never);

    const result = await storage.createContactWithOutbox({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      requestType: "google_ads_lead",
      googleAdsLeadId: "lead-dup",
      ingestedVia: "webhook",
      leadStatus: "new",
      consentToContact: true,
      isTest: false,
    });

    expect(mockDb.execute).toHaveBeenCalledTimes(1);
    expect(result.contact).toBeNull();
    expect(result.outboxEnqueued).toBe(false);
  });

  it("behavioral: outbox_enqueued is false for test leads", async () => {
    const testRow = { ...CONTACT_ROW, is_test: true, outbox_enqueued: false };
    const mockDb = buildNeonHttpMock([testRow]);
    const storage = new DatabaseStorage(mockDb as never);

    const result = await storage.createContactWithOutbox({
      firstName: "Test",
      lastName: "Lead",
      email: "test@example.com",
      requestType: "google_ads_lead",
      googleAdsLeadId: "lead-test",
      ingestedVia: "webhook",
      leadStatus: "new",
      consentToContact: true,
      isTest: true,
    });

    expect(mockDb.execute).toHaveBeenCalledTimes(1);
    expect(result.contact).not.toBeNull();
    expect(result.outboxEnqueued).toBe(false);
  });
});
