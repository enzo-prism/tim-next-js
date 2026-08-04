import { db } from "@/server/db";
import { outboxService } from "@/server/notification-outbox";
import {
  isNotificationEnabled,
  sendGenericLeadAlert,
} from "@/server/dashboard-notifications";

const MAX_BATCH_SIZE = 10;

export const processOutboxBatch = async (): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> => {
  if (!db) {
    return { processed: 0, sent: 0, failed: 0 };
  }

  if (!isNotificationEnabled()) {
    return { processed: 0, sent: 0, failed: 0 };
  }

  await outboxService.recoverStaleClaims(db);

  const events = await outboxService.claimPendingEvents(db, MAX_BATCH_SIZE);

  let sent = 0;
  let failed = 0;

  for (const event of events) {
    try {
      await sendGenericLeadAlert(event.id);
      const marked = await outboxService.markSent(db, event.id, event.leaseToken);
      if (marked) {
        sent += 1;
      } else {
        failed += 1;
      }
    } catch {
      console.error("notification_outbox_send_failed", {
        outboxId: event.id,
        eventType: event.eventType,
      });
      await outboxService.markFailed(db, event.id, event.leaseToken, "send_failed");
      failed += 1;
    }

    await outboxService.refreshLease(db, event.id, event.leaseToken).catch(
      () => undefined,
    );
  }

  return { processed: events.length, sent, failed };
};
