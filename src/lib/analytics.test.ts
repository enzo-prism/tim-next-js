import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_CONVERSION_EVENT,
  GOOGLE_ADS_TAG_ID,
} from "@/lib/tracking-config";
import {
  resetGtagInitialization,
  sanitizeSiteEventPayload,
  trackAppointmentBookingAbandonment,
  trackAppointmentBookingStepComplete,
  trackAppointmentBookingStepView,
  trackAppointmentSubmitSuccess,
  sanitizeAnalyticsUrl,
  trackPageView,
  trackSiteEvent,
} from "@/lib/analytics";

const { vercelTrackMock } = vi.hoisted(() => ({
  vercelTrackMock: vi.fn(),
}));

vi.mock("@vercel/analytics", () => ({
  track: vercelTrackMock,
}));

const setupBrowserGlobals = (
  pathname = "/",
  analyticsConsent: "granted" | "denied" | null = "granted",
  search = "",
) => {
  const gtagMock = vi.fn();
  const appendChildMock = vi.fn();
  const storage = new Map<string, string>();
  if (analyticsConsent) {
    storage.set("ffsc_analytics_consent_v1", analyticsConsent);
  }

  vi.stubGlobal("window", {
    dataLayer: [],
    gtag: gtagMock,
    location: {
      assign: vi.fn(),
      href: `https://famfirstsmile.com${pathname}${search}`,
      origin: "https://famfirstsmile.com",
      pathname,
      search,
    },
    localStorage: {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
    },
    open: vi.fn(),
  });

  vi.stubGlobal("document", {
    createElement: vi.fn(() => ({
      async: false,
      id: "",
      src: "",
      textContent: "",
    })),
    head: {
      appendChild: appendChildMock,
    },
    title: "Family First Smile Care",
  });

  return { appendChildMock, gtagMock };
};

