import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStorage } from "@/server/storage";

describe("notification outbox via InMemoryStorage", () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  it("enqueues an outbox event for a new non-test lead", async () => {
    const result = await storage.createContactWithOutbox({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      requestType: "google_ads_lead",
      googleAdsLeadId: "outbox-lead-001",
      ingestedVia: "webhook",
      leadStatus: "new",
      consentToContact: true,
      isTest: false,
    });
    expect(result.contact).not.toBeNull();
    expect(result.outboxEnqueued).toBe(true);
  });

  it("suppresses outbox event for is_test leads", async () => {
    const result = await storage.createContactWithOutbox({
      firstName: "Test",
      lastName: "Lead",
      email: "test@example.com",
      requestType: "google_ads_lead",
      googleAdsLeadId: "outbox-test-lead",
      ingestedVia: "webhook",
      leadStatus: "new",
      consentToContact: true,
      isTest: true,
    });
    expect(result.contact).not.toBeNull();
    expect(result.outboxEnqueued).toBe(false);
  });

  it("does not enqueue for a duplicate lead", async () => {
    const contactData = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      requestType: "google_ads_lead" as const,
      googleAdsLeadId: "outbox-dup-lead",
      ingestedVia: "webhook" as const,
      leadStatus: "new" as const,
      consentToContact: true,
      isTest: false,
    };
    const first = await storage.createContactWithOutbox(contactData);
    expect(first.outboxEnqueued).toBe(true);

    const second = await storage.createContactWithOutbox(contactData);
    expect(second.contact).toBeNull();
    expect(second.outboxEnqueued).toBe(false);
  });
});
