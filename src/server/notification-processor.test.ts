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

import { processOutboxBatch } from "@/server/notification-processor";

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
