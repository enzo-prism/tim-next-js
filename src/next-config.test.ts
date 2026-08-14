import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("next config regressions", () => {
  it("keeps the legacy redirect families in place", async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/services/childrens-dentistry",
          destination: "/services/children-dentistry",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/dental-services/:slug",
          destination: "/services/:slug",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/articles/:path*",
          destination: "/blog",
          permanent: true,
        }),
      ]),
    );
  });

  it("ships report-only CSP headers with reporting enabled", async () => {
    const headers = await nextConfig.headers?.();
    const siteWideHeaders = headers?.find((entry) => entry.source === "/(.*)")?.headers ?? [];
    const csp = siteWideHeaders.find(
      (header) => header.key === "Content-Security-Policy-Report-Only",
    )?.value;

    expect(siteWideHeaders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "Content-Security-Policy-Report-Only" }),
        expect.objectContaining({ key: "Reporting-Endpoints" }),
        expect.objectContaining({ key: "Report-To" }),
      ]),
    );
    expect(csp).toContain(
      "report-uri https://www.famfirstsmile.com/api/security/csp-report",
    );
    expect(csp).toContain("https://analytics.google.com");
    expect(csp).toContain("https://www.googletagmanager.com");
  });
});
