import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  processScheduledNotifications: vi.fn(),
}));

vi.mock("@/server/notification-processor", () => ({
  processScheduledNotifications: mocks.processScheduledNotifications,
}));

import { GET, POST } from "@/app/api/admin/notifications/process/route";

const CRON_SECRET = "test-cron-secret";

const buildRequest = (method: "GET" | "POST", authenticated = true) =>
  new NextRequest("http://localhost/api/admin/notifications/process", {
    method,
    headers: authenticated
      ? { authorization: `Bearer ${CRON_SECRET}` }
      : {},
  });

describe("notification worker POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = CRON_SECRET;
    mocks.processScheduledNotifications.mockResolvedValue({
      processed: 0,
      sent: 0,
      failed: 0,
      formspree: { processed: 0, delivered: 0, failed: 0, skipped: 0 },
    });
  });

  it("returns 503 with setup steps when cron secret is not configured", async () => {
    delete process.env.CRON_SECRET;
    const response = await POST(buildRequest("POST", true));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error).toBe("cron_not_configured");
    expect(body.setup).toContain("CRON_SECRET");
    expect(mocks.processScheduledNotifications).not.toHaveBeenCalled();
  });

  it("returns 401 when not authenticated", async () => {
    const response = await POST(buildRequest("POST", false));
    expect(response.status).toBe(401);
    expect(mocks.processScheduledNotifications).not.toHaveBeenCalled();
  });

  it("returns 401 with wrong cron secret", async () => {
    const request = new NextRequest("http://localhost/api/admin/notifications/process", {
      method: "POST",
      headers: { authorization: "Bearer wrong-secret" },
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
    expect(mocks.processScheduledNotifications).not.toHaveBeenCalled();
  });

  it("returns 401 with Basic auth header (not Bearer)", async () => {
    const request = new NextRequest("http://localhost/api/admin/notifications/process", {
      method: "POST",
      headers: { authorization: `Basic ${Buffer.from("admin:tim").toString("base64")}` },
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
    expect(mocks.processScheduledNotifications).not.toHaveBeenCalled();
  });

  it("processes outbox batch and Formspree retries when authenticated", async () => {
    mocks.processScheduledNotifications.mockResolvedValue({
      processed: 2,
      sent: 1,
      failed: 1,
      formspree: { processed: 1, delivered: 1, failed: 0, skipped: 0 },
    });
    const response = await POST(buildRequest("POST", true));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.processed).toBe(2);
    expect(body.sent).toBe(1);
    expect(body.failed).toBe(1);
    expect(body.formspree).toEqual({
      processed: 1,
      delivered: 1,
      failed: 0,
      skipped: 0,
    });
    expect(mocks.processScheduledNotifications).toHaveBeenCalledTimes(1);
  });

  it("does not include patient details in response", async () => {
    mocks.processScheduledNotifications.mockResolvedValue({
      processed: 1,
      sent: 1,
      failed: 0,
      formspree: { processed: 1, delivered: 1, failed: 0, skipped: 0 },
    });
    const response = await POST(buildRequest("POST", true));
    const body = await response.json();
    expect(JSON.stringify(body)).not.toContain("Jane");
    expect(JSON.stringify(body)).not.toContain("jane@example.com");
    expect(JSON.stringify(body)).not.toContain("408-555");
  });
});

describe("notification worker GET (scheduler-compatible)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = CRON_SECRET;
    mocks.processScheduledNotifications.mockResolvedValue({
      processed: 0,
      sent: 0,
      failed: 0,
      formspree: { processed: 0, delivered: 0, failed: 0, skipped: 0 },
    });
  });

  it("returns 503 when cron secret is not configured", async () => {
    delete process.env.CRON_SECRET;
    const response = await GET(buildRequest("GET", true));
    expect(response.status).toBe(503);
    expect(mocks.processScheduledNotifications).not.toHaveBeenCalled();
  });

  it("returns 401 when not authenticated", async () => {
    const response = await GET(buildRequest("GET", false));
    expect(response.status).toBe(401);
    expect(mocks.processScheduledNotifications).not.toHaveBeenCalled();
  });

  it("processes scheduled notifications when authenticated via GET", async () => {
    mocks.processScheduledNotifications.mockResolvedValue({
      processed: 3,
      sent: 3,
      failed: 0,
      formspree: { processed: 0, delivered: 0, failed: 0, skipped: 0 },
    });
    const response = await GET(buildRequest("GET", true));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.processed).toBe(3);
    expect(body.sent).toBe(3);
    expect(mocks.processScheduledNotifications).toHaveBeenCalledTimes(1);
  });
});
