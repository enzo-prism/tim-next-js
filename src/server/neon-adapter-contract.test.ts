import { describe, expect, it } from "vitest";
import { DatabaseStorage } from "@/server/storage";

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

  it("mapRowToContact correctly maps snake_case rows to Contact shape", () => {
    const storage = new DatabaseStorage({} as never);
    const row = {
      id: "test-id",
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
    };

    const contact = (storage as any).mapRowToContact(row);
    expect(contact.id).toBe("test-id");
    expect(contact.firstName).toBe("Jane");
    expect(contact.lastName).toBe("Doe");
    expect(contact.email).toBe("jane@example.com");
    expect(contact.googleAdsLeadId).toBe("lead-001");
    expect(contact.isTest).toBe(false);
    expect(contact.createdAt).toBeInstanceOf(Date);
  });
});
