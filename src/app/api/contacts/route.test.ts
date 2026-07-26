import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  claimContactNotification: vi.fn(),
  createContact: vi.fn(),
  getContactBySubmissionId: vi.fn(),
  relayLeadNotification: vi.fn(),
  updateContactFormspreeStatus: vi.fn(),
}));

vi.mock("@/server/storage", () => ({
  storage: {
    claimContactNotification: mocks.claimContactNotification,
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

const payload = {
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
};

const storedContact = (overrides: Record<string, unknown> = {}) => ({
  id: "contact-1",
  submissionId: payload.submissionId,
  firstName: payload.firstName,
  lastName: payload.lastName,
  email: payload.email,
  phone: payload.phone,
  service: payload.service,
  message: payload.message,
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
  consentVersion: LEAD_CONSENT_VERSION,
  leadStatus: "new",
  contactedAt: null,
  bookedAt: null,
  arrivedAt: null,
  lostReason: null,
  staffNotes: null,
  createdAt: new Date("2026-07-24T16:00:00.000Z"),
  updatedAt: new Date("2026-07-24T16:00:00.000Z"),
  ...overrides,
});

const request = (overrides: Record<string, unknown> = {}) =>
  new Request("https://www.famfirstsmile.com/api/contacts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...payload, ...overrides }),
  });

describe("contact API", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getContactBySubmissionId.mockResolvedValue(undefined);
    mocks.createContact.mockResolvedValue(storedContact());
    mocks.claimContactNotification.mockResolvedValue(
      storedContact({ formspreeStatus: "sending" }),
    );
    mocks.relayLeadNotification.mockResolvedValue(undefined);
    mocks.updateContactFormspreeStatus.mockResolvedValue(undefined);
  });

  it("persists and notifies the office for a general contact lead", async () => {
    const contactWithAttribution = storedContact({
      ctaSource: "contact_page",
      formspreeStatus: "sending",
    });
    mocks.createContact.mockResolvedValue({ ...contactWithAttribution, formspreeStatus: "failed" });
    mocks.claimContactNotification.mockResolvedValue(contactWithAttribution);
    const response = await POST(request({ ctaSource: "contact_page" }));

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

  it("does not resend after delivery succeeds but its status writeback fails", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-24T16:00:00.000Z"));
    const pending = storedContact({ formspreeStatus: "sending" });
    mocks.getContactBySubmissionId.mockResolvedValueOnce(undefined).mockResolvedValue(pending);
    mocks.claimContactNotification
      .mockResolvedValueOnce(pending)
      .mockResolvedValueOnce(undefined);
    mocks.updateContactFormspreeStatus.mockRejectedValue(new Error("writeback failed"));

    const first = await POST(request());
    vi.setSystemTime(new Date("2026-07-25T16:00:00.000Z"));
    const retry = await POST(request());

    expect(first.status).toBe(201);
    expect((await first.json()).delivered).toBe(true);
    expect(retry.status).toBe(202);
    expect(await retry.json()).toEqual(
      expect.objectContaining({ success: true, created: false, delivered: false }),
    );
    expect(mocks.relayLeadNotification).toHaveBeenCalledTimes(1);
  });

  it("releases a failed relay claim so the same submission can retry once", async () => {
    const failed = storedContact();
    mocks.getContactBySubmissionId.mockResolvedValueOnce(undefined).mockResolvedValue(failed);
    mocks.relayLeadNotification.mockRejectedValueOnce(new Error("provider unavailable"));

    const first = await POST(request());
    const retry = await POST(request());

    expect(first.status).toBe(202);
    expect((await first.json()).delivered).toBe(false);
    expect(retry.status).toBe(200);
    expect((await retry.json()).delivered).toBe(true);
    expect(mocks.claimContactNotification).toHaveBeenCalledTimes(2);
    expect(mocks.relayLeadNotification).toHaveBeenCalledTimes(2);
    expect(mocks.updateContactFormspreeStatus).toHaveBeenNthCalledWith(
      1,
      "contact-1",
      "failed",
    );
    expect(mocks.updateContactFormspreeStatus).toHaveBeenNthCalledWith(
      2,
      "contact-1",
      "delivered",
    );
  });

  it("returns a saved-lead fallback when acquiring the notification claim fails", async () => {
    mocks.claimContactNotification.mockRejectedValue(new Error("database unavailable"));

    const response = await POST(request());

    expect(response.status).toBe(202);
    const body = await response.json();
    expect(body).toEqual(
      expect.objectContaining({
        success: true,
        created: true,
        delivered: false,
        leadId: "contact-1",
      }),
    );
    expect(body.fallbackMessage).toContain("(408) 358-8100");
    expect(mocks.relayLeadNotification).not.toHaveBeenCalled();
  });

  it("rejects reuse of a contact submission ID with changed data", async () => {
    mocks.getContactBySubmissionId.mockResolvedValue(storedContact());

    const response = await POST(request({ email: "different@example.com" }));

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual(
      expect.objectContaining({ success: false, message: expect.stringContaining("submission ID") }),
    );
    expect(mocks.claimContactNotification).not.toHaveBeenCalled();
    expect(mocks.relayLeadNotification).not.toHaveBeenCalled();
  });

  it("rejects a submission ID that belongs to an appointment", async () => {
    mocks.getContactBySubmissionId.mockResolvedValue(
      storedContact({ requestType: "appointment" }),
    );

    const response = await POST(request());

    expect(response.status).toBe(409);
    expect(mocks.relayLeadNotification).not.toHaveBeenCalled();
  });
});
