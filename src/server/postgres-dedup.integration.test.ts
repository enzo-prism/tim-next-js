import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@/server/schema";
import { DatabaseStorage } from "@/server/storage";
import { applyTestMigrations } from "@/server/test-migrations";

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

const TEST_SCHEMA = `dedup_test_${Date.now()}`;

const pool = new pg.Pool({ connectionString: resolveTestDbUrl() });
let client: pg.PoolClient | undefined;
let storage: DatabaseStorage;

beforeAll(async () => {
  client = await pool.connect();

  await client.query(`CREATE SCHEMA IF NOT EXISTS ${TEST_SCHEMA}`);
  await client.query(`SET search_path TO ${TEST_SCHEMA}`);

  await applyTestMigrations(client);

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

describe("Postgres partial-index dedup integration", () => {
  it("inserts a new Google Ads lead", async () => {
    const contact = await storage.createContactIgnoreDuplicate({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phone: "408-555-0100",
      requestType: "google_ads_lead",
      googleAdsLeadId: "pg-dedup-lead-001",
      ingestedVia: "webhook",
      leadStatus: "new",
      consentToContact: true,
    });
    expect(contact).not.toBeNull();
    expect(contact?.googleAdsLeadId).toBe("pg-dedup-lead-001");
  });

  it("returns null for a duplicate google_ads_lead_id via ON CONFLICT DO NOTHING", async () => {
    const duplicate = await storage.createContactIgnoreDuplicate({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phone: "408-555-0100",
      requestType: "google_ads_lead",
      googleAdsLeadId: "pg-dedup-lead-001",
      ingestedVia: "webhook",
      leadStatus: "new",
      consentToContact: true,
    });
    expect(duplicate).toBeNull();
  });

  it("allows multiple contacts with null google_ads_lead_id", async () => {
    const first = await storage.createContactIgnoreDuplicate({
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@example.com",
      requestType: "contact",
      leadStatus: "new",
      consentToContact: true,
    });
    const second = await storage.createContactIgnoreDuplicate({
      firstName: "Bob",
      lastName: "Jones",
      email: "bob@example.com",
      requestType: "contact",
      leadStatus: "new",
      consentToContact: true,
    });
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(first?.id).not.toBe(second?.id);
  });

  it("allows a different google_ads_lead_id after a duplicate", async () => {
    const contact = await storage.createContactIgnoreDuplicate({
      firstName: "Carol",
      lastName: "White",
      email: "carol@example.com",
      requestType: "google_ads_lead",
      googleAdsLeadId: "pg-dedup-lead-002",
      ingestedVia: "webhook",
      leadStatus: "new",
      consentToContact: true,
    });
    expect(contact).not.toBeNull();
    expect(contact?.googleAdsLeadId).toBe("pg-dedup-lead-002");
  });
});
