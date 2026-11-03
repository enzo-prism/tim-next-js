import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_CONVERSION_EVENT,
} from "@/lib/tracking-config";
import {
  disableGoogleAnalytics,
  initGA,
  isGoogleAnalyticsAllowed,
  resetGtagInitialization,
  sanitizeSiteEventPayload,
  setAnalyticsConsent,
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
  hostname = "famfirstsmile.com",
) => {
  const gtagMock = vi.fn();
  const appendChildMock = vi.fn();
  const storage = new Map<string, string>();
  const session = new Map<string, string>();
  const cookies = new Map<string, string>();
  if (analyticsConsent) {
    storage.set("ffsc_analytics_consent_v1", analyticsConsent);
    cookies.set("ffsc_analytics_consent_v1", analyticsConsent);
  }

  const documentMock = {
    cookie: "",
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
  };
  Object.defineProperty(documentMock, "cookie", {
    get: () => [...cookies.entries()].map(([key, value]) => `${key}=${value}`).join("; "),
    set: (value: string) => {
      const [pair] = value.split(";");
      const eq = pair.indexOf("=");
      const key = pair.slice(0, eq).trim();
      const cookieValue = pair.slice(eq + 1).trim();
      if (/Max-Age=0/i.test(value) || cookieValue === "") {
        cookies.delete(key);
        return;
      }
      cookies.set(key, cookieValue);
    },
  });

  const windowMock = {
    dataLayer: [] as unknown[],
    gtag: gtagMock,
    location: {
      assign: vi.fn(),
      href: `https://${hostname}${pathname}${search}`,
      hostname,
      origin: `https://${hostname}`,
      pathname,
      protocol: "https:",
      search,
    },
    localStorage: {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
    },
    sessionStorage: {
      getItem: vi.fn((key: string) => session.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => session.set(key, value)),
    },
    open: vi.fn(),
    document: documentMock,
  };

  vi.stubGlobal("window", windowMock);
  vi.stubGlobal("document", documentMock);

  return { appendChildMock, gtagMock };
};

