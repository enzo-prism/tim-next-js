import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("GA4 collection contracts", () => {
  it("injects gtag.js unless the visitor opted out, instead of conditionally rendering next/script", () => {
    const source = read("./google-analytics.tsx");

    expect(source).not.toMatch(/from ["']next\/script["']/);
    expect(source).toContain("document.createElement(\"script\")");
    expect(source).toContain("https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}");
    expect(source).toContain("consent === \"denied\"");
    expect(source).toContain("isGoogleAnalyticsAllowed()");
    expect(source).toContain("disableGoogleAnalytics()");
    expect(source).toContain("isGoogleAnalyticsProductionHostname");
    expect(source).toContain("consent === \"granted\" ? <VercelAnalytics");
    expect(source).toContain("ANALYTICS_CONSENT_REOPEN_EVENT");
  });

  it("sends page_view on route change and does not duplicate it on Allow", () => {
    const source = read("./route-analytics.tsx");

    expect(source).toContain("ANALYTICS_CONSENT_EVENT");
    expect(source).toContain("trackPageView(pathname)");
    expect(source).toContain("isGoogleAnalyticsAllowed()");
    expect(source).toContain("isGtagInitialized()");
    expect(source).toContain("hasAnalyticsConsent() && !alreadyInitialized");
  });

  it("does not ship an analytics_test override", () => {
    const tracking = read("../lib/tracking-config.ts");
    const analytics = read("../lib/analytics.ts");
    const tag = read("./google-analytics.tsx");

    expect(tracking).not.toContain("analytics_test");
    expect(analytics).not.toContain("analytics_test");
    expect(tag).not.toContain("analytics_test");
    expect(tracking).toContain("isGoogleAnalyticsProductionHostname");
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

  it("bootstraps Consent Mode v2 defaults from the shared script builder", () => {
    const layout = read("../app/layout.tsx");
    expect(layout).toContain("buildConsentBootstrapScript()");
    expect(layout).not.toContain("wait_for_update");
    expect(layout).not.toContain("analytics_storage: 'denied'");
  });

  it("isolates every Playwright spec from Google and Ads hosts", () => {
    const dir = new URL("../../tests/e2e/", import.meta.url);
    const specs = readdirSync(dir).filter((name) => name.endsWith(".spec.ts"));
    expect(specs).toHaveLength(14);
    for (const spec of specs) {
      const source = readFileSync(new URL(spec, dir), "utf8");
      expect(source, spec).toContain('from "./fixtures"');
    }
  });

  it("does not ship a hardcoded Google Ads tag", () => {
    const tracking = read("../lib/tracking-config.ts");
    const analytics = read("../lib/analytics.ts");

    expect(tracking).not.toMatch(/AW-\d+/);
    expect(analytics).not.toMatch(/AW-\d+/);
    expect(tracking).toContain("rejected Exquisite Dentistry Ads fallback");
  });
});
