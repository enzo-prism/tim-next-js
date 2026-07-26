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

const storedAppointment = (overrides: Record<string, unknown> = {}) => ({
  id: "lead-1",
  submissionId: payload.submissionId,
  firstName: payload.firstName,
  lastName: payload.lastName,
  email: payload.email,
  phone: payload.phone,
  service: payload.service,
  message: payload.message,
  requestType: "appointment",
  preferredDate: payload.preferredDate,
  preferredTime: payload.preferredTime,
  formspreeStatus: "failed",
  landingPage: payload.landingPage,
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

const post = (overrides: Record<string, unknown> = {}) =>
  POST(
    new Request("https://www.famfirstsmile.com/api/appointments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, ...overrides }),
    }),
  );

describe("appointment API", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getContactBySubmissionId.mockResolvedValue(undefined);
    mocks.createContact.mockResolvedValue(storedAppointment());
    mocks.claimContactNotification.mockResolvedValue(
      storedAppointment({ formspreeStatus: "sending" }),
    );
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
      ...storedAppointment({ id: "lead-existing", formspreeStatus: "delivered" }),
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

  it("does not resend after delivery succeeds but its status writeback fails", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-24T16:00:00.000Z"));
    const pending = storedAppointment({ formspreeStatus: "sending" });
    mocks.getContactBySubmissionId.mockResolvedValueOnce(undefined).mockResolvedValue(pending);
    mocks.claimContactNotification
      .mockResolvedValueOnce(pending)
      .mockResolvedValueOnce(undefined);
    mocks.updateContactFormspreeStatus.mockRejectedValue(new Error("writeback failed"));

    const first = await post();
    vi.setSystemTime(new Date("2026-07-25T16:00:00.000Z"));
    const retry = await post();

    expect(first.status).toBe(201);
    expect((await first.json()).delivered).toBe(true);
    expect(retry.status).toBe(202);
    expect(await retry.json()).toEqual(
      expect.objectContaining({ success: true, created: false, delivered: false }),
    );
    expect(mocks.relayLeadNotification).toHaveBeenCalledTimes(1);
  });

  it("allows only one concurrent retry to claim and send a notification", async () => {
    const failed = storedAppointment({ id: "lead-existing" });
    mocks.getContactBySubmissionId.mockResolvedValue(failed);
    mocks.claimContactNotification
      .mockResolvedValueOnce({ ...failed, formspreeStatus: "sending" })
      .mockResolvedValueOnce(undefined);

    const [first, second] = await Promise.all([post(), post()]);

    expect([first.status, second.status].sort()).toEqual([200, 202]);
    expect(mocks.relayLeadNotification).toHaveBeenCalledTimes(1);
    expect(mocks.createContact).not.toHaveBeenCalled();
  });

  it("releases a failed relay claim so the same submission can retry once", async () => {
    const failed = storedAppointment();
    mocks.getContactBySubmissionId.mockResolvedValueOnce(undefined).mockResolvedValue(failed);
    mocks.relayLeadNotification.mockRejectedValueOnce(new Error("provider unavailable"));

    const first = await post();
    const retry = await post();

    expect(first.status).toBe(202);
    expect((await first.json()).delivered).toBe(false);
    expect(retry.status).toBe(200);
    expect((await retry.json()).delivered).toBe(true);
    expect(mocks.claimContactNotification).toHaveBeenCalledTimes(2);
    expect(mocks.relayLeadNotification).toHaveBeenCalledTimes(2);
    expect(mocks.updateContactFormspreeStatus).toHaveBeenNthCalledWith(
      1,
      "lead-1",
      "failed",
    );
    expect(mocks.updateContactFormspreeStatus).toHaveBeenNthCalledWith(
      2,
      "lead-1",
      "delivered",
    );
  });

  it("returns a saved-lead fallback when acquiring the notification claim fails", async () => {
    mocks.claimContactNotification.mockRejectedValue(new Error("database unavailable"));

    const response = await post();

    expect(response.status).toBe(202);
    const body = await response.json();
    expect(body).toEqual(
      expect.objectContaining({
        success: true,
        created: true,
        delivered: false,
        leadId: "lead-1",
      }),
    );
    expect(body.fallbackMessage).toContain("(408) 358-8100");
    expect(mocks.relayLeadNotification).not.toHaveBeenCalled();
  });

  it("recovers a concurrent duplicate without sending a second notification", async () => {
    mocks.getContactBySubmissionId
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(storedAppointment({ id: "lead-concurrent" }));
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

  it("rejects reuse of an appointment submission ID with changed data", async () => {
    mocks.getContactBySubmissionId.mockResolvedValue(storedAppointment());

    const response = await post({ preferredTime: "afternoon" });

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual(
      expect.objectContaining({ success: false, message: expect.stringContaining("submission ID") }),
    );
    expect(mocks.claimContactNotification).not.toHaveBeenCalled();
    expect(mocks.relayLeadNotification).not.toHaveBeenCalled();
  });

  it("rejects a submission ID that belongs to a contact", async () => {
    mocks.getContactBySubmissionId.mockResolvedValue(
      storedAppointment({
        requestType: "contact",
        preferredDate: null,
        preferredTime: null,
      }),
    );

    const response = await post();

    expect(response.status).toBe(409);
    expect(mocks.relayLeadNotification).not.toHaveBeenCalled();
  });

  it("relays the canonical stored appointment data", async () => {
    const canonical = storedAppointment({ formspreeStatus: "sending" });
    mocks.createContact.mockResolvedValue({ ...canonical, formspreeStatus: "failed" });
    mocks.claimContactNotification.mockResolvedValue(canonical);

    await post();

    expect(mocks.relayLeadNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        leadId: canonical.id,
        submissionId: canonical.submissionId,
        requestType: "appointment",
        email: canonical.email,
        preferredDate: canonical.preferredDate,
        consentVersion: LEAD_CONSENT_VERSION,
      }),
    );
  });
});
