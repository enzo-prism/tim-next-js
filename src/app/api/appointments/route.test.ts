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

import { POST } from "@/app/api/appointments/route";
import { LEAD_CONSENT_VERSION } from "@/content/form-schemas";

const payload = {
  company: "",
  firstName: "Jamie",
  lastName: "Lee",
  email: "jamie@example.com",
  phone: "408-555-1212",
  service: "invisalign",
  preferredDate: "2026-08-10",
  preferredTime: "morning",
  message: "Please call after 3.",
  consentToContact: true,
  consentVersion: LEAD_CONSENT_VERSION,
  submissionId: "0d9f6471-7120-4b5a-a1af-e1f77b0dcacf",
  landingPage: "/services/invisalign",
};

const post = () =>
  POST(
    new Request("https://www.famfirstsmile.com/api/appointments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );

describe("appointment API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getContactBySubmissionId.mockResolvedValue(undefined);
    mocks.createContact.mockResolvedValue({ id: "lead-1", service: "invisalign" });
    mocks.relayLeadNotification.mockResolvedValue(undefined);
    mocks.updateContactFormspreeStatus.mockResolvedValue(undefined);
  });

  it("returns a PII-safe success response after persistence and notification", async () => {
    const response = await post();
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({
      success: true,
      created: true,
      delivered: true,
      leadId: "lead-1",
      serviceId: "invisalign",
    });
    expect(body).not.toHaveProperty("email");
    expect(mocks.createContact).toHaveBeenCalledWith(
      expect.objectContaining({
        submissionId: payload.submissionId,
        formspreeStatus: "failed",
        landingPage: "/services/invisalign",
      }),
    );
  });

  it("counts a persisted lead even when office notification is delayed", async () => {
    mocks.relayLeadNotification.mockRejectedValue(new Error("provider unavailable"));

    const response = await post();
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body).toEqual(
      expect.objectContaining({ success: true, created: true, delivered: false, leadId: "lead-1" }),
    );
    expect(body.fallbackMessage).toContain("(408) 358-8100");
  });

  it("does not resend an already delivered submission", async () => {
    mocks.getContactBySubmissionId.mockResolvedValue({
      id: "lead-existing",
      service: "invisalign",
      formspreeStatus: "delivered",
    });

    const response = await post();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      created: false,
      delivered: true,
      leadId: "lead-existing",
      serviceId: "invisalign",
    });
    expect(mocks.createContact).not.toHaveBeenCalled();
    expect(mocks.relayLeadNotification).not.toHaveBeenCalled();
  });

  it("keeps delivery successful if only the status writeback fails", async () => {
    mocks.updateContactFormspreeStatus.mockRejectedValue(new Error("writeback failed"));

    const response = await post();

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(expect.objectContaining({ delivered: true }));
  });

  it("recovers a concurrent duplicate without sending a second notification", async () => {
    mocks.getContactBySubmissionId
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        id: "lead-concurrent",
        service: "invisalign",
        formspreeStatus: "failed",
      });
    mocks.createContact.mockRejectedValue(new Error("unique violation"));

    const response = await post();

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        success: true,
        created: false,
        delivered: false,
        leadId: "lead-concurrent",
      }),
    );
    expect(mocks.relayLeadNotification).not.toHaveBeenCalled();
  });
});
