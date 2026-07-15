import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

const auth = (username: string, password: string) =>
  `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;

describe("admin middleware", () => {
  afterEach(() => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
  });

  it("requires both the configured username and password", () => {
    process.env.ADMIN_USERNAME = "office-admin";
    process.env.ADMIN_PASSWORD = "a-long-test-password";

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
});
