import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
} from "@/server/admin-session";

const signedIn = async (url: string, password: string) => {
  const request = new NextRequest(url);
  request.cookies.set(
    ADMIN_SESSION_COOKIE,
    await createSessionToken(password),
  );
  return request;
};

describe("admin middleware", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sends a signed-out browser to the sign-in page", async () => {
    const response = await middleware(new NextRequest("http://localhost/admin"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/admin/login");
  });

  it("lets a valid session cookie through", async () => {
    const password = "a-long-test-password";
    vi.stubEnv("ADMIN_PASSWORD", password);

    const response = await middleware(
      await signedIn("http://localhost/admin", password),
    );
    expect(response.status).toBe(200);
  });

  it("fails closed when ADMIN_PASSWORD is missing", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    const response = await middleware(
      await signedIn("http://localhost/admin", "Tim"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/admin/login");
  });

  it("rejects a session cookie minted from a different password", async () => {
    const request = new NextRequest("http://localhost/admin");
    request.cookies.set(ADMIN_SESSION_COOKIE, await createSessionToken("not-the-password"));

    const response = await middleware(request);
    expect(response.status).toBe(307);
  });

  it("never redirects the sign-in page into itself", async () => {
    const response = await middleware(new NextRequest("http://localhost/admin/login"));
    expect(response.status).toBe(200);
  });

  it("leaves the sign-in API reachable while signed out", async () => {
    const response = await middleware(
      new NextRequest("http://localhost/api/admin/session", { method: "POST" }),
    );
    expect(response.status).toBe(200);
  });

  it("preserves the requested admin path as the post-sign-in destination", async () => {
    const response = await middleware(
      new NextRequest("http://localhost/admin/leads?status=new"),
    );

    expect(response.headers.get("location")).toBe(
      "http://localhost/admin/login?next=%2Fadmin%2Fleads%3Fstatus%3Dnew",
    );
  });

  it("does not challenge public pages", async () => {
    const response = await middleware(new NextRequest("http://localhost/contact"));
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

  it("exempts the notification processor path from the session gate", async () => {
    const response = await middleware(
      new NextRequest("http://localhost/api/admin/notifications/process", {
        headers: { authorization: "Bearer some-cron-secret" },
      }),
    );
    expect(response.status).toBe(200);
  });

  it("answers unauthenticated /api/admin calls with 401 rather than a redirect", async () => {
    const response = await middleware(
      new NextRequest("http://localhost/api/admin/contacts", {
        headers: { authorization: "Bearer some-cron-secret" },
      }),
    );
    expect(response.status).toBe(401);
  });
});
