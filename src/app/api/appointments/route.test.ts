import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  callbacks: [] as Array<() => Promise<void>>,
  after: vi.fn(), claimContactNotification: vi.fn(), createContactWithOutbox: vi.fn(),
  enqueueLeadOutbox: vi.fn(), getContactBySubmissionId: vi.fn(), processOutboxBatch: vi.fn(),
  relayLeadNotification: vi.fn(), updateContactFormspreeStatus: vi.fn(),
}));
vi.mock("@/server/storage", () => ({ storage: {
  claimContactNotification: mocks.claimContactNotification,
  createContactWithOutbox: mocks.createContactWithOutbox,
  enqueueLeadOutbox: mocks.enqueueLeadOutbox,
  getContactBySubmissionId: mocks.getContactBySubmissionId,
  updateContactFormspreeStatus: mocks.updateContactFormspreeStatus,
} }));
vi.mock("@/server/lead-notifications", async (original) => ({
  ...(await original<typeof import("@/server/lead-notifications")>()),
  relayLeadNotification: mocks.relayLeadNotification,
}));
vi.mock("@/server/notification-processor", () => ({ processOutboxBatch: mocks.processOutboxBatch }));
vi.mock("next/server", async (original) => ({
  ...(await original<typeof import("next/server")>()), after: mocks.after,
}));
vi.mock("@/server/public-form-guard", async (original) => ({
  ...(await original<typeof import("@/server/public-form-guard")>()),
  guardPublicFormRequest: () => ({ ok: true }),
}));
import { POST } from "@/app/api/appointments/route";
import { LEAD_CONSENT_VERSION } from "@/content/form-schemas";
import { LeadNotificationRejectedError } from "@/server/lead-notifications";

const payload = {
  company: "", firstName: "Jamie", lastName: "Lee", email: "jamie@example.com",
  phone: "408-555-1212", service: "invisalign", message: "Please call after 3.",
  consentToContact: true, consentVersion: LEAD_CONSENT_VERSION,
  submissionId: "0d9f6471-7120-4b5a-a1af-e1f77b0dcacf", preferredDate: "2026-08-10", preferredTime: "morning",
};
const stored = (overrides: Record<string, unknown> = {}) => ({
  ...payload, id: "lead-1", requestType: "appointment", formspreeStatus: "failed",
  preferredDate: payload.preferredDate, preferredTime: payload.preferredTime,
  preferredContactMethod: "phone", visitFor: "self",
  landingPage: null, referrer: null, ctaSource: null, utmSource: null, utmMedium: null,
  utmCampaign: null, utmTerm: null, utmContent: null, gclid: null, gbraid: null, wbraid: null,
  ...overrides,
});
const submit = (overrides: Record<string, unknown> = {}) => POST(new Request(
  "https://www.famfirstsmile.com/api/appointments", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...payload, ...overrides }),
  },
));
const flush = async () => {
  const callbacks = mocks.callbacks.splice(0);
  await Promise.all(callbacks.map((callback) => callback()));
};

