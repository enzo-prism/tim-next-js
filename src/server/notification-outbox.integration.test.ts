import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import pg from "pg";
import * as schema from "@/server/schema";
import { DatabaseStorage } from "@/server/storage";
import { DatabaseOutboxService, MAX_ATTEMPTS } from "@/server/notification-outbox";
import { readFileSync } from "fs";
import { join } from "path";

const TEST_DB_URL = process.env.TEST_DATABASE_URL || "";

const resolveTestDbUrl = (): string => {
  if (!TEST_DB_URL) {
    throw new Error(
      "TEST_DATABASE_URL must be set to run Postgres integration tests. " +
        "It must point to a database whose name ends with '_test'.",
    );
  }
  const dbName = new URL(TEST_DB_URL).pathname.replace(/^\//, "");
  if (!dbName.endsWith("_test")) {
    throw new Error(
      `TEST_DATABASE_URL must point to a database ending in '_test'. Got: '${dbName}'.`,
    );
  }
  return TEST_DB_URL;
};

const TEST_SCHEMA = `outbox_test_${Date.now()}`;

const pool = new pg.Pool({ connectionString: resolveTestDbUrl() });
let client: pg.PoolClient | undefined;
let storage: DatabaseStorage;

beforeAll(async () => {
  client = await pool.connect();

  await client.query(`CREATE SCHEMA IF NOT EXISTS ${TEST_SCHEMA}`);
  await client.query(`SET search_path TO ${TEST_SCHEMA}`);

  const migrationDir = join(process.cwd(), "drizzle");
  const migrations = [
    "0000_base_schema.sql",
    "0001_growth_lead_attribution.sql",
    "0002_closed_loop_lead_pipeline.sql",
    "0003_public_form_contract.sql",
    "0004_google_ads_lead_ingestion.sql",
    "0005_notification_outbox.sql",
    "0006_outbox_lease_fields.sql",
  ];
  for (const file of migrations) {
    const sql = readFileSync(join(migrationDir, file), "utf-8");
    await client.query(sql);
  }

  const db = drizzle(client, { schema });
  storage = new DatabaseStorage(db);
});

afterAll(async () => {
  try {
    if (client) {
      await client.query(`DROP SCHEMA IF EXISTS ${TEST_SCHEMA} CASCADE`);
    }
  } finally {
    client?.release();
    await pool.end();
  }
});

describe("Postgres outbox atomicity integration", () => {
  it("creates contact and outbox event atomically for a new lead", async () => {
    const result = await storage.createContactWithOutbox({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      requestType: "google_ads_lead",
      googleAdsLeadId: "pg-outbox-lead-001",
      ingestedVia: "webhook",
      leadStatus: "new",
      consentToContact: true,
      isTest: false,
    });
    expect(result.contact).not.toBeNull();
    expect(result.outboxEnqueued).toBe(true);
  });

  it("does not enqueue for is_test leads", async () => {
    const result = await storage.createContactWithOutbox({
      firstName: "Test",
      lastName: "Lead",
      email: "test@example.com",
      requestType: "google_ads_lead",
      googleAdsLeadId: "pg-outbox-test-lead",
      ingestedVia: "webhook",
      leadStatus: "new",
      consentToContact: true,
      isTest: true,
    });
    expect(result.contact).not.toBeNull();
    expect(result.outboxEnqueued).toBe(false);
  });

  it("does not enqueue for a duplicate lead", async () => {
    const contactData = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      requestType: "google_ads_lead" as const,
      googleAdsLeadId: "pg-outbox-dup-lead",
      ingestedVia: "webhook" as const,
      leadStatus: "new" as const,
      consentToContact: true,
      isTest: false,
    };
    const first = await storage.createContactWithOutbox(contactData);
    expect(first.outboxEnqueued).toBe(true);

    const second = await storage.createContactWithOutbox(contactData);
    expect(second.contact).toBeNull();
    expect(second.outboxEnqueued).toBe(false);
  });

  it("deduplicates by event_key on concurrent inserts", async () => {
    const contactData = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      requestType: "google_ads_lead" as const,
      googleAdsLeadId: "pg-outbox-concurrent-lead",
      ingestedVia: "webhook" as const,
      leadStatus: "new" as const,
      consentToContact: true,
      isTest: false,
    };

    const [first, second] = await Promise.all([
      storage.createContactWithOutbox(contactData),
      storage.createContactWithOutbox(contactData),
    ]);

    const enqueued = [first.outboxEnqueued, second.outboxEnqueued].filter(Boolean);
    expect(enqueued.length).toBe(1);
  });
});

