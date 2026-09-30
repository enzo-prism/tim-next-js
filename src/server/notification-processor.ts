import { db } from "@/server/db";
import { startNotificationHeartbeat, finishNotificationHeartbeat } from "@/server/lead-delivery-health";
import { retryFailedFormspreeNotifications } from "@/server/formspree-retry";
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
  errorCode?: "storage_unavailable" | "notification_processing_failed";
}> => {
  if (!db) {
    return { processed: 0, sent: 0, failed: 0, errorCode: "storage_unavailable" };
  }

  if (!isNotificationEnabled()) {
    return { processed: 0, sent: 0, failed: 0 };
  }

  await outboxService.recoverStaleClaims(db);

  const events = await outboxService.claimPendingEvents(db, MAX_BATCH_SIZE);

  let sent = 0;
  let failed = 0;

  for (const event of events) {
    const leaseValid = await outboxService.refreshLease(db, event.id, event.leaseToken);
    if (!leaseValid) {
      failed += 1;
      continue;
    }

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
  }

  return { processed: events.length, sent, failed };
};

export const processScheduledNotifications = async () => {
  const heartbeat = await startNotificationHeartbeat();
  const [outboxResult, formspreeResult] = await Promise.allSettled([
    processOutboxBatch(),
    retryFailedFormspreeNotifications(),
  ]);
  const outbox = outboxResult.status === "fulfilled" ? outboxResult.value : {
    processed: 0, sent: 0, failed: 0, errorCode: "notification_processing_failed" as const,
  };
  const formspree = formspreeResult.status === "fulfilled" ? formspreeResult.value : {
    processed: 0, delivered: 0, failed: 0, skipped: 0, indeterminate: 0,
    errorCode: "storage_unavailable" as const,
  };
  const healthy = !outbox.errorCode && outbox.failed === 0 && !formspree.errorCode &&
    formspree.failed === 0 && formspree.indeterminate === 0;
  await finishNotificationHeartbeat(heartbeat, !healthy);
  return { ...outbox, formspree, healthy };
};
