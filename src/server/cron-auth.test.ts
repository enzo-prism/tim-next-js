import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { requireCronAuth } from "@/server/cron-auth";

const CRON_SECRET = "test-cron-secret";

describe("requireCronAuth", () => {
  beforeEach(() => {
    process.env.CRON_SECRET = CRON_SECRET;
  });

  it("returns 503 with setup steps when CRON_SECRET is missing", async () => {
    delete process.env.CRON_SECRET;
    const response = requireCronAuth(
      new NextRequest("http://localhost/api/admin/notifications/process", {
        headers: { authorization: "Bearer anything" },
      }),
    );
    expect(response).not.toBeNull();
    expect(response!.status).toBe(503);
    const body = await response!.json();
    expect(body.error).toBe("cron_not_configured");
    expect(body.setup).toContain("openssl rand -hex 32");
    expect(JSON.stringify(body)).not.toContain("test-cron-secret");
  });

  it("accepts a matching bearer token", () => {
    const response = requireCronAuth(
      new NextRequest("http://localhost/api/admin/notifications/process", {
        headers: { authorization: `Bearer ${CRON_SECRET}` },
      }),
    );
    expect(response).toBeNull();
  });
});
