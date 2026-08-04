import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  processOutboxBatch: vi.fn(),
}));

vi.mock("@/server/notification-processor", () => ({
  processOutboxBatch: mocks.processOutboxBatch,
}));

import { POST } from "@/app/api/admin/notifications/process/route";

const CRON_SECRET = "test-cron-secret";

const buildRequest = (authenticated = true) =>
  new NextRequest("http://localhost/api/admin/notifications/process", {
    method: "POST",
    headers: authenticated
      ? { authorization: `Bearer ${CRON_SECRET}` }
      : {},
  });

describe("notification worker POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NOTIFICATION_CRON_SECRET = CRON_SECRET;
    mocks.processOutboxBatch.mockResolvedValue({ processed: 0, sent: 0, failed: 0 });
  });

  it("returns 503 when cron secret is not configured", async () => {
    delete process.env.NOTIFICATION_CRON_SECRET;
    const response = await POST(buildRequest(true));
    expect(response.status).toBe(503);
    expect(mocks.processOutboxBatch).not.toHaveBeenCalled();
  });

  it("returns 401 when not authenticated", async () => {
    const response = await POST(buildRequest(false));
    expect(response.status).toBe(401);
    expect(mocks.processOutboxBatch).not.toHaveBeenCalled();
  });

  it("returns 401 with wrong cron secret", async () => {
    const request = new NextRequest("http://localhost/api/admin/notifications/process", {
      method: "POST",
      headers: { authorization: "Bearer wrong-secret" },
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
    expect(mocks.processOutboxBatch).not.toHaveBeenCalled();
  });

  it("processes outbox batch when authenticated", async () => {
    mocks.processOutboxBatch.mockResolvedValue({ processed: 2, sent: 1, failed: 1 });
    const response = await POST(buildRequest(true));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.processed).toBe(2);
    expect(body.sent).toBe(1);
    expect(body.failed).toBe(1);
    expect(mocks.processOutboxBatch).toHaveBeenCalledTimes(1);
  });

  it("does not include patient details in response", async () => {
    mocks.processOutboxBatch.mockResolvedValue({ processed: 1, sent: 1, failed: 0 });
    const response = await POST(buildRequest(true));
    const body = await response.json();
    expect(JSON.stringify(body)).not.toContain("Jane");
    expect(JSON.stringify(body)).not.toContain("jane@example.com");
    expect(JSON.stringify(body)).not.toContain("408-555");
  });
});
