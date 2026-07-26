import { afterEach, describe, expect, it, vi } from "vitest";

describe("metadata canonical host", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("normalizes the apex production host to the authoritative www host", async () => {
    vi.stubEnv("CANONICAL_HOST", "https://famfirstsmile.com");
    vi.resetModules();

    const { metadataBase, buildRouteMetadata } = await import("@/lib/metadata");

    expect(metadataBase.origin).toBe("https://www.famfirstsmile.com");
    expect(buildRouteMetadata("/services/invisalign").alternates?.canonical).toBe(
      "/services/invisalign",
    );
  });
});
