import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  buildConsentBootstrapScript,
  CANONICAL_GA_MEASUREMENT_ID,
  CONSENT_REQUIRED_REGIONS,
  isGoogleAnalyticsProductionHostname,
  RETIRED_GA_MEASUREMENT_IDS,
  resolveGaMeasurementId,
  resolveGoogleAdsTagId,
} from "@/lib/tracking-config";

describe("GA4 measurement ID", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("pins collection to G-L7MH47XYXL", () => {
    expect(resolveGaMeasurementId("G-L7MH47XYXL")).toBe(CANONICAL_GA_MEASUREMENT_ID);
    expect(resolveGaMeasurementId(undefined)).toBe(CANONICAL_GA_MEASUREMENT_ID);
    expect(resolveGaMeasurementId("")).toBe(CANONICAL_GA_MEASUREMENT_ID);
    expect(resolveGaMeasurementId("   ")).toBe(CANONICAL_GA_MEASUREMENT_ID);
  });

  it("ignores the retired Vite-era ID and any other GA4 ID", () => {
    expect(RETIRED_GA_MEASUREMENT_IDS).toContain("G-54ESSN4BF8");
    expect(resolveGaMeasurementId("G-54ESSN4BF8")).toBe(CANONICAL_GA_MEASUREMENT_ID);
    expect(resolveGaMeasurementId("G-SOMEOTHERID")).toBe(CANONICAL_GA_MEASUREMENT_ID);
  });

  it("ignores a production env override that is not G-L7MH47XYXL", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-54ESSN4BF8");
    vi.resetModules();

    const { GA_MEASUREMENT_ID } = await import("@/lib/tracking-config");
    expect(GA_MEASUREMENT_ID).toBe("G-L7MH47XYXL");
  });
});

describe("production collection hosts", () => {
  it("allows only the public Family First hostnames", () => {
    expect(isGoogleAnalyticsProductionHostname("famfirstsmile.com")).toBe(true);
    expect(isGoogleAnalyticsProductionHostname("www.famfirstsmile.com")).toBe(true);
    expect(isGoogleAnalyticsProductionHostname("WWW.FAMFIRSTSMILE.COM")).toBe(true);
    expect(isGoogleAnalyticsProductionHostname("localhost")).toBe(false);
    expect(isGoogleAnalyticsProductionHostname("127.0.0.1")).toBe(false);
    expect(isGoogleAnalyticsProductionHostname("family-first.vercel.app")).toBe(false);
  });
});

describe("Consent Mode bootstrap", () => {
  it("defaults analytics granted globally and denied for EEA, UK, and CH", () => {
    const script = buildConsentBootstrapScript();

    expect(script).toContain("analytics_storage: 'denied'");
    expect(script).toContain("analytics_storage: 'granted'");
    expect(script).toContain("ad_storage: 'denied'");
    expect(script).toContain("ad_user_data: 'denied'");
    expect(script).toContain("ad_personalization: 'denied'");
    expect(script).not.toContain("ad_storage: 'granted'");
    expect(script).toContain(`window[${JSON.stringify("ga-disable-G-L7MH47XYXL")}] = true`);
    expect(script).toContain(ANALYTICS_CONSENT_STORAGE_KEY);
    expect(CONSENT_REQUIRED_REGIONS).toEqual(
      expect.arrayContaining([
        "FR",
        "DE",
        "GB",
        "CH",
        "IE",
        "NL",
        "GF",
        "GP",
        "MQ",
        "RE",
        "YT",
        "MF",
        "AX",
        "GI",
        "JE",
        "GG",
        "IM",
      ]),
    );
    expect(script).toContain(JSON.stringify(CONSENT_REQUIRED_REGIONS));
    expect(script).toContain("famfirstsmile.com");
    expect(script).toContain("www.famfirstsmile.com");
  });
});

describe("Google Ads tag ID", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("treats empty or whitespace env as unset", () => {
    expect(resolveGoogleAdsTagId(undefined)).toBeUndefined();
    expect(resolveGoogleAdsTagId("")).toBeUndefined();
    expect(resolveGoogleAdsTagId("   ")).toBeUndefined();
  });

  it("rejects the Exquisite Dentistry Ads fallback", () => {
    expect(resolveGoogleAdsTagId(`AW-${11373090310}`)).toBeUndefined();
  });

  it("accepts a non-rejected Ads tag", () => {
    expect(resolveGoogleAdsTagId("AW-00000000000")).toBe("AW-00000000000");
  });

  it("rejects the Exquisite Dentistry Ads fallback even when the env is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_ADS_TAG_ID", `AW-${11373090310}`);
    vi.resetModules();

    const { GOOGLE_ADS_TAG_ID } = await import("@/lib/tracking-config");
    expect(GOOGLE_ADS_TAG_ID).toBeUndefined();
  });
});
