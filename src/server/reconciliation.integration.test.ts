import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import pg from "pg";
import * as schema from "@/server/schema";
import { DatabaseReconciliationService, type DrizzleDatabase } from "@/server/reconciliation-service";
import type { IReconciliationProvider, ReconciliationTimeWindow } from "@/server/reconciliation-providers";
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
  "0008_reconciliation_lease.sql",
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fetchExternalLeadIds: async (window: ReconciliationTimeWindow) => {
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
    createdAt: new Date("2026-08-04T06:00:00Z"),
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

  it("recovers stale running runs with expired lease", async () => {
    const provider = makeProvider("google_ads", []);
    const first = await service.runReconciliation(db, provider, now);
    expect(first.status).toBe("completed");

    await client!.query(
      `UPDATE reconciliation_runs SET status = 'running', lease_expires_at = NOW() - INTERVAL '1 second' WHERE run_key = $1`,
      ["reconciliation:google_ads:2026-08-04:am"],
    );

    const recovered = await service.recoverStaleRuns(db);
    expect(recovered).toBeGreaterThanOrEqual(1);

    const [run] = await db
      .select()
      .from(schema.reconciliationRuns)
      .where(eq(schema.reconciliationRuns.runKey, "reconciliation:google_ads:2026-08-04:am"))
      .limit(1);

    expect(run.status).toBe("failed");
    expect(run.errorCode).toBe("stale_run_recovered");
  });

  it("recovers running runs with null lease_expires_at", async () => {
    await client!.query(
      `INSERT INTO reconciliation_runs (run_key, provider, status, lease_token, lease_expires_at) VALUES ($1, $2, 'running', NULL, NULL)`,
      ["reconciliation:google_ads:2026-08-04:am", "google_ads"],
    );

    const recovered = await service.recoverStaleRuns(db);
    expect(recovered).toBeGreaterThanOrEqual(1);
  });

  it("stale worker cannot finalize after lease recovery", async () => {
    const lock = await service.acquireRunLock(db, "reconciliation:google_ads:2026-08-04:am", "google_ads");
    expect(lock).not.toBeNull();

    await client!.query(
      `UPDATE reconciliation_runs SET lease_expires_at = NOW() - INTERVAL '1 second' WHERE run_key = $1`,
      ["reconciliation:google_ads:2026-08-04:am"],
    );
    await service.recoverStaleRuns(db);

    const finalized = await service.finalizeRun(
      db,
      lock!.runId,
      lock!.leaseToken,
      "google_ads",
      { totalExternal: 0, totalStored: 0, missingInStored: 0, missingInExternal: 0 },
      [],
    );
    expect(finalized).toBe(false);
  });

  it("deduplicates external IDs before comparison", async () => {
    await seedContact(db, { googleAdsLeadId: "ga-dedup-1" });

    const provider = makeProvider("google_ads", ["ga-dedup-1", "ga-dedup-1", "ga-dedup-1"]);
    const result = await service.runReconciliation(db, provider, now);

    expect(result.status).toBe("completed");
    if (result.status === "completed") {
      expect(result.totalExternal).toBe(1);
      expect(result.missingInStored).toBe(0);
    }
  });

  it("forced discrepancy insert failure keeps run in running state (atomic CTE)", async () => {
    await seedContact(db, { googleAdsLeadId: "ga-stored-1" });

    await client!.query(`
      CREATE OR REPLACE FUNCTION force_discrepancy_failure() RETURNS trigger AS $$
      BEGIN
        IF NEW.external_id LIKE '%force-fail%' THEN
          RAISE EXCEPTION 'forced discrepancy failure for test';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client!.query(`
      CREATE TRIGGER test_force_discrepancy_failure
      BEFORE INSERT ON reconciliation_discrepancies
      FOR EACH ROW EXECUTE FUNCTION force_discrepancy_failure();
    `);

    try {
      const provider = makeProvider("google_ads", ["ga-force-fail-external"]);
      const result = await service.runReconciliation(db, provider, now);

      expect(result.status).toBe("failed");

      const [run] = await db
        .select()
        .from(schema.reconciliationRuns)
        .where(eq(schema.reconciliationRuns.runKey, "reconciliation:google_ads:2026-08-04:am"))
        .limit(1);

      expect(run.status).toBe("failed");

      const discrepancies = await db
        .select()
        .from(schema.reconciliationDiscrepancies);
      expect(discrepancies).toHaveLength(0);
    } finally {
      await client!.query(`DROP TRIGGER IF EXISTS test_force_discrepancy_failure ON reconciliation_discrepancies`);
      await client!.query(`DROP FUNCTION IF EXISTS force_discrepancy_failure()`);
    }
  });

  it("retry after forced finalize failure produces consistent state", async () => {
    await seedContact(db, { googleAdsLeadId: "ga-retry-consistent" });

    await client!.query(`
      CREATE OR REPLACE FUNCTION force_discrepancy_failure_once() RETURNS trigger AS $$
      BEGIN
        IF NEW.external_id LIKE '%retry-fail%' THEN
          RAISE EXCEPTION 'forced failure';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client!.query(`
      CREATE TRIGGER test_force_discrepancy_failure_once
      BEFORE INSERT ON reconciliation_discrepancies
      FOR EACH ROW EXECUTE FUNCTION force_discrepancy_failure_once();
    `);

    try {
      const failProvider = makeProvider("google_ads", ["ga-retry-fail-external"]);
      const failed = await service.runReconciliation(db, failProvider, now);
      expect(failed.status).toBe("failed");

      await client!.query(`DROP TRIGGER IF EXISTS test_force_discrepancy_failure_once ON reconciliation_discrepancies`);
      await client!.query(`DROP FUNCTION IF EXISTS force_discrepancy_failure_once()`);

      const successProvider = makeProvider("google_ads", ["ga-retry-consistent"]);
      const retried = await service.runReconciliation(db, successProvider, now);
      expect(retried.status).toBe("completed");

      const runs = await db.select().from(schema.reconciliationRuns);
      expect(runs).toHaveLength(1);
      expect(runs[0].status).toBe("completed");

      if (retried.status === "completed") {
        expect(retried.totalStored).toBe(1);
        expect(retried.missingInStored).toBe(0);
      }
    } finally {
      await client!.query(`DROP TRIGGER IF EXISTS test_force_discrepancy_failure_once ON reconciliation_discrepancies`);
      await client!.query(`DROP FUNCTION IF EXISTS force_discrepancy_failure_once()`);
    }
  });

  it("time window filters stored leads by createdAt (half-open)", async () => {
    await seedContact(db, { googleAdsLeadId: "ga-in-window" });

    await client!.query(
      `UPDATE contacts SET created_at = '2026-08-01T00:00:00Z' WHERE google_ads_lead_id = 'ga-in-window'`,
    );

    const provider = makeProvider("google_ads", ["ga-in-window"]);
    const result = await service.runReconciliation(db, provider, now);

    expect(result.status).toBe("completed");
    if (result.status === "completed") {
      expect(result.totalStored).toBe(0);
      expect(result.missingInStored).toBe(1);
    }
  });

  it("delayed-arrival lead with timestamp in window is included", async () => {
    await seedContact(db, {
      googleAdsLeadId: "ga-delayed",
      createdAt: new Date("2026-08-04T08:59:59Z"),
    });

    const provider = makeProvider("google_ads", ["ga-delayed"]);
    const result = await service.runReconciliation(db, provider, now);

    expect(result.status).toBe("completed");
    if (result.status === "completed") {
      expect(result.totalStored).toBe(1);
      expect(result.missingInStored).toBe(0);
    }
  });

  it("lead at exact until boundary is excluded (half-open)", async () => {
    await seedContact(db, {
      googleAdsLeadId: "ga-at-boundary",
      createdAt: new Date("2026-08-04T09:00:00Z"),
    });

    const provider = makeProvider("google_ads", ["ga-at-boundary"]);
    const result = await service.runReconciliation(db, provider, now);

    expect(result.status).toBe("completed");
    if (result.status === "completed") {
      expect(result.totalStored).toBe(0);
      expect(result.missingInStored).toBe(1);
    }
  });
});
