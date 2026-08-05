import { randomUUID } from "crypto";
import { and, eq, lte, or, isNull, sql as dsql } from "drizzle-orm";
import { notificationOutbox } from "@/server/schema";
import type { PgDatabase } from "drizzle-orm/pg-core";
import type * as schema from "@/server/schema";

type DrizzleDatabase = PgDatabase<any, typeof schema>;

export type OutboxEvent = typeof notificationOutbox.$inferSelect;

export const MAX_ATTEMPTS = 5;
export const LEASE_DURATION_MS = 60_000;

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
  ): Promise<Array<OutboxEvent & { leaseToken: string }>>;
  recoverStaleClaims(db: DrizzleDatabase): Promise<number>;
  markSent(
    db: DrizzleDatabase,
    eventId: string,
    leaseToken: string,
  ): Promise<boolean>;
  markFailed(
    db: DrizzleDatabase,
    eventId: string,
    leaseToken: string,
    errorCode: string,
  ): Promise<boolean>;
  refreshLease(
    db: DrizzleDatabase,
    eventId: string,
    leaseToken: string,
  ): Promise<boolean>;
}

export class DatabaseOutboxService implements IOutboxService {
  async claimPendingEvents(
    db: DrizzleDatabase,
    limit: number,
  ): Promise<Array<OutboxEvent & { leaseToken: string }>> {
    const leaseToken = randomUUID();
    const now = new Date();
    const leaseExpiresAt = new Date(now.getTime() + LEASE_DURATION_MS);

    const result = await db.execute(dsql`
      WITH claimable AS (
        SELECT id
        FROM notification_outbox
        WHERE status = 'pending'
          AND attempts < ${MAX_ATTEMPTS}
          AND (next_attempt_at IS NULL OR next_attempt_at <= ${now})
        ORDER BY created_at
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      ),
      claimed AS (
        UPDATE notification_outbox
        SET
          status = 'sending',
          lease_token = ${leaseToken},
          lease_expires_at = ${leaseExpiresAt},
          updated_at = ${now}
        WHERE id IN (SELECT id FROM claimable)
        RETURNING *
      )
      SELECT * FROM claimed
    `);

    return (result.rows as Array<Record<string, unknown>>).map((row) => ({
      ...this.mapRowToOutboxEvent(row),
      leaseToken,
    }));
  }

  async recoverStaleClaims(db: DrizzleDatabase): Promise<number> {
    const now = new Date();

    const recovered = await db
      .update(notificationOutbox)
      .set({
        status: "pending",
        updatedAt: now,
        leaseToken: null,
        leaseExpiresAt: null,
        lastError: null,
      })
      .where(
        and(
          eq(notificationOutbox.status, "sending"),
          or(
            lte(notificationOutbox.leaseExpiresAt, now),
            isNull(notificationOutbox.leaseExpiresAt),
          ),
        ),
      )
      .returning();

    return recovered.length;
  }

  async markSent(
    db: DrizzleDatabase,
    eventId: string,
    leaseToken: string,
  ): Promise<boolean> {
    const updated = await db
      .update(notificationOutbox)
      .set({
        status: "sent",
        sentAt: new Date(),
        updatedAt: new Date(),
        lastError: null,
        leaseToken: null,
        leaseExpiresAt: null,
      })
      .where(
        and(
          eq(notificationOutbox.id, eventId),
          eq(notificationOutbox.leaseToken, leaseToken),
          eq(notificationOutbox.status, "sending"),
        ),
      )
      .returning();

    return updated.length > 0;
  }

  async markFailed(
    db: DrizzleDatabase,
    eventId: string,
    leaseToken: string,
    errorCode: string,
  ): Promise<boolean> {
    const now = new Date();

    const result = await db.execute(dsql`
      UPDATE notification_outbox
      SET
        attempts = attempts + 1,
        status = CASE
          WHEN attempts + 1 >= ${MAX_ATTEMPTS} THEN 'failed'
          ELSE 'pending'
        END,
        next_attempt_at = CASE
          WHEN attempts + 1 >= ${MAX_ATTEMPTS} THEN NULL
          ELSE NOW() + make_interval(secs => power(2, attempts + 1))
        END,
        last_error = ${errorCode},
        lease_token = NULL,
        lease_expires_at = NULL,
        updated_at = ${now}
      WHERE id = ${eventId}
        AND lease_token = ${leaseToken}
        AND status = 'sending'
      RETURNING id
    `);

    return (result.rows as Array<Record<string, unknown>>).length > 0;
  }

  async refreshLease(
    db: DrizzleDatabase,
    eventId: string,
    leaseToken: string,
  ): Promise<boolean> {
    const newExpiry = new Date(Date.now() + LEASE_DURATION_MS);

    const updated = await db
      .update(notificationOutbox)
      .set({
        leaseExpiresAt: newExpiry,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notificationOutbox.id, eventId),
          eq(notificationOutbox.leaseToken, leaseToken),
          eq(notificationOutbox.status, "sending"),
        ),
      )
      .returning();

    return updated.length > 0;
  }

  private mapRowToOutboxEvent(row: Record<string, unknown>): OutboxEvent {
    return {
      id: row.id as string,
      eventKey: row.event_key as string,
      eventType: row.event_type as string,
      contactId: row.contact_id as string,
      status: row.status as OutboxEvent["status"],
      attempts: row.attempts as number,
      lastError: (row.last_error as string) ?? null,
      leaseToken: (row.lease_token as string) ?? null,
      leaseExpiresAt: row.lease_expires_at
        ? new Date(row.lease_expires_at as string)
        : null,
      nextAttemptAt: row.next_attempt_at
        ? new Date(row.next_attempt_at as string)
        : null,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
      sentAt: row.sent_at ? new Date(row.sent_at as string) : null,
    };
  }
}

export const outboxService: IOutboxService = new DatabaseOutboxService();
