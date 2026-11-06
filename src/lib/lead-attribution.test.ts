import { afterEach, describe, expect, it, vi } from "vitest";
import { captureLeadAttribution } from "./lead-attribution";

function browser(storage = new Map<string, string>()) {
  vi.stubGlobal("document", { referrer: "https://www.google.com/" });
  vi.stubGlobal("window", {
    location: { pathname: "/services/family-dentistry", search: "?utm_source=google&utm_medium=organic", origin: "https://www.famfirstsmile.com" },
    sessionStorage: { getItem: (key: string) => storage.get(key) || null, setItem: (key: string, value: string) => storage.set(key, value) },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("clean booking link attribution", () => {
  it("retains first CTA source and original campaign across navigation", () => {
    browser();
    captureLeadAttribution();
    captureLeadAttribution("service_detail_hero");
    window.location.pathname = "/book-appointment";
    window.location.search = "?service=family-dentistry";
    const result = captureLeadAttribution("header_desktop");
    expect(result).toMatchObject({ ctaSource: "service_detail_hero", landingPage: "/services/family-dentistry", utmSource: "google", utmMedium: "organic", referrer: "www.google.com" });
  });

  it("preserves a legacy incoming source", () => {
    browser();
    window.location.search = "?source=legacy_campaign";
    captureLeadAttribution();
    expect(captureLeadAttribution("header_desktop").ctaSource).toBe("legacy_campaign");
  });

  it("never blocks navigation when session storage is unavailable", () => {
    browser();
    vi.stubGlobal("window", { ...window, sessionStorage: { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } } });
    expect(captureLeadAttribution("service_detail_hero").ctaSource).toBe("service_detail_hero");
  });
});
