import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@/server/schema";
import { DatabaseReconciliationService, type DrizzleDatabase } from "@/server/reconciliation-service";
import type { IReconciliationProvider } from "@/server/reconciliation-providers";
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

const TEST_SCHEMA = `reconciliation_test_${Date.now()}`;

const pool = new pg.Pool({ connectionString: resolveTestDbUrl() });
let client: pg.PoolClient | undefined;

const MIGRATIONS = [
  "0000_base_schema.sql",
  "0001_growth_lead_attribution.sql",
  "0002_closed_loop_lead_pipeline.sql",
  "0003_public_form_contract.sql",
  "0004_google_ads_lead_ingestion.sql",
  "0005_notification_outbox.sql",
  "0006_outbox_lease_fields.sql",
  "0007_reconciliation.sql",
];

beforeAll(async () => {
  client = await pool.connect();
  await client.query(`CREATE SCHEMA IF NOT EXISTS ${TEST_SCHEMA}`);
  await client.query(`SET search_path TO ${TEST_SCHEMA}`);

  const migrationDir = join(process.cwd(), "drizzle");
  for (const file of MIGRATIONS) {
    const sql = readFileSync(join(migrationDir, file), "utf-8");
    await client.query(sql);
  }
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

const makeProvider = (
  name: "google_ads" | "formspree",
  ids: string[] | Error,
): IReconciliationProvider => ({
  name,
  fetchExternalLeadIds: async () => {
    if (ids instanceof Error) throw ids;
    return ids;
  },
});

const seedContact = async (
  db: DrizzleDatabase,
  overrides: Partial<schema.InsertContactRecord>,
) => {
  const base = {
    firstName: "Test",
    lastName: "Lead",
    email: `test-${Math.random().toString(36).slice(2)}@example.com`,
    requestType: "contact" as const,
    leadStatus: "new" as const,
    consentToContact: true,
    isTest: false,
  };
  await db.insert(schema.contacts).values({ ...base, ...overrides });
};

describe("Postgres reconciliation integration", () => {
  const service = new DatabaseReconciliationService();
  const now = new Date("2026-08-04T09:00:00Z");

  let db: DrizzleDatabase;

  beforeEach(async () => {
    await client!.query(`DELETE FROM reconciliation_discrepancies`);
    await client!.query(`DELETE FROM reconciliation_runs`);
    await client!.query(`DELETE FROM contacts`);
    db = drizzle(client!, { schema }) as unknown as DrizzleDatabase;
  });

  it("completes a reconciliation run and records correct counts", async () => {
    await seedContact(db, { googleAdsLeadId: "ga-stored-1" });
    await seedContact(db, { googleAdsLeadId: "ga-stored-2" });

    const provider = makeProvider("google_ads", ["ga-stored-1", "ga-stored-2"]);
    const result = await service.runReconciliation(db, provider, now);

    expect(result.status).toBe("completed");
    if (result.status === "completed") {
      expect(result.totalExternal).toBe(2);
      expect(result.totalStored).toBe(2);
      expect(result.missingInStored).toBe(0);
      expect(result.missingInExternal).toBe(0);
    }
  });

  it("records discrepancies for leads missing in stored and external", async () => {
    await seedContact(db, { googleAdsLeadId: "ga-stored-only" });

    const provider = makeProvider("google_ads", ["ga-external-only"]);
    const result = await service.runReconciliation(db, provider, now);

    expect(result.status).toBe("completed");
    if (result.status === "completed") {
      expect(result.missingInStored).toBe(1);
      expect(result.missingInExternal).toBe(1);
    }

    const discrepancies = await db
      .select()
      .from(schema.reconciliationDiscrepancies);
    expect(discrepancies).toHaveLength(2);

    const types = discrepancies.map((d) => d.discrepancyType).sort();
    expect(types).toEqual(["missing_in_external", "missing_in_stored"]);
  });

  it("prevents duplicate runs for the same run key", async () => {
    const provider = makeProvider("google_ads", []);

    const first = await service.runReconciliation(db, provider, now);
    expect(first.status).toBe("completed");

    const second = await service.runReconciliation(db, provider, now);
    expect(second.status).toBe("skipped");
    if (second.status === "skipped") {
      expect(second.reason).toBe("lock_contention");
    }

    const runs = await db.select().from(schema.reconciliationRuns);
    expect(runs).toHaveLength(1);
  });

  it("allows retry of a failed run", async () => {
    const failingProvider = makeProvider(
      "google_ads",
      new Error("provider_not_configured"),
    );
    const failed = await service.runReconciliation(db, failingProvider, now);
    expect(failed.status).toBe("failed");

    const successProvider = makeProvider("google_ads", []);
    const retried = await service.runReconciliation(db, successProvider, now);
    expect(retried.status).toBe("completed");

    const runs = await db.select().from(schema.reconciliationRuns);
    expect(runs).toHaveLength(1);
    expect(runs[0].status).toBe("completed");
  });

  it("concurrent lock acquisition results in exactly one winner", async () => {
    const clientA = await pool.connect();
    const clientB = await pool.connect();

    try {
      await clientA.query(`SET search_path TO ${TEST_SCHEMA}`);
      await clientB.query(`SET search_path TO ${TEST_SCHEMA}`);

      const dbA = drizzle(clientA, { schema }) as unknown as DrizzleDatabase;
      const dbB = drizzle(clientB, { schema }) as unknown as DrizzleDatabase;

      const provider = makeProvider("google_ads", []);

      const [resultA, resultB] = await Promise.all([
        service.runReconciliation(dbA, provider, now),
        service.runReconciliation(dbB, provider, now),
      ]);

      const statuses = [resultA.status, resultB.status].sort();
      expect(statuses).toEqual(["completed", "skipped"]);

      const runs = await db.select().from(schema.reconciliationRuns);
      expect(runs).toHaveLength(1);
    } finally {
      clientA.release();
      clientB.release();
    }
  });

  it("does not mutate contact records during reconciliation", async () => {
    await seedContact(db, {
      googleAdsLeadId: "ga-no-mutate",
      leadStatus: "new",
    });

    const before = await db
      .select()
      .from(schema.contacts)
      .where(undefined);

    const provider = makeProvider("google_ads", ["ga-external-only"]);
    await service.runReconciliation(db, provider, now);

    const after = await db
      .select()
      .from(schema.contacts)
      .where(undefined);

    expect(after).toEqual(before);
  });

  it("outcome contains no patient fields", async () => {
    await seedContact(db, {
      googleAdsLeadId: "ga-redact-test",
      firstName: "Sensitive",
      lastName: "Patient",
      email: "sensitive@example.com",
      phone: "555-123-4567",
    });

    const provider = makeProvider("google_ads", ["ga-redact-test"]);
    const result = await service.runReconciliation(db, provider, now);

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("Sensitive");
    expect(serialized).not.toContain("Patient");
    expect(serialized).not.toContain("sensitive@example.com");
    expect(serialized).not.toContain("555-123-4567");
  });

  it("handles formspree provider using submissionId", async () => {
    await seedContact(db, { submissionId: "fs-stored-1" });

    const provider = makeProvider("formspree", ["fs-stored-1", "fs-missing"]);
    const result = await service.runReconciliation(db, provider, now);

    expect(result.status).toBe("completed");
    if (result.status === "completed") {
      expect(result.totalExternal).toBe(2);
      expect(result.totalStored).toBe(1);
      expect(result.missingInStored).toBe(1);
      expect(result.missingInExternal).toBe(0);
    }
  });
});
