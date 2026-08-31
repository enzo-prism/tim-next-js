import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

describe("public middleware", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not challenge public pages", async () => {
    const response = await middleware(new NextRequest("http://localhost/contact"));
    expect(response.status).toBe(200);
  });

  it("does not gate former admin dashboard paths", async () => {
    const response = await middleware(new NextRequest("http://localhost/admin"));
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("does not gate cron notification processing", async () => {
    const response = await middleware(
      new NextRequest("http://localhost/api/admin/notifications/process", {
        headers: { authorization: "Bearer some-cron-secret" },
      }),
    );
    expect(response.status).toBe(200);
  });

  it("redirects the apex host to the canonical production host", async () => {
    vi.stubEnv("CANONICAL_HOST", "https://www.famfirstsmile.com");

    const response = await middleware(
      new NextRequest("https://famfirstsmile.com/contact", {
        headers: { host: "famfirstsmile.com" },
      }),
    );

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("https://www.famfirstsmile.com/contact");
  });

  it("keeps www authoritative when the canonical env contains the apex host", async () => {
    vi.stubEnv("CANONICAL_HOST", "https://famfirstsmile.com");

    const response = await middleware(
      new NextRequest("https://famfirstsmile.com/contact", {
        headers: { host: "famfirstsmile.com" },
      }),
    );

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("https://www.famfirstsmile.com/contact");
  });

  it("redirects the legacy page id route to patient info", async () => {
    const response = await middleware(
      new NextRequest("https://www.famfirstsmile.com/?page_id=1073", {
        headers: { host: "www.famfirstsmile.com" },
      }),
    );

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("https://www.famfirstsmile.com/patient-info");
  });

  it.each([
    ["/Book-Appointment", "/book-appointment"],
    ["/Services/Invisalign", "/services/invisalign"],
  ])(
    "redirects the exact stale Ads path %s and preserves its query",
    async (source, destination) => {
      const response = await middleware(
        new NextRequest(
          `https://www.famfirstsmile.com${source}?utm_source=google&utm_campaign=spring`,
          {
            headers: { host: "www.famfirstsmile.com" },
          },
        ),
      );

      expect(response.status).toBe(301);
      expect(response.headers.get("location")).toBe(
        `https://www.famfirstsmile.com${destination}?utm_source=google&utm_campaign=spring`,
      );
    },
  );

  it("does not redirect other mixed-case public paths", async () => {
    const response = await middleware(
      new NextRequest("https://www.famfirstsmile.com/Services/Dental-Exams", {
        headers: { host: "www.famfirstsmile.com" },
      }),
    );
    expect(response.status).toBe(200);
  });
});
