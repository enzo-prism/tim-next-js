import { describe, expect, it } from "vitest";
import { isAnalyticsCollectionUrl } from "./analytics-host";

describe("analytics collection hosts", () => {
  it("collects only on the real HTTPS practice hosts by default", () => {
    expect(isAnalyticsCollectionUrl("https://www.famfirstsmile.com/contact")).toBe(true);
    expect(isAnalyticsCollectionUrl("https://famfirstsmile.com/")).toBe(true);
    for (const url of ["http://www.famfirstsmile.com", "http://localhost:3100", "http://127.0.0.1:3100", "https://tim-next-js.vercel.app", "https://www.design-prism.com", "https://famfirstsmile.com.example.org", "invalid"]) {
      expect(isAnalyticsCollectionUrl(url)).toBe(false);
    }
  });

  it("allows an explicit loopback-only test mode without enabling previews", () => {
    expect(isAnalyticsCollectionUrl("http://127.0.0.1:3100", true)).toBe(true);
    expect(isAnalyticsCollectionUrl("http://localhost:3100", true)).toBe(true);
    expect(isAnalyticsCollectionUrl("https://tim-next-js.vercel.app", true)).toBe(false);
  });
});
