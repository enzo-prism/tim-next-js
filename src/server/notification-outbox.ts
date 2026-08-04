import { and, eq, lt, sql as dsql } from "drizzle-orm";
import { notificationOutbox } from "@/server/schema";
import type { PgDatabase } from "drizzle-orm/pg-core";
import type * as schema from "@/server/schema";

type DrizzleDatabase = PgDatabase<any, typeof schema>;

export type OutboxEvent = typeof notificationOutbox.$inferSelect;

export const MAX_ATTEMPTS = 5;
export const LEASE_DURATION_MS = 60_000;
export const STALE_CLAIM_THRESHOLD_MS = 5 * 60_000;

export const buildEventKey = (
  googleAdsLeadId: string | null,
  submissionId: string | null,
  contactId: string,
): string =>
  googleAdsLeadId
    ? `google_ads:${googleAdsLeadId}`
    : submissionId
      ? `formspree:${submissionId}`
      : `contact:${contactId}`;

export const getRetryDelayMs = (attempts: number): number =>
  Math.min(1000 * 2 ** attempts, 60_000);

export interface IOutboxService {
  claimPendingEvents(
    db: DrizzleDatabase,
    limit: number,
  ): Promise<OutboxEvent[]>;
  recoverStaleClaims(db: DrizzleDatabase): Promise<number>;
  markSent(db: DrizzleDatabase, eventId: string): Promise<void>;
  markFailed(
    db: DrizzleDatabase,
    eventId: string,
    errorCode: string,
  ): Promise<void>;
}

export class DatabaseOutboxService implements IOutboxService {
  async claimPendingEvents(
    db: DrizzleDatabase,
    limit: number,
  ): Promise<OutboxEvent[]> {
    const now = new Date();
    const leaseUntil = new Date(now.getTime() + LEASE_DURATION_MS);

    const claimed = await db
      .update(notificationOutbox)
      .set({
        status: "sending",
        updatedAt: now,
        lastError: dsql`${leaseUntil.toISOString()}`,
      })
      .where(
        and(
          eq(notificationOutbox.status, "pending"),
          lt(notificationOutbox.attempts, MAX_ATTEMPTS),
        ),
      )
      .returning();

    return claimed.slice(0, limit);
  }

  async recoverStaleClaims(db: DrizzleDatabase): Promise<number> {
    const staleThreshold = new Date(Date.now() - STALE_CLAIM_THRESHOLD_MS);

    const recovered = await db
      .update(notificationOutbox)
      .set({
        status: "pending",
        updatedAt: new Date(),
        lastError: null,
      })
      .where(
        and(
          eq(notificationOutbox.status, "sending"),
          lt(notificationOutbox.updatedAt, staleThreshold),
        ),
      )
      .returning();

    return recovered.length;
  }

  async markSent(db: DrizzleDatabase, eventId: string): Promise<void> {
    await db
      .update(notificationOutbox)
      .set({
        status: "sent",
        sentAt: new Date(),
        updatedAt: new Date(),
        lastError: null,
      })
      .where(eq(notificationOutbox.id, eventId));
  }

  async markFailed(
    db: DrizzleDatabase,
    eventId: string,
    errorCode: string,
  ): Promise<void> {
    const [event] = await db
      .select()
      .from(notificationOutbox)
      .where(eq(notificationOutbox.id, eventId))
      .limit(1);

    if (!event) return;

    const newAttempts = event.attempts + 1;
    const isDeadLetter = newAttempts >= MAX_ATTEMPTS;

    await db
      .update(notificationOutbox)
      .set({
        status: isDeadLetter ? "failed" : "pending",
        updatedAt: new Date(),
        lastError: errorCode,
        attempts: newAttempts,
      })
      .where(eq(notificationOutbox.id, eventId));
  }
}

export const outboxService: IOutboxService = new DatabaseOutboxService();
