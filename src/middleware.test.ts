import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware, resetAdminAuthRateLimiterForTests } from "@/middleware";

const auth = (username: string, password: string) =>
  `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;

describe("admin middleware", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetAdminAuthRateLimiterForTests();
  });

  it("requires both the configured username and password", () => {
    vi.stubEnv("ADMIN_USERNAME", "office-admin");
    vi.stubEnv("ADMIN_PASSWORD", "a-long-test-password");

    const wrongUser = middleware(
      new NextRequest("http://localhost/admin", {
        headers: { authorization: auth("someone-else", "a-long-test-password") },
      }),
    );
    expect(wrongUser.status).toBe(401);

    const valid = middleware(
      new NextRequest("http://localhost/admin", {
        headers: { authorization: auth("office-admin", "a-long-test-password") },
      }),
    );
    expect(valid.status).toBe(200);
  });

  it("does not challenge public pages", () => {
    const response = middleware(new NextRequest("http://localhost/contact"));
    expect(response.status).toBe(200);
  });

  it("redirects the apex host to the canonical production host", () => {
    vi.stubEnv("CANONICAL_HOST", "https://www.famfirstsmile.com");

    const response = middleware(
      new NextRequest("https://famfirstsmile.com/contact", {
        headers: { host: "famfirstsmile.com" },
      }),
    );

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("https://www.famfirstsmile.com/contact");
  });

  it("keeps www authoritative when the canonical env contains the apex host", () => {
    vi.stubEnv("CANONICAL_HOST", "https://famfirstsmile.com");

    const response = middleware(
      new NextRequest("https://famfirstsmile.com/contact", {
        headers: { host: "famfirstsmile.com" },
      }),
    );

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("https://www.famfirstsmile.com/contact");
  });

  it("redirects the legacy page id route to patient info", () => {
    const response = middleware(
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
  ])("redirects the exact stale Ads path %s and preserves its query", (source, destination) => {
    const response = middleware(
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
  });

  it("does not redirect other mixed-case public paths", () => {
    const response = middleware(
      new NextRequest("https://www.famfirstsmile.com/Services/Dental-Exams", {
        headers: { host: "www.famfirstsmile.com" },
      }),
    );

    expect(response.status).toBe(200);
  });

  it("returns missing_config in production when admin credentials are absent", () => {
    vi.stubEnv("NODE_ENV", "production");

    const response = middleware(
      new NextRequest("https://www.famfirstsmile.com/admin", {
        headers: { host: "www.famfirstsmile.com" },
      }),
    );

    expect(response.status).toBe(503);
  });

  it("rate limits repeated failed admin auth attempts", () => {
    vi.stubEnv("ADMIN_USERNAME", "office-admin");
    vi.stubEnv("ADMIN_PASSWORD", "a-long-test-password");

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = middleware(
        new NextRequest("http://localhost/admin", {
          headers: { authorization: auth("office-admin", "wrong-password") },
        }),
      );
      expect(response.status).toBe(401);
    }

    const blocked = middleware(
      new NextRequest("http://localhost/admin", {
        headers: { authorization: auth("office-admin", "wrong-password") },
      }),
    );

    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).not.toBeNull();

    const validAfterFailures = middleware(
      new NextRequest("http://localhost/admin", {
        headers: { authorization: auth("office-admin", "a-long-test-password") },
      }),
    );
    expect(validAfterFailures.status).toBe(200);
  });

  it("exempts the notification processor path from Basic auth", () => {
    vi.stubEnv("ADMIN_USERNAME", "office-admin");
    vi.stubEnv("ADMIN_PASSWORD", "a-long-test-password");

    const response = middleware(
      new NextRequest("http://localhost/api/admin/notifications/process", {
        headers: { authorization: "Bearer some-cron-secret" },
      }),
    );
    expect(response.status).toBe(200);
  });

  it("still protects other /api/admin paths with Basic auth", () => {
    vi.stubEnv("ADMIN_USERNAME", "office-admin");
    vi.stubEnv("ADMIN_PASSWORD", "a-long-test-password");

    const response = middleware(
      new NextRequest("http://localhost/api/admin/contacts", {
        headers: { authorization: "Bearer some-cron-secret" },
      }),
    );
    expect(response.status).toBe(401);
  });

  it("does not consume the credential limiter when the browser sends no credentials", () => {
    vi.stubEnv("ADMIN_USERNAME", "office-admin");
    vi.stubEnv("ADMIN_PASSWORD", "a-long-test-password");

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const response = middleware(new NextRequest("http://localhost/admin"));
      expect(response.status).toBe(401);
    }

    const valid = middleware(
      new NextRequest("http://localhost/admin", {
        headers: { authorization: auth("office-admin", "a-long-test-password") },
      }),
    );
    expect(valid.status).toBe(200);
  });
});
