import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { POST } from "@/app/api/admin/session/route";
import { ADMIN_SESSION_COOKIE } from "@/server/admin-session";

const signInRequest = (password: string) =>
  new NextRequest("https://www.famfirstsmile.com/api/admin/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password }),
  });

describe("admin session route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fails closed when ADMIN_PASSWORD is missing", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "");

    const response = await POST(signInRequest("Tim"));

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: "missing_config",
    });
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("sets an HTTP-only session cookie for the configured password", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "a-long-test-password");

    const response = await POST(signInRequest("a-long-test-password"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("set-cookie")).toContain(
      `${ADMIN_SESSION_COOKIE}=`,
    );
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("Secure");
  });
});