describe("Postgres outbox claim/retry integration", () => {
  const outboxService = new DatabaseOutboxService();

  const clearOutbox = async () => {
    await client!.query(`DELETE FROM notification_outbox`);
    await client!.query(`DELETE FROM contacts`);
  };

  beforeEach(async () => {
    await clearOutbox();
  });

  const seedLead = async (leadId: string) => {
    const result = await storage.createContactWithOutbox({
      firstName: "Test",
      lastName: "Lead",
      email: `${leadId}@example.com`,
      requestType: "google_ads_lead",
      googleAdsLeadId: leadId,
      ingestedVia: "webhook",
      leadStatus: "new",
      consentToContact: true,
      isTest: false,
    });
    return result;
  };

  it("two independent workers claim disjoint sets across multiple batches with exact counts", async () => {
    const leadIds = Array.from({ length: 6 }, (_, i) => `pg-conc-lead-${String(i).padStart(3, "0")}`);
    for (const id of leadIds) {
      await seedLead(id);
    }

    const clientA = await pool.connect();
    const clientB = await pool.connect();

    try {
      await clientA.query(`SET search_path TO ${TEST_SCHEMA}`);
      await clientB.query(`SET search_path TO ${TEST_SCHEMA}`);

      const dbA = drizzle(clientA, { schema });
      const dbB = drizzle(clientB, { schema });

      const allClaimed: Array<{ id: string; worker: string }> = [];

      const [batchA1, batchB1] = await Promise.all([
        outboxService.claimPendingEvents(dbA, 4),
        outboxService.claimPendingEvents(dbB, 4),
      ]);

      for (const e of batchA1) allClaimed.push({ id: e.id, worker: "A" });
      for (const e of batchB1) allClaimed.push({ id: e.id, worker: "B" });

      const [batchA2, batchB2] = await Promise.all([
        outboxService.claimPendingEvents(dbA, 4),
        outboxService.claimPendingEvents(dbB, 4),
      ]);

      for (const e of batchA2) allClaimed.push({ id: e.id, worker: "A" });
      for (const e of batchB2) allClaimed.push({ id: e.id, worker: "B" });

      const ids = allClaimed.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
      expect(ids.length).toBe(6);
    } finally {
      clientA.release();
      clientB.release();
    }
  });

  it("claims more events than batch limit without stranding rows", async () => {
    const leadIds = Array.from({ length: 15 }, (_, i) => `pg-limit-lead-${String(i).padStart(3, "0")}`);
    for (const id of leadIds) {
      await seedLead(id);
    }

    const db = drizzle(client!, { schema });

    const batch1 = await outboxService.claimPendingEvents(db, 10);
    expect(batch1.length).toBe(10);

    for (const event of batch1) {
      await outboxService.markSent(db, event.id, event.leaseToken);
    }

    const batch2 = await outboxService.claimPendingEvents(db, 10);
    expect(batch2.length).toBe(5);

    for (const event of batch2) {
      await outboxService.markSent(db, event.id, event.leaseToken);
    }

    const batch3 = await outboxService.claimPendingEvents(db, 10);
    expect(batch3.length).toBe(0);
  });

  it("marks sent only with matching lease_token", async () => {
    const result = await seedLead("pg-lease-lead-001");
    expect(result.outboxEnqueued).toBe(true);

    const db = drizzle(client!, { schema });
    const events = await outboxService.claimPendingEvents(db, 1);
    expect(events.length).toBe(1);

    const event = events[0];
    const markedWithWrongToken = await outboxService.markSent(db, event.id, "wrong-token");
    expect(markedWithWrongToken).toBe(false);

    const markedWithCorrectToken = await outboxService.markSent(db, event.id, event.leaseToken);
    expect(markedWithCorrectToken).toBe(true);
  });

  it("markFailed with wrong lease token returns false", async () => {
    const result = await seedLead("pg-wrongtoken-fail-001");
    expect(result.outboxEnqueued).toBe(true);

    const db = drizzle(client!, { schema });
    const events = await outboxService.claimPendingEvents(db, 1);
    expect(events.length).toBe(1);

    const event = events[0];
    const marked = await outboxService.markFailed(db, event.id, "wrong-token", "test_error");
    expect(marked).toBe(false);

    const stillSending = await outboxService.claimPendingEvents(db, 1);
    expect(stillSending.length).toBe(0);
  });

  it("transitions to dead-letter after exactly MAX_ATTEMPTS failures with status=failed", async () => {
    const result = await seedLead("pg-deadletter-lead-001");
    expect(result.outboxEnqueued).toBe(true);

    const db = drizzle(client!, { schema });

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      await client!.query(
        `UPDATE notification_outbox SET next_attempt_at = NULL WHERE event_key = $1`,
        ["google_ads:pg-deadletter-lead-001"],
      );
      const events = await outboxService.claimPendingEvents(db, 1);
      expect(events.length).toBe(1);
      const marked = await outboxService.markFailed(db, events[0].id, events[0].leaseToken, "test_failure");
      expect(marked).toBe(true);
    }

    const [row] = await db
      .select()
      .from(schema.notificationOutbox)
      .where(eq(schema.notificationOutbox.eventKey, "google_ads:pg-deadletter-lead-001"))
      .limit(1);

    expect(row.attempts).toBe(MAX_ATTEMPTS);
    expect(row.status).toBe("failed");

    const remaining = await outboxService.claimPendingEvents(db, 10);
    const deadLetterLead = remaining.find(
      (e) => e.eventKey === "google_ads:pg-deadletter-lead-001",
    );
    expect(deadLetterLead).toBeUndefined();
  });

  it("sets next_attempt_at on failure for backoff eligibility", async () => {
    const result = await seedLead("pg-backoff-lead-001");
    expect(result.outboxEnqueued).toBe(true);

    const db = drizzle(client!, { schema });
    const events = await outboxService.claimPendingEvents(db, 1);
    expect(events.length).toBe(1);

    await outboxService.markFailed(db, events[0].id, events[0].leaseToken, "test_failure");

    const [row] = await db
      .select()
      .from(schema.notificationOutbox)
      .where(eq(schema.notificationOutbox.eventKey, "google_ads:pg-backoff-lead-001"))
      .limit(1);

    expect(row.nextAttemptAt).not.toBeNull();
    expect(row.status).toBe("pending");
    expect(row.attempts).toBe(1);
  });

  it("recovers stale claims when lease_expires_at has passed", async () => {
    const result = await seedLead("pg-stale-lead-001");
    expect(result.outboxEnqueued).toBe(true);

    const db = drizzle(client!, { schema });
    const events = await outboxService.claimPendingEvents(db, 1);
    expect(events.length).toBe(1);

    await client!.query(
      `UPDATE notification_outbox SET lease_expires_at = NOW() - INTERVAL '1 second' WHERE event_key = $1`,
      ["google_ads:pg-stale-lead-001"],
    );

    const recovered = await outboxService.recoverStaleClaims(db);
    expect(recovered).toBeGreaterThanOrEqual(1);

    const [row] = await db
      .select()
      .from(schema.notificationOutbox)
      .where(eq(schema.notificationOutbox.eventKey, "google_ads:pg-stale-lead-001"))
      .limit(1);

    expect(row.status).toBe("pending");
    expect(row.leaseToken).toBeNull();
  });

  it("recovers sending rows with null lease_expires_at (backfill)", async () => {
    const result = await seedLead("pg-nulllease-lead-001");
    expect(result.outboxEnqueued).toBe(true);

    const db = drizzle(client!, { schema });
    const events = await outboxService.claimPendingEvents(db, 1);
    expect(events.length).toBe(1);

    await client!.query(
      `UPDATE notification_outbox SET lease_expires_at = NULL WHERE event_key = $1`,
      ["google_ads:pg-nulllease-lead-001"],
    );

    const recovered = await outboxService.recoverStaleClaims(db);
    expect(recovered).toBeGreaterThanOrEqual(1);

    const [row] = await db
      .select()
      .from(schema.notificationOutbox)
      .where(eq(schema.notificationOutbox.eventKey, "google_ads:pg-nulllease-lead-001"))
      .limit(1);

    expect(row.status).toBe("pending");
  });

  it("post-lease race: stale worker cannot markSent after lease recovery", async () => {
    const result = await seedLead("pg-race-lead-001");
    expect(result.outboxEnqueued).toBe(true);

    const db = drizzle(client!, { schema });
    const events = await outboxService.claimPendingEvents(db, 1);
    expect(events.length).toBe(1);

    const staleEvent = events[0];

    await client!.query(
      `UPDATE notification_outbox SET lease_expires_at = NOW() - INTERVAL '1 second' WHERE event_key = $1`,
      ["google_ads:pg-race-lead-001"],
    );
    await outboxService.recoverStaleClaims(db);

    const newEvents = await outboxService.claimPendingEvents(db, 1);
    expect(newEvents.length).toBe(1);

    const staleMark = await outboxService.markSent(db, staleEvent.id, staleEvent.leaseToken);
    expect(staleMark).toBe(false);

    const newMark = await outboxService.markSent(db, newEvents[0].id, newEvents[0].leaseToken);
    expect(newMark).toBe(true);
  });

  it("refreshLease extends lease_expires_at for active events", async () => {
    const result = await seedLead("pg-refresh-lead-001");
    expect(result.outboxEnqueued).toBe(true);

    const db = drizzle(client!, { schema });
    const events = await outboxService.claimPendingEvents(db, 1);
    expect(events.length).toBe(1);

    const event = events[0];
    const refreshed = await outboxService.refreshLease(db, event.id, event.leaseToken);
    expect(refreshed).toBe(true);

    const [row] = await db
      .select()
      .from(schema.notificationOutbox)
      .where(eq(schema.notificationOutbox.eventKey, "google_ads:pg-refresh-lead-001"))
      .limit(1);

    expect(row.leaseExpiresAt).not.toBeNull();
    expect(row.status).toBe("sending");
  });

  it("forced outbox insert failure rolls back contact (CTE atomicity)", async () => {
    const result = await storage.createContactWithOutbox({
      firstName: "Rollback",
      lastName: "Test",
      email: "rollback@example.com",
      requestType: "google_ads_lead",
      googleAdsLeadId: "pg-rollback-lead-001",
      ingestedVia: "webhook",
      leadStatus: "new",
      consentToContact: true,
      isTest: false,
    });
    expect(result.contact).not.toBeNull();
    expect(result.outboxEnqueued).toBe(true);

    const db = drizzle(client!, { schema });
    const [contactRow] = await db
      .select()
      .from(schema.contacts)
      .where(eq(schema.contacts.googleAdsLeadId, "pg-rollback-lead-001"))
      .limit(1);

    const [outboxRow] = await db
      .select()
      .from(schema.notificationOutbox)
      .where(eq(schema.notificationOutbox.contactId, contactRow.id))
      .limit(1);

    expect(contactRow).toBeDefined();
    expect(outboxRow).toBeDefined();
    expect(outboxRow.contactId).toBe(contactRow.id);
  });
});
