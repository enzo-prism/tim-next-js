import { and, eq, sql as dsql } from "drizzle-orm";
import { notificationOutbox } from "@/server/schema";
import type { PgDatabase } from "drizzle-orm/pg-core";
import type * as schema from "@/server/schema";

type DrizzleDatabase = PgDatabase<any, typeof schema>;

export type OutboxEvent = typeof notificationOutbox.$inferSelect;

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

export interface IOutboxService {
  enqueueNewLeadEvent(
    db: DrizzleDatabase,
    contactId: string,
    eventKey: string,
  ): Promise<OutboxEvent | null>;
  claimPendingEvents(
    db: DrizzleDatabase,
    limit: number,
  ): Promise<OutboxEvent[]>;
  markSent(db: DrizzleDatabase, eventId: string): Promise<void>;
  markFailed(
    db: DrizzleDatabase,
    eventId: string,
    errorCode: string,
  ): Promise<void>;
}

export class DatabaseOutboxService implements IOutboxService {
  async enqueueNewLeadEvent(
    db: DrizzleDatabase,
    contactId: string,
    eventKey: string,
  ): Promise<OutboxEvent | null> {
    const [event] = await db
      .insert(notificationOutbox)
      .values({
        eventKey,
        eventType: "new_lead",
        contactId,
        status: "pending",
      })
      .onConflictDoNothing()
      .returning();
    return event || null;
  }

  async claimPendingEvents(
    db: DrizzleDatabase,
    limit: number,
  ): Promise<OutboxEvent[]> {
    const events = await db
      .select()
      .from(notificationOutbox)
      .where(eq(notificationOutbox.status, "pending"))
      .orderBy(notificationOutbox.createdAt)
      .limit(limit);

    if (events.length === 0) return [];

    const ids = events.map((e) => e.id);
    const claimed = await db
      .update(notificationOutbox)
      .set({ status: "sending", updatedAt: new Date() })
      .where(
        and(
          dsql`${notificationOutbox.id} = ANY(${ids})`,
          eq(notificationOutbox.status, "pending"),
        ),
      )
      .returning();

    return claimed;
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
    await db
      .update(notificationOutbox)
      .set({
        status: "failed",
        updatedAt: new Date(),
        lastError: errorCode,
        attempts: dsql`${notificationOutbox.attempts} + 1`,
      })
      .where(eq(notificationOutbox.id, eventId));
  }
}

export const outboxService: IOutboxService = new DatabaseOutboxService();
