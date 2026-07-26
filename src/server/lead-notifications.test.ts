import { afterEach, describe, expect, it, vi } from "vitest";
import { relayLeadNotification } from "@/server/lead-notifications";

describe("lead notification relay", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.FORMSPREE_CONTACT_ENDPOINT;
    delete process.env.FORMSPREE_APPOINTMENT_ENDPOINT;
  });

  it("uses the contact endpoint and includes attribution", async () => {
    process.env.FORMSPREE_CONTACT_ENDPOINT = "https://formspree.io/f/contact-test";
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await relayLeadNotification({
      leadId: "lead-1",
      submissionId: "0d9f6471-7120-4b5a-a1af-e1f77b0dcacf",
      requestType: "contact",
      firstName: "Jamie",
      lastName: "Lee",
      email: "jamie@example.com",
      ctaSource: "contact_hero",
      utmSource: "google",
      consentToContact: true,
      consentVersion: "2026-07-15",
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://formspree.io/f/contact-test");
    expect(JSON.parse(String(init.body))).toEqual(
      expect.objectContaining({
        requestType: "contact",
        leadId: "lead-1",
        submissionId: "0d9f6471-7120-4b5a-a1af-e1f77b0dcacf",
        ctaSource: "contact_hero",
        utmSource: "google",
        form_key: "contacts",
      }),
    );
  });

  it("fails closed when the notification provider rejects the request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));

    await expect(
      relayLeadNotification({
        leadId: "lead-1",
        submissionId: "0d9f6471-7120-4b5a-a1af-e1f77b0dcacf",
        requestType: "appointment",
        firstName: "Jamie",
        lastName: "Lee",
        email: "jamie@example.com",
        consentToContact: true,
      }),
    ).rejects.toThrow("status 503");
  });
});
