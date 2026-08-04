import { eq, isNotNull, sql as dsql } from "drizzle-orm";
import {
  contacts,
  reconciliationDiscrepancies,
  reconciliationRuns,
  type ReconciliationProviderName,
} from "@/server/schema";
import type { IReconciliationProvider } from "@/server/reconciliation-providers";
import type { PgDatabase } from "drizzle-orm/pg-core";
import type * as schema from "@/server/schema";

type DrizzleDatabase = PgDatabase<any, typeof schema>;

export type { DrizzleDatabase };

export type ReconciliationOutcome =
  | {
      status: "completed";
      runKey: string;
      totalExternal: number;
      totalStored: number;
      missingInStored: number;
      missingInExternal: number;
    }
  | {
      status: "failed";
      runKey: string;
      errorCode: string;
    }
  | {
      status: "skipped";
      runKey: string;
      reason: "lock_contention";
    };

export const computeRunKey = (
  provider: ReconciliationProviderName,
  now: Date,
): string => {
  const dateStr = now.toISOString().slice(0, 10);
  const slot = now.getUTCHours() < 12 ? "am" : "pm";
  return `reconciliation:${provider}:${dateStr}:${slot}`;
};

export interface IReconciliationService {
  acquireRunLock(
    db: DrizzleDatabase,
    runKey: string,
    provider: ReconciliationProviderName,
  ): Promise<string | null>;
  getStoredLeadIds(
    db: DrizzleDatabase,
    provider: ReconciliationProviderName,
  ): Promise<string[]>;
  recordDiscrepancies(
    db: DrizzleDatabase,
    runId: string,
    provider: ReconciliationProviderName,
    missingInStored: string[],
    missingInExternal: string[],
  ): Promise<void>;
  completeRun(
    db: DrizzleDatabase,
    runId: string,
    counts: {
      totalExternal: number;
      totalStored: number;
      missingInStored: number;
      missingInExternal: number;
    },
  ): Promise<void>;
  failRun(
    db: DrizzleDatabase,
    runId: string,
    errorCode: string,
  ): Promise<void>;
  runReconciliation(
    db: DrizzleDatabase,
    providerAdapter: IReconciliationProvider,
    now?: Date,
  ): Promise<ReconciliationOutcome>;
}

export class DatabaseReconciliationService implements IReconciliationService {
  async acquireRunLock(
    db: DrizzleDatabase,
    runKey: string,
    provider: ReconciliationProviderName,
  ): Promise<string | null> {
    const inserted = await db.execute(dsql`
      INSERT INTO reconciliation_runs (run_key, provider, status)
      VALUES (${runKey}, ${provider}, 'running')
      ON CONFLICT (run_key) DO NOTHING
      RETURNING id
    `);
    const insertedRows = inserted.rows as Array<{ id: string }>;
    if (insertedRows.length > 0) return insertedRows[0].id;

    const retried = await db.execute(dsql`
      UPDATE reconciliation_runs
      SET
        status = 'running',
        started_at = NOW(),
        error_code = NULL,
        completed_at = NULL
      WHERE run_key = ${runKey}
        AND status = 'failed'
      RETURNING id
    `);
    const retriedRows = retried.rows as Array<{ id: string }>;
    return retriedRows.length > 0 ? retriedRows[0].id : null;
  }

  async getStoredLeadIds(
    db: DrizzleDatabase,
    provider: ReconciliationProviderName,
  ): Promise<string[]> {
    if (provider === "google_ads") {
      const rows = await db
        .select({ id: contacts.googleAdsLeadId })
        .from(contacts)
        .where(isNotNull(contacts.googleAdsLeadId));
      return rows
        .map((r) => r.id)
        .filter((id): id is string => id !== null);
    }

    const rows = await db
      .select({ id: contacts.submissionId })
      .from(contacts)
      .where(isNotNull(contacts.submissionId));
    return rows
      .map((r) => r.id)
      .filter((id): id is string => id !== null);
  }

  async recordDiscrepancies(
    db: DrizzleDatabase,
    runId: string,
    provider: ReconciliationProviderName,
    missingInStored: string[],
    missingInExternal: string[],
  ): Promise<void> {
    const rows = [
      ...missingInStored.map((externalId) => ({
        runId,
        provider,
        externalId,
        discrepancyType: "missing_in_stored" as const,
      })),
      ...missingInExternal.map((externalId) => ({
        runId,
        provider,
        externalId,
        discrepancyType: "missing_in_external" as const,
      })),
    ];

    if (rows.length === 0) return;

    await db.insert(reconciliationDiscrepancies).values(rows);
  }

  async completeRun(
    db: DrizzleDatabase,
    runId: string,
    counts: {
      totalExternal: number;
      totalStored: number;
      missingInStored: number;
      missingInExternal: number;
    },
  ): Promise<void> {
    await db
      .update(reconciliationRuns)
      .set({
        status: "completed",
        totalExternal: counts.totalExternal,
        totalStored: counts.totalStored,
        missingInStored: counts.missingInStored,
        missingInExternal: counts.missingInExternal,
        completedAt: new Date(),
      })
      .where(eq(reconciliationRuns.id, runId));
  }

  async failRun(
    db: DrizzleDatabase,
    runId: string,
    errorCode: string,
  ): Promise<void> {
    await db
      .update(reconciliationRuns)
      .set({
        status: "failed",
        errorCode,
        completedAt: new Date(),
      })
      .where(eq(reconciliationRuns.id, runId));
  }

  async runReconciliation(
    db: DrizzleDatabase,
    providerAdapter: IReconciliationProvider,
    now?: Date,
  ): Promise<ReconciliationOutcome> {
    const timestamp = now ?? new Date();
    const runKey = computeRunKey(providerAdapter.name, timestamp);

    const runId = await this.acquireRunLock(db, runKey, providerAdapter.name);
    if (!runId) {
      return { status: "skipped", runKey, reason: "lock_contention" };
    }

    try {
      const externalIds = await providerAdapter.fetchExternalLeadIds();
      const storedIds = await this.getStoredLeadIds(db, providerAdapter.name);

      const externalSet = new Set(externalIds);
      const storedSet = new Set(storedIds);

      const missingInStored = externalIds.filter((id) => !storedSet.has(id));
      const missingInExternal = storedIds.filter((id) => !externalSet.has(id));

      await this.recordDiscrepancies(
        db,
        runId,
        providerAdapter.name,
        missingInStored,
        missingInExternal,
      );

      const counts = {
        totalExternal: externalIds.length,
        totalStored: storedIds.length,
        missingInStored: missingInStored.length,
        missingInExternal: missingInExternal.length,
      };

      await this.completeRun(db, runId, counts);

      return { status: "completed", runKey, ...counts };
    } catch (error) {
      const errorCode =
        error instanceof Error ? error.message : "unknown_error";
      await this.failRun(db, runId, errorCode);
      return { status: "failed", runKey, errorCode };
    }
  }
}

export const reconciliationService: IReconciliationService =
  new DatabaseReconciliationService();