describe("analytics custom events", () => {
  beforeEach(() => {
    vercelTrackMock.mockClear();
    resetGtagInitialization();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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

  it("sends Google Analytics events before a banner choice and keeps Vercel opt-in", () => {
    const { gtagMock } = setupBrowserGlobals("/book-appointment", null);

    expect(isGoogleAnalyticsAllowed()).toBe(true);
    trackAppointmentBookingStepView(1, "invisalign");
    trackSiteEvent("cta_click", { location: "header" });

    expect(gtagMock).toHaveBeenCalledWith(
      "event",
      "cta_click",
      expect.objectContaining({ location: "header" }),
    );
    expect(vercelTrackMock).not.toHaveBeenCalled();
  });

  it("drops Google Analytics and Vercel events after the visitor opts out", () => {
    const { gtagMock } = setupBrowserGlobals("/book-appointment", "denied");

    expect(isGoogleAnalyticsAllowed()).toBe(false);
    trackAppointmentBookingStepView(1, "invisalign");
    trackSiteEvent("cta_click", { location: "header" });
    trackPageView("/book-appointment");

    expect(gtagMock).not.toHaveBeenCalled();
    expect(vercelTrackMock).not.toHaveBeenCalled();
  });

  it("sets ga-disable and never grants ad consent when the visitor opts out", () => {
    const { gtagMock } = setupBrowserGlobals("/book-appointment", null);

    setAnalyticsConsent("denied");

    expect(window["ga-disable-G-L7MH47XYXL"]).toBe(true);
    expect(gtagMock).toHaveBeenCalledWith(
      "consent",
      "update",
      expect.objectContaining({
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      }),
    );
  });

  it("does not override the region default when initializing without an explicit Allow", () => {
    const { gtagMock } = setupBrowserGlobals("/", null);

    expect(initGA()).toBe(true);
    expect(gtagMock).toHaveBeenCalledWith(
      "config",
      "G-L7MH47XYXL",
      expect.objectContaining({ send_page_view: false }),
    );
    expect(
      gtagMock.mock.calls.some(
        (call) =>
          call[0] === "consent" &&
          call[1] === "update" &&
          call[2]?.analytics_storage === "granted",
      ),
    ).toBe(false);
  });

  it("keeps ad consent denied when the visitor explicitly allows analytics", () => {
    const { gtagMock } = setupBrowserGlobals("/", "granted");

    expect(initGA()).toBe(true);
    expect(gtagMock).toHaveBeenCalledWith(
      "consent",
      "update",
      expect.objectContaining({
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      }),
    );
  });

  it("does not initialize Google Analytics off the production hostnames", () => {
    for (const hostname of ["localhost", "127.0.0.1", "family-first.vercel.app"]) {
      resetGtagInitialization();
      const { gtagMock } = setupBrowserGlobals("/", null, "", hostname);
      expect(initGA()).toBe(false);
      trackPageView("/");
      trackSiteEvent("cta_click", { location: "header" });
      expect(gtagMock.mock.calls.some((call) => call[0] === "config")).toBe(false);
      expect(gtagMock.mock.calls.some((call) => call[0] === "js")).toBe(false);
    }
  });

  it("still forwards stubbed gtag events on localhost without loading the tag", () => {
    const { gtagMock } = setupBrowserGlobals("/", null, "", "127.0.0.1");

    expect(initGA()).toBe(false);
    trackSiteEvent("generate_lead", {
      form_type: "contact",
      lead_source: "contact_form",
    });

    expect(gtagMock).toHaveBeenCalledWith(
      "event",
      "generate_lead",
      expect.objectContaining({
        send_to: "G-L7MH47XYXL",
        form_type: "contact",
      }),
    );
    expect(gtagMock.mock.calls.some((call) => call[0] === "config")).toBe(false);
  });

  it("does not queue gtag on localhost when no stub is present", () => {
    setupBrowserGlobals("/", null, "", "localhost");
    // @ts-expect-error -- test removes the stub so collection cannot start a queue
    delete window.gtag;

    expect(initGA()).toBe(false);
    trackSiteEvent("cta_click", { location: "header" });
    expect(window.gtag).toBeUndefined();
  });

  it("persists opt-out in a first-party cookie and drops same-tick events", () => {
    const { gtagMock } = setupBrowserGlobals("/contact", null);

    setAnalyticsConsent("denied");
    expect(document.cookie).toContain("ffsc_analytics_consent_v1=denied");
    expect(window["ga-disable-G-L7MH47XYXL"]).toBe(true);

    gtagMock.mockClear();
    trackSiteEvent("generate_lead", { form_type: "contact", lead_source: "contact_form" });
    expect(gtagMock).not.toHaveBeenCalled();
  });

  it("initializes Google Analytics on both public production hosts", () => {
    for (const hostname of ["famfirstsmile.com", "www.famfirstsmile.com"]) {
      resetGtagInitialization();
      const { gtagMock } = setupBrowserGlobals("/", null, "", hostname);
      expect(initGA()).toBe(true);
      expect(gtagMock).toHaveBeenCalledWith(
        "config",
        "G-L7MH47XYXL",
        expect.objectContaining({ send_page_view: false }),
      );
    }
  });

  it("stops further hits through disableGoogleAnalytics", () => {
    setupBrowserGlobals("/", null);

    disableGoogleAnalytics();
    expect(window["ga-disable-G-L7MH47XYXL"]).toBe(true);
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

  it("does not send an Ads conversion when no Ads tag is configured", () => {
    const { gtagMock } = setupBrowserGlobals("/book-appointment");

    trackAppointmentSubmitSuccess("invisalign", "e2f1c0aa-1111-4222-8333-444455556666");

    expect(
      gtagMock.mock.calls.some((call) => call[1] === GOOGLE_ADS_CONVERSION_EVENT),
    ).toBe(false);
    expect(gtagMock.mock.calls.some((call) => call[0] === "config" && call[1] !== GA_MEASUREMENT_ID)).toBe(
      false,
    );
    expect(gtagMock).toHaveBeenCalledWith(
      "event",
      "generate_lead",
      expect.objectContaining({
        form_type: "appointment",
        lead_source: "appointment_form",
        location: "book_appointment_page",
        page_path: "/book-appointment",
        service_id: "invisalign",
      }),
    );
  });

  it("tracks appointment success as a GA4 lead without an Ads send_to event", () => {
    const { gtagMock } = setupBrowserGlobals("/book-appointment");

    trackAppointmentSubmitSuccess(
      "dental-exams",
      "0d9f6471-7120-4b5a-a1af-e1f77b0dcacf",
    );

    expect(
      gtagMock.mock.calls.some((call) => call[1] === GOOGLE_ADS_CONVERSION_EVENT),
    ).toBe(false);
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

  it("scopes the Ads conversion to a configured Ads tag", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_ADS_TAG_ID", "AW-00000000000");
    vi.resetModules();

    const { trackAppointmentSubmitSuccess, resetGtagInitialization } = await import(
      "@/lib/analytics"
    );
    const { GOOGLE_ADS_CONVERSION_EVENT, GOOGLE_ADS_TAG_ID } = await import(
      "@/lib/tracking-config"
    );
    resetGtagInitialization();
    const { gtagMock } = setupBrowserGlobals("/book-appointment");

    trackAppointmentSubmitSuccess("invisalign", "e2f1c0aa-1111-4222-8333-444455556666");

    expect(GOOGLE_ADS_TAG_ID).toBe("AW-00000000000");
    expect(gtagMock).toHaveBeenCalledWith("config", "AW-00000000000");
    expect(gtagMock).toHaveBeenCalledWith("event", GOOGLE_ADS_CONVERSION_EVENT, {
      send_to: "AW-00000000000",
      transaction_id: "e2f1c0aa-1111-4222-8333-444455556666",
    });
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

// Keep the new symptom-based intake choice out of both analytics destinations.
it("omits the tooth-pain intake label from analytics while keeping aggregate funnel fields", () => {
  const sanitized = sanitizeSiteEventPayload({ service_id: "tooth-pain", form_type: "appointment", form_step: "details" });
  expect(sanitized).not.toHaveProperty("service_id");
  expect(sanitized).toMatchObject({ form_type: "appointment", form_step: "details" });
});