describe("analytics custom events", () => {
  beforeEach(() => {
    vercelTrackMock.mockClear();
    resetGtagInitialization();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mirrors sanitized custom events to GA4 and Vercel", () => {
    const { gtagMock } = setupBrowserGlobals("/book-appointment");

    trackSiteEvent("cta_click", {
      cta_type: "appointment",
      destination: "/book-appointment?patient=private",
      email: "patient@example.com",
      firstName: "Patient",
      location: "header",
      message: "I need help with a private dental question",
      phone: "408-555-1212",
      service_id: "invisalign",
    });

    expect(gtagMock).toHaveBeenCalledWith(
      "event",
      "cta_click",
      expect.objectContaining({
        cta_type: "appointment",
        destination: "/book-appointment",
        location: "header",
        page_path: "/book-appointment",
        send_to: GA_MEASUREMENT_ID,
        service_id: "invisalign",
      }),
    );
    expect(vercelTrackMock).toHaveBeenCalledWith("cta_click", {
      cta_type: "appointment",
      destination: "/book-appointment",
      location: "header",
      page_path: "/book-appointment",
      service_id: "invisalign",
    });

    const gaPayload = gtagMock.mock.calls.find((call) => call[1] === "cta_click")?.[2];
    expect(gaPayload).not.toHaveProperty("email");
    expect(gaPayload).not.toHaveProperty("firstName");
    expect(gaPayload).not.toHaveProperty("message");
    expect(gaPayload).not.toHaveProperty("phone");
  });

  it("skips public custom events on admin routes", () => {
    const { gtagMock } = setupBrowserGlobals("/admin");

    trackSiteEvent("cta_click", {
      cta_type: "appointment",
      location: "admin",
    });

    expect(gtagMock).not.toHaveBeenCalled();
    expect(vercelTrackMock).not.toHaveBeenCalled();
  });

  it("does not send events before informed analytics consent", () => {
    const { gtagMock } = setupBrowserGlobals("/book-appointment", null);

    trackAppointmentBookingStepView(1, "invisalign");
    trackSiteEvent("cta_click", { location: "header" });

    expect(gtagMock).not.toHaveBeenCalled();
    expect(vercelTrackMock).not.toHaveBeenCalled();
  });

  it("allowlists flat low-cardinality payload fields", () => {
    setupBrowserGlobals("/contact?firstName=private#form");

    expect(
      sanitizeSiteEventPayload({
        form_type: "contact",
        message: "Private message",
        nested: { unsafe: true },
        page_path: "/contact?firstName=private#form",
        provider: "google",
      }),
    ).toEqual({
      form_type: "contact",
      page_path: "/contact",
      provider: "google",
    });
  });

  it("reduces any analytics URL to path plus campaign parameters", () => {
    expect(
      sanitizeAnalyticsUrl(
        "https://www.famfirstsmile.com/contact?email=patient%40example.com&utm_source=google&gclid=abc#form",
      ),
    ).toBe("https://www.famfirstsmile.com/contact?utm_source=google&gclid=abc");

    expect(sanitizeAnalyticsUrl("https://www.famfirstsmile.com/blog/post?name=Jane")).toBe(
      "https://www.famfirstsmile.com/blog/post",
    );
  });

  it("keeps campaign parameters in page_location so GA4 can attribute the session", () => {
    const { gtagMock } = setupBrowserGlobals(
      "/",
      "granted",
      "?utm_source=google&utm_medium=cpc&utm_campaign=los-gatos&gclid=abc123",
    );

    trackPageView("/");

    const payload = gtagMock.mock.calls.find((call) => call[1] === "page_view")?.[2];
    expect(payload.page_location).toBe(
      "https://famfirstsmile.com/?utm_source=google&utm_medium=cpc&utm_campaign=los-gatos&gclid=abc123",
    );
    expect(payload.page_path).toBe("/");
    expect(payload.send_to).toBe("G-L7MH47XYXL");
  });

  it("drops non-campaign query parameters from page_location", () => {
    const { gtagMock } = setupBrowserGlobals(
      "/contact",
      "granted",
      "?email=patient%40example.com&gclid=keep-me&note=private",
    );

    trackPageView("/contact");

    const payload = gtagMock.mock.calls.find((call) => call[1] === "page_view")?.[2];
    expect(payload.page_location).toBe("https://famfirstsmile.com/contact?gclid=keep-me");
    expect(payload.page_location).not.toContain("email");
    expect(payload.page_location).not.toContain("note");
  });

  it("scopes the Ads conversion to the Ads destination only", () => {
    const { gtagMock } = setupBrowserGlobals("/book-appointment");

    trackAppointmentSubmitSuccess("invisalign", "e2f1c0aa-1111-4222-8333-444455556666");

    expect(gtagMock).toHaveBeenCalledWith("event", GOOGLE_ADS_CONVERSION_EVENT, {
      send_to: GOOGLE_ADS_TAG_ID,
      transaction_id: "e2f1c0aa-1111-4222-8333-444455556666",
    });
  });

  it("tracks appointment success as an Ads conversion and GA4 lead", () => {
    const { gtagMock } = setupBrowserGlobals("/book-appointment");

    trackAppointmentSubmitSuccess(
      "dental-exams",
      "0d9f6471-7120-4b5a-a1af-e1f77b0dcacf",
    );

    expect(gtagMock).toHaveBeenCalledWith("event", GOOGLE_ADS_CONVERSION_EVENT, {
      send_to: GOOGLE_ADS_TAG_ID,
      transaction_id: "0d9f6471-7120-4b5a-a1af-e1f77b0dcacf",
    });
    expect(gtagMock).toHaveBeenCalledWith(
      "event",
      "generate_lead",
      expect.objectContaining({
        form_type: "appointment",
        lead_source: "appointment_form",
        location: "book_appointment_page",
        page_path: "/book-appointment",
        service_id: "dental-exams",
      }),
    );
    expect(vercelTrackMock).toHaveBeenCalledWith(
      "generate_lead",
      expect.objectContaining({
        form_type: "appointment",
        lead_source: "appointment_form",
        service_id: "dental-exams",
      }),
    );
  });

  it("tracks the two-step appointment funnel without patient details", () => {
    const { gtagMock } = setupBrowserGlobals("/book-appointment");

    trackAppointmentBookingStepView(1, "invisalign");
    trackAppointmentBookingStepComplete(1, "invisalign");
    trackAppointmentBookingAbandonment(2, "invisalign", "route_change");

    expect(gtagMock).toHaveBeenCalledWith(
      "event",
      "appointment_step_view",
      expect.objectContaining({
        form_step: 1,
        form_type: "appointment",
        location: "book_appointment_page",
        service_id: "invisalign",
        step_name: "contact_details",
      }),
    );
    expect(vercelTrackMock).toHaveBeenCalledWith(
      "appointment_step_complete",
      expect.objectContaining({
        form_step: 1,
        step_name: "contact_details",
      }),
    );
    expect(vercelTrackMock).toHaveBeenCalledWith(
      "appointment_form_abandon",
      expect.objectContaining({
        abandonment_reason: "route_change",
        form_step: 2,
        step_name: "appointment_preferences",
      }),
    );

    const payloads = vercelTrackMock.mock.calls.map((call) => call[1]);
    expect(payloads).toHaveLength(3);
    for (const payload of payloads) {
      expect(payload).not.toHaveProperty("email");
      expect(payload).not.toHaveProperty("firstName");
      expect(payload).not.toHaveProperty("phone");
    }
  });
});
