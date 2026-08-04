import { describe, expect, it, vi } from "vitest";
import { drizzle } from "drizzle-orm/neon-http";
import { DatabaseStorage } from "@/server/storage";
import * as schema from "@/server/schema";

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

const buildNeonHttpDrizzle = (rows: Array<Record<string, unknown>>) => {
  const mockQueryFn = vi.fn().mockResolvedValue({ rows });
  const db = drizzle(mockQueryFn as never, { schema });
  return { db, mockQueryFn };
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

  it("behavioral: createContactWithOutbox through real drizzle-orm/neon-http adapter", async () => {
    const { db, mockQueryFn } = buildNeonHttpDrizzle([CONTACT_ROW]);
    const storage = new DatabaseStorage(db);

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

    expect(mockQueryFn).toHaveBeenCalledTimes(1);
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
    const { db, mockQueryFn } = buildNeonHttpDrizzle([]);
    const storage = new DatabaseStorage(db);

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

    expect(mockQueryFn).toHaveBeenCalledTimes(1);
    expect(result.contact).toBeNull();
    expect(result.outboxEnqueued).toBe(false);
  });

  it("behavioral: outbox_enqueued is false for test leads", async () => {
    const testRow = { ...CONTACT_ROW, is_test: true, outbox_enqueued: false };
    const { db, mockQueryFn } = buildNeonHttpDrizzle([testRow]);
    const storage = new DatabaseStorage(db);

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

    expect(mockQueryFn).toHaveBeenCalledTimes(1);
    expect(result.contact).not.toBeNull();
    expect(result.outboxEnqueued).toBe(false);
  });

  it("behavioral: verifies SQL contains CTE structure via neon-http serialization", async () => {
    const { db, mockQueryFn } = buildNeonHttpDrizzle([CONTACT_ROW]);
    const storage = new DatabaseStorage(db);

    await storage.createContactWithOutbox({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      requestType: "google_ads_lead",
      googleAdsLeadId: "lead-sql-check",
      ingestedVia: "webhook",
      leadStatus: "new",
      consentToContact: true,
      isTest: false,
    });

    expect(mockQueryFn).toHaveBeenCalledTimes(1);
    const [sqlString] = mockQueryFn.mock.calls[0];
    expect(sqlString).toContain("WITH inserted_contact");
    expect(sqlString).toContain("ON CONFLICT DO NOTHING");
    expect(sqlString).toContain("notification_outbox");
    expect(sqlString).not.toContain("BEGIN");
    expect(sqlString).not.toContain("COMMIT");
  });
});
