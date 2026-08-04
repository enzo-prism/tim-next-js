import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@/server/schema";
import { DatabaseStorage } from "@/server/storage";
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
