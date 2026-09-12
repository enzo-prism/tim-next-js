import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  claimContactNotification: vi.fn(),
  listFailedFormspreeLeads: vi.fn(),
  relayLeadNotification: vi.fn(),
  updateContactFormspreeStatus: vi.fn(),
}));

vi.mock("@/server/storage", () => ({
  storage: {
    claimContactNotification: mocks.claimContactNotification,
    listFailedFormspreeLeads: mocks.listFailedFormspreeLeads,
    updateContactFormspreeStatus: mocks.updateContactFormspreeStatus,
  },
}));

vi.mock("@/server/lead-notifications", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/server/lead-notifications")>()),
  relayLeadNotification: mocks.relayLeadNotification,
}));

import { retryFailedFormspreeNotifications } from "@/server/formspree-retry";

const failedLead = {
  id: "contact-1",
  submissionId: "0d9f6471-7120-4b5a-a1af-e1f77b0dcacf",
  firstName: "Jamie",
  lastName: "Lee",
  email: "jamie@example.com",
  phone: "408-555-1212",
  service: "family-dentistry",
  message: "Hello",
  requestType: "contact",
  preferredDate: null,
  preferredTime: null,
  formspreeStatus: "failed",
  landingPage: null,
  referrer: null,
  ctaSource: null,
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmTerm: null,
  utmContent: null,
  gclid: null,
  gbraid: null,
  wbraid: null,
  consentToContact: true,
  consentVersion: "2026-07-15",
};

describe("retryFailedFormspreeNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listFailedFormspreeLeads.mockResolvedValue([failedLead]);
    mocks.claimContactNotification.mockResolvedValue({
      ...failedLead,
      formspreeStatus: "sending",
    });
    mocks.relayLeadNotification.mockResolvedValue(undefined);
    mocks.updateContactFormspreeStatus.mockResolvedValue(undefined);
  });

  it("relays failed website leads and marks them delivered", async () => {
    const result = await retryFailedFormspreeNotifications();
    expect(result).toEqual({ processed: 1, delivered: 1, failed: 0, skipped: 0 });
    expect(mocks.relayLeadNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: "contact-1",
        requestType: "contact",
        submissionId: failedLead.submissionId,
      }),
    );
    expect(mocks.updateContactFormspreeStatus).toHaveBeenCalledWith("contact-1", "delivered");
  });

  it("does not retry sending or google ads rows that cannot map to Formspree", async () => {
    mocks.listFailedFormspreeLeads.mockResolvedValue([
      { ...failedLead, requestType: "google_ads_lead", submissionId: null, email: null },
    ]);
    const result = await retryFailedFormspreeNotifications();
    expect(result.skipped).toBe(1);
    expect(mocks.claimContactNotification).not.toHaveBeenCalled();
    expect(mocks.relayLeadNotification).not.toHaveBeenCalled();
  });

  it("returns failed to failed after a known relay error", async () => {
    mocks.relayLeadNotification.mockRejectedValue(new Error("status 503"));
    const result = await retryFailedFormspreeNotifications();
    expect(result).toEqual({ processed: 1, delivered: 0, failed: 1, skipped: 0 });
    expect(mocks.updateContactFormspreeStatus).toHaveBeenCalledWith("contact-1", "failed");
  });
});
