import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createContact: vi.fn(),
  getContactBySubmissionId: vi.fn(),
  relayLeadNotification: vi.fn(),
  updateContactFormspreeStatus: vi.fn(),
}));

vi.mock("@/server/storage", () => ({
  storage: {
    createContact: mocks.createContact,
    getContactBySubmissionId: mocks.getContactBySubmissionId,
    updateContactFormspreeStatus: mocks.updateContactFormspreeStatus,
  },
}));

vi.mock("@/server/lead-notifications", () => ({
  relayLeadNotification: mocks.relayLeadNotification,
}));

vi.mock("@/server/public-form-guard", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/server/public-form-guard")>()),
  guardPublicFormRequest: () => ({ ok: true }),
}));

import { POST } from "@/app/api/contacts/route";
import { LEAD_CONSENT_VERSION } from "@/content/form-schemas";

describe("contact API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getContactBySubmissionId.mockResolvedValue(undefined);
    mocks.createContact.mockResolvedValue({ id: "contact-1", service: "family-dentistry" });
    mocks.relayLeadNotification.mockResolvedValue(undefined);
    mocks.updateContactFormspreeStatus.mockResolvedValue(undefined);
  });

  it("persists and notifies the office for a general contact lead", async () => {
    const response = await POST(
      new Request("https://www.famfirstsmile.com/api/contacts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          company: "",
          firstName: "Jamie",
          lastName: "Lee",
          email: "jamie@example.com",
          phone: "408-555-1212",
          service: "family-dentistry",
          message: "I have a question.",
          consentToContact: true,
          consentVersion: LEAD_CONSENT_VERSION,
          submissionId: "0d9f6471-7120-4b5a-a1af-e1f77b0dcacf",
          ctaSource: "contact_page",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      success: true,
      created: true,
      delivered: true,
      leadId: "contact-1",
      serviceId: "family-dentistry",
    });
    expect(mocks.relayLeadNotification).toHaveBeenCalledWith(
      expect.objectContaining({ requestType: "contact", ctaSource: "contact_page" }),
    );
    expect(mocks.updateContactFormspreeStatus).toHaveBeenCalledWith("contact-1", "delivered");
  });
});
