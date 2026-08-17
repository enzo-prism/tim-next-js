import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("GA4 collection contracts", () => {
  it("injects gtag.js after consent instead of conditionally rendering next/script", () => {
    const source = read("./google-analytics.tsx");

    expect(source).not.toMatch(/from ["']next\/script["']/);
    expect(source).toContain("document.createElement(\"script\")");
    expect(source).toContain("https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}");
    expect(source).toContain("consent !== \"granted\"");
  });

  it("sends page_view when analytics consent is granted on the current route", () => {
    const source = read("./route-analytics.tsx");

    expect(source).toContain("ANALYTICS_CONSENT_EVENT");
    expect(source).toContain("trackPageView(pathname)");
    expect(source).toContain("hasAnalyticsConsent()");
  });

  it("does not ship a second GA4 measurement ID", () => {
    const tracking = read("../lib/tracking-config.ts");
    const analytics = read("../lib/analytics.ts");
    const tag = read("./google-analytics.tsx");

    expect(tracking).toContain("G-L7MH47XYXL");
    expect(tracking).toContain("G-54ESSN4BF8");
    expect(analytics).not.toContain("G-54ESSN4BF8");
    expect(tag).not.toContain("G-54ESSN4BF8");
    expect(analytics).not.toMatch(/G-[A-Z0-9]{6,}/);
  });

  it("renders the consent prompt in the initial UI state", () => {
    const source = read("./google-analytics.tsx");

    expect(source).toContain('useState<ConsentState>("prompt")');
    expect(source).not.toContain('"loading"');
    expect(source).toContain('aria-label="Allow analytics"');
  });

  it("does not ship a hardcoded Google Ads tag", () => {
    const tracking = read("../lib/tracking-config.ts");
    const analytics = read("../lib/analytics.ts");

    expect(tracking).not.toMatch(/AW-\d+/);
    expect(analytics).not.toMatch(/AW-\d+/);
    expect(tracking).toContain("rejected Exquisite Dentistry Ads fallback");
  });
});
