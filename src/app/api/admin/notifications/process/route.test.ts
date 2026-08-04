import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  claimPendingEvents: vi.fn(),
  markSent: vi.fn(),
  markFailed: vi.fn(),
  isNotificationEnabled: vi.fn(),
}));

vi.mock("@/server/notification-outbox", () => ({
  outboxService: {
    claimPendingEvents: mocks.claimPendingEvents,
    markSent: mocks.markSent,
    markFailed: mocks.markFailed,
  },
}));

vi.mock("@/server/dashboard-notifications", () => ({
  isNotificationEnabled: mocks.isNotificationEnabled,
}));

vi.mock("@/server/db", () => ({
  db: {},
}));

import { POST } from "@/app/api/admin/notifications/process/route";

const auth = () =>
  `Basic ${Buffer.from("office-admin:test-password").toString("base64")}`;

const buildRequest = (authenticated = true) =>
  new NextRequest("http://localhost/api/admin/notifications/process", {
    method: "POST",
    headers: authenticated ? { authorization: auth() } : {},
  });

describe("notification worker POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_USERNAME = "office-admin";
    process.env.ADMIN_PASSWORD = "test-password";
    process.env.LEAD_NOTIFICATION_WEBHOOK_URL = "https://example.com/webhook";
    mocks.isNotificationEnabled.mockReturnValue(true);
    mocks.claimPendingEvents.mockResolvedValue([]);
    mocks.markSent.mockResolvedValue(undefined);
    mocks.markFailed.mockResolvedValue(undefined);
  });

  it("returns 401 when not authenticated", async () => {
    const response = await POST(buildRequest(false));
    expect(response.status).toBe(401);
    expect(mocks.claimPendingEvents).not.toHaveBeenCalled();
  });

  it("returns notifications_disabled when not enabled", async () => {
    mocks.isNotificationEnabled.mockReturnValue(false);
    const response = await POST(buildRequest());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.reason).toBe("notifications_disabled");
    expect(body.processed).toBe(0);
    expect(mocks.claimPendingEvents).not.toHaveBeenCalled();
  });

  it("processes pending events and marks them sent", async () => {
    const event = {
      id: "event-1",
      eventKey: "google_ads:lead-001",
      eventType: "new_lead",
      contactId: "contact-1",
      status: "pending",
      attempts: 0,
      lastError: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      sentAt: null,
    };
    mocks.claimPendingEvents.mockResolvedValue([event]);

    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const response = await POST(buildRequest());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.processed).toBe(1);
    expect(body.sent).toBe(1);
    expect(body.failed).toBe(0);
    expect(mocks.markSent).toHaveBeenCalledWith(expect.anything(), "event-1");
  });

  it("marks events failed when webhook returns an error", async () => {
    const event = {
      id: "event-2",
      eventKey: "google_ads:lead-002",
      eventType: "new_lead",
      contactId: "contact-2",
      status: "pending",
      attempts: 0,
      lastError: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      sentAt: null,
    };
    mocks.claimPendingEvents.mockResolvedValue([event]);

    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });

    const response = await POST(buildRequest());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.processed).toBe(1);
    expect(body.sent).toBe(0);
    expect(body.failed).toBe(1);
    expect(mocks.markFailed).toHaveBeenCalledWith(
      expect.anything(),
      "event-2",
      "send_failed",
    );
  });

  it("does not include patient details in webhook payload", async () => {
    const event = {
      id: "event-3",
      eventKey: "google_ads:lead-003",
      eventType: "new_lead",
      contactId: "contact-3",
      status: "pending",
      attempts: 0,
      lastError: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      sentAt: null,
    };
    mocks.claimPendingEvents.mockResolvedValue([event]);

    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;

    await POST(buildRequest());

    const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(callBody.subject).not.toContain("Jane");
    expect(callBody.subject).not.toContain("Doe");
    expect(callBody.body).not.toContain("jane@example.com");
    expect(callBody.body).not.toContain("408-555");
    expect(callBody.metadata).not.toHaveProperty("leadId");
    expect(callBody.metadata).not.toHaveProperty("contactId");
  });
});
