import { NextRequest, NextResponse } from "next/server";
import { requireAdminBasicAuth } from "@/app/api/admin/contacts/admin-auth";
import { db } from "@/server/db";
import { outboxService } from "@/server/notification-outbox";
import {
  isNotificationEnabled,
  sendGenericLeadAlert,
} from "@/server/dashboard-notifications";

export const runtime = "nodejs";

const MAX_BATCH_SIZE = 10;

const jsonResponse = (payload: unknown, init?: ResponseInit) => {
  const response = NextResponse.json(payload, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
};

export async function POST(req: NextRequest) {
  const authResponse = requireAdminBasicAuth(req);
  if (authResponse) return authResponse;

  if (!db) {
    return jsonResponse(
      { ok: false, error: "storage_unavailable", message: "Database is not configured." },
      { status: 503 },
    );
  }

  if (!isNotificationEnabled()) {
    return jsonResponse({
      ok: true,
      processed: 0,
      sent: 0,
      failed: 0,
      reason: "notifications_disabled",
    });
  }

  await outboxService.recoverStaleClaims(db);

  const events = await outboxService.claimPendingEvents(db, MAX_BATCH_SIZE);

  let sent = 0;
  let failed = 0;

  for (const event of events) {
    try {
      await sendGenericLeadAlert(event.id);
      await outboxService.markSent(db, event.id);
      sent += 1;
    } catch {
      console.error("notification_outbox_send_failed", {
        outboxId: event.id,
        eventType: event.eventType,
      });
      await outboxService.markFailed(db, event.id, "send_failed");
      failed += 1;
    }
  }

  return jsonResponse({
    ok: true,
    processed: events.length,
    sent,
    failed,
  });
}
