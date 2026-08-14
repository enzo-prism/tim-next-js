import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CANONICAL_GA_MEASUREMENT_ID,
  RETIRED_GA_MEASUREMENT_IDS,
  resolveGaMeasurementId,
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
