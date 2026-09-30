import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {} as never,
  isNotificationEnabled: vi.fn(),
  sendGenericLeadAlert: vi.fn(),
  recoverStaleClaims: vi.fn(),
  claimPendingEvents: vi.fn(),
  markSent: vi.fn(),
  markFailed: vi.fn(),
  refreshLease: vi.fn(),
  retryFailedFormspreeNotifications: vi.fn(),
  startNotificationHeartbeat: vi.fn(),
  finishNotificationHeartbeat: vi.fn(),
}));

vi.mock("@/server/db", () => ({ db: mocks.db }));
vi.mock("@/server/dashboard-notifications", () => ({
  isNotificationEnabled: mocks.isNotificationEnabled,
  sendGenericLeadAlert: mocks.sendGenericLeadAlert,
}));
vi.mock("@/server/notification-outbox", () => ({
  outboxService: {
    recoverStaleClaims: mocks.recoverStaleClaims,
    claimPendingEvents: mocks.claimPendingEvents,
    markSent: mocks.markSent,
    markFailed: mocks.markFailed,
    refreshLease: mocks.refreshLease,
  },
}));

vi.mock("@/server/formspree-retry", () => ({ retryFailedFormspreeNotifications: mocks.retryFailedFormspreeNotifications }));
vi.mock("@/server/lead-delivery-health", () => ({
  startNotificationHeartbeat: mocks.startNotificationHeartbeat,
  finishNotificationHeartbeat: mocks.finishNotificationHeartbeat,
}));

import { processOutboxBatch, processScheduledNotifications } from "@/server/notification-processor";

describe("processOutboxBatch ordering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isNotificationEnabled.mockReturnValue(true);
    mocks.recoverStaleClaims.mockResolvedValue(0);
    mocks.markSent.mockResolvedValue(true);
    mocks.markFailed.mockResolvedValue(true);
    mocks.refreshLease.mockResolvedValue(true);
  });

  it("returns zero counts when notifications are disabled", async () => {
    mocks.isNotificationEnabled.mockReturnValue(false);
    const result = await processOutboxBatch();
    expect(result).toEqual({ processed: 0, sent: 0, failed: 0 });
    expect(mocks.claimPendingEvents).not.toHaveBeenCalled();
  });

  it("refreshes lease BEFORE sending each event", async () => {
    const callOrder: string[] = [];
    mocks.claimPendingEvents.mockResolvedValue([
      { id: "event-1", eventType: "new_lead", leaseToken: "token-1" },
    ]);
    mocks.refreshLease.mockImplementation(async () => {
      callOrder.push("refreshLease");
      return true;
    });
    mocks.sendGenericLeadAlert.mockImplementation(async () => {
      callOrder.push("send");
    });
    mocks.markSent.mockImplementation(async () => {
      callOrder.push("markSent");
      return true;
    });

    await processOutboxBatch();

    expect(callOrder).toEqual(["refreshLease", "send", "markSent"]);
  });

  it("skips event and counts as failed when lease refresh fails", async () => {
    mocks.claimPendingEvents.mockResolvedValue([
      { id: "event-1", eventType: "new_lead", leaseToken: "token-1" },
    ]);
    mocks.refreshLease.mockResolvedValue(false);

    const result = await processOutboxBatch();

    expect(result).toEqual({ processed: 1, sent: 0, failed: 1 });
    expect(mocks.sendGenericLeadAlert).not.toHaveBeenCalled();
    expect(mocks.markSent).not.toHaveBeenCalled();
  });

  it("marks failed when send throws", async () => {
    mocks.claimPendingEvents.mockResolvedValue([
      { id: "event-1", eventType: "new_lead", leaseToken: "token-1" },
    ]);
    mocks.sendGenericLeadAlert.mockRejectedValue(new Error("webhook_returned_500"));

    const result = await processOutboxBatch();

    expect(result).toEqual({ processed: 1, sent: 0, failed: 1 });
    expect(mocks.markFailed).toHaveBeenCalledWith(
      mocks.db,
      "event-1",
      "token-1",
      "send_failed",
    );
  });

  it("counts as failed when markSent returns false (stale lease)", async () => {
    mocks.claimPendingEvents.mockResolvedValue([
      { id: "event-1", eventType: "new_lead", leaseToken: "token-1" },
    ]);
    mocks.markSent.mockResolvedValue(false);

    const result = await processOutboxBatch();

    expect(result).toEqual({ processed: 1, sent: 0, failed: 1 });
  });

  it("processes multiple events with lease refresh before each send", async () => {
    const callOrder: string[] = [];
    mocks.claimPendingEvents.mockResolvedValue([
      { id: "event-1", eventType: "new_lead", leaseToken: "token-1" },
      { id: "event-2", eventType: "new_lead", leaseToken: "token-2" },
    ]);
    mocks.refreshLease.mockImplementation(async (_db: never, id: string) => {
      callOrder.push(`refresh:${id}`);
      return true;
    });
    mocks.sendGenericLeadAlert.mockImplementation(async (id: string) => {
      callOrder.push(`send:${id}`);
    });
    mocks.markSent.mockImplementation(async (_db: never, id: string) => {
      callOrder.push(`markSent:${id}`);
      return true;
    });

    const result = await processOutboxBatch();

    expect(result).toEqual({ processed: 2, sent: 2, failed: 0 });
    expect(callOrder).toEqual([
      "refresh:event-1",
      "send:event-1",
      "markSent:event-1",
      "refresh:event-2",
      "send:event-2",
      "markSent:event-2",
    ]);
  });
});


describe("scheduled worker isolates delivery channels and records health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isNotificationEnabled.mockReturnValue(true);
    mocks.recoverStaleClaims.mockResolvedValue(0);
    mocks.claimPendingEvents.mockResolvedValue([]);
    mocks.retryFailedFormspreeNotifications.mockResolvedValue({ processed: 0, delivered: 0, failed: 0, skipped: 0, indeterminate: 0 });
    mocks.startNotificationHeartbeat.mockResolvedValue("run-token");
    mocks.finishNotificationHeartbeat.mockResolvedValue(undefined);
  });
  it("records a healthy heartbeat for an idle successful run", async () => {
    expect((await processScheduledNotifications()).healthy).toBe(true);
    expect(mocks.finishNotificationHeartbeat).toHaveBeenCalledWith("run-token", false);
  });
  it("continues Formspree recovery if the staff outbox worker throws", async () => {
    mocks.claimPendingEvents.mockRejectedValue(new Error("outbox down"));
    const result = await processScheduledNotifications();
    expect(result.healthy).toBe(false);
    expect(result.errorCode).toBe("notification_processing_failed");
    expect(mocks.retryFailedFormspreeNotifications).toHaveBeenCalledTimes(1);
    expect(mocks.finishNotificationHeartbeat).toHaveBeenCalledWith("run-token", true);
  });
  it("continues staff alerts if the Formspree storage worker fails", async () => {
    mocks.retryFailedFormspreeNotifications.mockRejectedValue(new Error("storage down"));
    const result = await processScheduledNotifications();
    expect(result.healthy).toBe(false);
    expect(result.formspree.errorCode).toBe("storage_unavailable");
    expect(mocks.claimPendingEvents).toHaveBeenCalledTimes(1);
  });
  it("marks indeterminate sending outcomes degraded for operator investigation", async () => {
    mocks.retryFailedFormspreeNotifications.mockResolvedValue({ processed: 1, delivered: 0, failed: 0, skipped: 0, indeterminate: 1 });
    expect((await processScheduledNotifications()).healthy).toBe(false);
  });
});