describe("appointments durable queued receipt", () => {
  beforeEach(() => {
    vi.clearAllMocks(); mocks.callbacks.length = 0;
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-07-24T16:00:00Z"));
    mocks.after.mockImplementation((callback: () => Promise<void>) => { mocks.callbacks.push(callback); });
    mocks.getContactBySubmissionId.mockResolvedValue(undefined);
    mocks.createContactWithOutbox.mockImplementation(async (canonical) => ({
      contact: stored(canonical), outboxEnqueued: true,
    }));
    mocks.enqueueLeadOutbox.mockResolvedValue(false);
    mocks.processOutboxBatch.mockResolvedValue({ processed: 0, sent: 0, failed: 0 });
    mocks.claimContactNotification.mockResolvedValue(stored({ formspreeStatus: "sending" }));
    mocks.relayLeadNotification.mockResolvedValue(undefined);
    mocks.updateContactFormspreeStatus.mockResolvedValue(undefined);
  });
  afterEach(() => { vi.useRealTimers(); });

  it("returns only a durable queued receipt before attempting slow office delivery", async () => {
    mocks.relayLeadNotification.mockImplementation(() => new Promise(() => {}));
    const response = await submit(); const body = await response.json();
    expect(response.status).toBe(202);
    expect(body).toEqual({ success: true, created: true, delivered: false, queued: true, leadId: "lead-1", serviceId: "invisalign" });
    expect(body).not.toHaveProperty("fallbackMessage"); expect(body).not.toHaveProperty("email");
    expect(mocks.claimContactNotification).not.toHaveBeenCalled();
    expect(mocks.relayLeadNotification).not.toHaveBeenCalled();
    expect(mocks.createContactWithOutbox).toHaveBeenCalledWith(expect.objectContaining({ formspreeStatus: "failed", ingestedVia: "website-form" }));
  });
  it("claims and relays canonical stored data after the receipt", async () => {
    await submit(); await flush();
    expect(mocks.claimContactNotification).toHaveBeenCalledWith("lead-1");
    expect(mocks.relayLeadNotification).toHaveBeenCalledWith(expect.objectContaining({ submissionId: payload.submissionId, email: payload.email, requestType: "appointment" }));
    expect(mocks.updateContactFormspreeStatus).toHaveBeenCalledWith("lead-1", "delivered");
  });
  it("keeps explicit provider rejections available to the retry worker", async () => {
    mocks.relayLeadNotification.mockRejectedValue(new LeadNotificationRejectedError(422));
    const response = await submit(); await flush();
    expect((await response.json()).queued).toBe(true);
    expect(mocks.updateContactFormspreeStatus).toHaveBeenCalledWith("lead-1", "failed");
  });
  it("does not reopen ambiguous sends after a network timeout", async () => {
    mocks.relayLeadNotification.mockRejectedValue(new Error("network timeout"));
    await submit(); await flush();
    expect(mocks.updateContactFormspreeStatus).not.toHaveBeenCalled();
  });
  it("does not resend after a successful send with failed status writeback", async () => {
    mocks.updateContactFormspreeStatus.mockRejectedValue(new Error("storage failed"));
    await submit(); await flush();
    mocks.getContactBySubmissionId.mockResolvedValue(stored({ formspreeStatus: "sending" }));
    const response = await submit(); await flush();
    expect((await response.json()).created).toBe(false);
    expect(mocks.relayLeadNotification).toHaveBeenCalledTimes(1);
  });
  it("returns already delivered UUIDs without another lead or send", async () => {
    mocks.getContactBySubmissionId.mockResolvedValue(stored({ formspreeStatus: "delivered" }));
    const response = await submit();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(expect.objectContaining({ created: false, delivered: true, queued: false }));
    expect(mocks.after).not.toHaveBeenCalled(); expect(mocks.createContactWithOutbox).not.toHaveBeenCalled();
  });
  it("allows only one concurrent retry to claim and send", async () => {
    mocks.getContactBySubmissionId.mockResolvedValue(stored());
    mocks.claimContactNotification.mockResolvedValueOnce(stored({ formspreeStatus: "sending" })).mockResolvedValue(undefined);
    const responses = await Promise.all([submit(), submit()]); await flush();
    expect(responses.map((response) => response.status)).toEqual([202, 202]);
    expect(mocks.relayLeadNotification).toHaveBeenCalledTimes(1);
    expect(mocks.createContactWithOutbox).not.toHaveBeenCalled();
  });
  it("recovers concurrent insert conflicts without losing the existing saved receipt", async () => {
    mocks.getContactBySubmissionId.mockResolvedValueOnce(undefined).mockResolvedValue(stored({ formspreeStatus: "sending" }));
    mocks.createContactWithOutbox.mockRejectedValue(new Error("unique conflict"));
    const response = await submit(); await flush();
    expect(await response.json()).toEqual(expect.objectContaining({ success: true, created: false, queued: true }));
    expect(mocks.relayLeadNotification).not.toHaveBeenCalled();
  });
  it("rejects changed data bound to the same UUID", async () => {
    mocks.getContactBySubmissionId.mockResolvedValue(stored());
    const response = await submit({ email: "different@example.com" });
    expect(response.status).toBe(409); expect(mocks.after).not.toHaveBeenCalled();
  });
  it("rejects a UUID bound to a different form type", async () => {
    mocks.getContactBySubmissionId.mockResolvedValue(stored({ requestType: "contact" }));
    expect((await submit()).status).toBe(409);
  });
  it("preserves the saved receipt when background scheduling fails", async () => {
    mocks.after.mockImplementation(() => { throw new Error("after unavailable"); });
    expect((await submit()).status).toBe(202);
    expect(mocks.claimContactNotification).not.toHaveBeenCalled();
  });
  it("does not acknowledge a lead when durable storage fails", async () => {
    mocks.createContactWithOutbox.mockRejectedValue(new Error("storage down"));
    expect((await submit()).status).toBe(500); expect(mocks.after).not.toHaveBeenCalled();
  });
  it.each([
    { email: "", phone: "408-555-1212", preferredContactMethod: "phone", visitFor: "child" },
    { email: "jamie@example.com", phone: "", preferredContactMethod: "email", visitFor: "family" },
  ])("accepts a selected single contact method and family preference: %j", async (input) => {
    const response = await submit(input);
    expect(response.status).toBe(202);
    expect(mocks.createContactWithOutbox).toHaveBeenCalledWith(expect.objectContaining({
      email: input.email || null, phone: input.phone || null,
      preferredContactMethod: input.preferredContactMethod, visitFor: input.visitFor,
    }));
  });
  it("rejects changing the family preference attached to a UUID", async () => {
    mocks.getContactBySubmissionId.mockResolvedValue(stored());
    expect((await submit({ visitFor: "child" })).status).toBe(409);
  });
  it("accepts legacy null preferences as effective defaults", async () => {
    mocks.getContactBySubmissionId.mockResolvedValue(stored({ preferredContactMethod: null, visitFor: null }));
    expect((await submit()).status).toBe(202);
  });
  it("requires the selected contact method to be supplied", async () => {
    expect((await submit({ preferredContactMethod: "email", email: "" })).status).toBe(400);
    expect(mocks.createContactWithOutbox).not.toHaveBeenCalled();
  });
  it("never logs private database error text", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.createContactWithOutbox.mockRejectedValue(new Error("private@example.com SQL params PRIVATE NAME"));
    expect((await submit()).status).toBe(500);
    expect(log).toHaveBeenCalledWith("appointment_submit_failed");
    expect(JSON.stringify(log.mock.calls)).not.toContain("private@example.com");
    log.mockRestore();
  });

});
