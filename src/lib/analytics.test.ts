import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GA_MEASUREMENT_ID, GOOGLE_ADS_CONVERSION_EVENT } from "@/lib/tracking-config";
import {
  sanitizeSiteEventPayload,
  trackAppointmentSubmitSuccess,
  trackSiteEvent,
} from "@/lib/analytics";

const { vercelTrackMock } = vi.hoisted(() => ({
  vercelTrackMock: vi.fn(),
}));

vi.mock("@vercel/analytics", () => ({
  track: vercelTrackMock,
}));

const setupBrowserGlobals = (pathname = "/") => {
  const gtagMock = vi.fn();
  const appendChildMock = vi.fn();

  vi.stubGlobal("window", {
    dataLayer: [],
    gtag: gtagMock,
    location: {
      assign: vi.fn(),
      href: `https://famfirstsmile.com${pathname}`,
      pathname,
      search: "",
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

  it("tracks appointment success as an Ads conversion and GA4 lead", () => {
    const { gtagMock } = setupBrowserGlobals("/book-appointment");

    trackAppointmentSubmitSuccess(
      "dental-exams",
      "0d9f6471-7120-4b5a-a1af-e1f77b0dcacf",
    );

    expect(gtagMock).toHaveBeenCalledWith("event", GOOGLE_ADS_CONVERSION_EVENT, {
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
});
