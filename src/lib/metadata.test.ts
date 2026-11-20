import { afterEach, describe, expect, it, vi } from "vitest";
import { fitSearchTitle } from "@/lib/metadata";

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

describe("fitSearchTitle", () => {
  it("keeps titles that fit", () => {
    expect(fitSearchTitle("Comprehensive Dental Exams in Los Gatos | Family First Smile Care")).toBe(
      "Comprehensive Dental Exams in Los Gatos | Family First Smile Care",
    );
  });

  it("drops the brand suffix from titles that would be cut off", () => {
    expect(
      fitSearchTitle("When Should Your Child Switch from a Pediatric to Family Dentist in Los Gatos? | Family First Smile Care"),
    ).toBe("When Should Your Child Switch from a Pediatric to Family Dentist in Los Gatos?");
  });

  it("leaves long titles without the suffix unchanged", () => {
    const title = "A".repeat(80);
    expect(fitSearchTitle(title)).toBe(title);
  });
});
