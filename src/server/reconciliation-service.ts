import { randomUUID } from "crypto";
import { and, eq, gte, isNotNull, lt, or, isNull, sql as dsql } from "drizzle-orm";
import {
  contacts,
  reconciliationRuns,
  type ReconciliationProviderName,
} from "@/server/schema";
import type {
  IReconciliationProvider,
  ReconciliationTimeWindow,
} from "@/server/reconciliation-providers";
import type { PgDatabase } from "drizzle-orm/pg-core";
import type * as schema from "@/server/schema";

type DrizzleDatabase = PgDatabase<any, typeof schema>;

export type { DrizzleDatabase };

export const RECONCILIATION_LEASE_DURATION_MS = 5 * 60_000;
export const PROVIDER_TIMEOUT_MS = 3 * 60_000;
export const INGESTION_OVERLAP_MS = 15 * 60_000;

const ALLOWED_ERROR_CODES = new Set([
  "provider_not_configured",
  "provider_timeout",
  "provider_api_error",
  "database_error",
  "stale_run_recovered",
  "unknown_error",
]);

export const sanitizeErrorCode = (error: unknown): string => {
  if (error instanceof Error) {
    const msg = error.message;
    if (ALLOWED_ERROR_CODES.has(msg)) return msg;
    if (msg.includes("timeout") || msg.includes("ETIMEDOUT") || msg.includes("AbortError") || msg.includes("aborted"))
      return "provider_timeout";
    if (msg.includes("fetch") || msg.includes("network") || msg.includes("ECONNREFUSED"))
      return "provider_api_error";
  }
  return "unknown_error";
};

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

export interface CanonicalBoundary {
  boundary: Date;
  slot: "am" | "pm";
  dateStr: string;
}

export const computeCanonicalBoundary = (now: Date): CanonicalBoundary => {
  const hour = now.getUTCHours();
  const dateStr = now.toISOString().slice(0, 10);

  if (hour >= 21) {
    return { boundary: new Date(`${dateStr}T21:00:00Z`), slot: "pm", dateStr };
  }
  if (hour >= 9) {
    return { boundary: new Date(`${dateStr}T09:00:00Z`), slot: "am", dateStr };
  }
  const prevDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const prevDateStr = prevDay.toISOString().slice(0, 10);
  return { boundary: new Date(`${prevDateStr}T21:00:00Z`), slot: "pm", dateStr: prevDateStr };
};

export const computeRunKey = (
  provider: ReconciliationProviderName,
  now: Date,
): string => {
  const { dateStr, slot } = computeCanonicalBoundary(now);
  return `reconciliation:${provider}:${dateStr}:${slot}`;
};

export const computeTimeWindow = (now: Date): ReconciliationTimeWindow => {
  const { boundary, slot, dateStr } = computeCanonicalBoundary(now);

  if (slot === "am") {
    const prevDay = new Date(boundary.getTime() - 24 * 60 * 60 * 1000);
    const since = new Date(`${prevDay.toISOString().slice(0, 10)}T21:00:00Z`);
    const until = new Date(boundary.getTime() + INGESTION_OVERLAP_MS);
    return { since, until };
  }

  const since = new Date(`${dateStr}T09:00:00Z`);
  const until = new Date(boundary.getTime() + INGESTION_OVERLAP_MS);
  return { since, until };
};

export const deduplicateAndValidateIds = (ids: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const id of ids) {
    const trimmed = id?.trim();
    if (trimmed && trimmed.length > 0 && trimmed.length <= 500 && !seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  }
  return result;
};

export interface IReconciliationService {
  acquireRunLock(
    db: DrizzleDatabase,
    runKey: string,
    provider: ReconciliationProviderName,
  ): Promise<{ runId: string; leaseToken: string } | null>;
  recoverStaleRuns(db: DrizzleDatabase): Promise<number>;
  refreshLease(
    db: DrizzleDatabase,
    runId: string,
    leaseToken: string,
  ): Promise<boolean>;
  getStoredLeadIds(
    db: DrizzleDatabase,
    provider: ReconciliationProviderName,
    window: ReconciliationTimeWindow,
  ): Promise<string[]>;
  finalizeRun(
    db: DrizzleDatabase,
    runId: string,
    leaseToken: string,
    provider: ReconciliationProviderName,
    counts: {
      totalExternal: number;
      totalStored: number;
      missingInStored: number;
      missingInExternal: number;
    },
    discrepancies: Array<{ externalId: string; discrepancyType: string }>,
  ): Promise<boolean>;
  failRun(
    db: DrizzleDatabase,
    runId: string,
    leaseToken: string,
    errorCode: string,
  ): Promise<boolean>;
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
  ): Promise<{ runId: string; leaseToken: string } | null> {
    const leaseToken = randomUUID();
    const leaseExpiresAt = new Date(Date.now() + RECONCILIATION_LEASE_DURATION_MS);

    const inserted = await db.execute(dsql`
      INSERT INTO reconciliation_runs (run_key, provider, status, lease_token, lease_expires_at)
      VALUES (${runKey}, ${provider}, 'running', ${leaseToken}, ${leaseExpiresAt})
      ON CONFLICT (run_key) DO NOTHING
      RETURNING id
    `);
    const insertedRows = inserted.rows as Array<{ id: string }>;
    if (insertedRows.length > 0) {
      return { runId: insertedRows[0].id, leaseToken };
    }

    const retried = await db.execute(dsql`
      UPDATE reconciliation_runs
      SET
        status = 'running',
        started_at = NOW(),
        error_code = NULL,
        completed_at = NULL,
        lease_token = ${leaseToken},
        lease_expires_at = ${leaseExpiresAt}
      WHERE run_key = ${runKey}
        AND status = 'failed'
      RETURNING id
    `);
    const retriedRows = retried.rows as Array<{ id: string }>;
    if (retriedRows.length > 0) {
      return { runId: retriedRows[0].id, leaseToken };
    }

    return null;
  }

  async recoverStaleRuns(db: DrizzleDatabase): Promise<number> {
    const now = new Date();

    const recovered = await db
      .update(reconciliationRuns)
      .set({
        status: "failed",
        errorCode: "stale_run_recovered",
        completedAt: now,
        leaseToken: null,
        leaseExpiresAt: null,
      })
      .where(
        and(
          eq(reconciliationRuns.status, "running"),
          or(
            lt(reconciliationRuns.leaseExpiresAt, now),
            isNull(reconciliationRuns.leaseExpiresAt),
          ),
        ),
      )
      .returning();

    return recovered.length;
  }

  async refreshLease(
    db: DrizzleDatabase,
    runId: string,
    leaseToken: string,
  ): Promise<boolean> {
    const newExpiry = new Date(Date.now() + RECONCILIATION_LEASE_DURATION_MS);

    const result = await db.execute(dsql`
      UPDATE reconciliation_runs
      SET lease_expires_at = ${newExpiry}
      WHERE id = ${runId}
        AND lease_token = ${leaseToken}
        AND status = 'running'
      RETURNING id
    `);

    return (result.rows as Array<{ id: string }>).length > 0;
  }

  async getStoredLeadIds(
    db: DrizzleDatabase,
    provider: ReconciliationProviderName,
    window: ReconciliationTimeWindow,
  ): Promise<string[]> {
    if (provider === "google_ads") {
      const rows = await db
        .select({ id: contacts.googleAdsLeadId })
        .from(contacts)
        .where(
          and(
            isNotNull(contacts.googleAdsLeadId),
            gte(contacts.createdAt, window.since),
            lt(contacts.createdAt, window.until),
          ),
        );
      return rows
        .map((r) => r.id)
        .filter((id): id is string => id !== null);
    }

    const rows = await db
      .select({ id: contacts.submissionId })
      .from(contacts)
      .where(
        and(
          isNotNull(contacts.submissionId),
          gte(contacts.createdAt, window.since),
          lt(contacts.createdAt, window.until),
        ),
      );
    return rows
      .map((r) => r.id)
      .filter((id): id is string => id !== null);
  }

  async finalizeRun(
    db: DrizzleDatabase,
    runId: string,
    leaseToken: string,
    provider: ReconciliationProviderName,
    counts: {
      totalExternal: number;
      totalStored: number;
      missingInStored: number;
      missingInExternal: number;
    },
    discrepancies: Array<{ externalId: string; discrepancyType: string }>,
  ): Promise<boolean> {
    const now = new Date();
    const discrepanciesJson = JSON.stringify(discrepancies);

    const result = await db.execute(dsql`
      WITH finalized AS (
        UPDATE reconciliation_runs
        SET
          status = 'completed',
          total_external = ${counts.totalExternal},
          total_stored = ${counts.totalStored},
          missing_in_stored = ${counts.missingInStored},
          missing_in_external = ${counts.missingInExternal},
          completed_at = ${now},
          lease_token = NULL,
          lease_expires_at = NULL
        WHERE id = ${runId}
          AND lease_token = ${leaseToken}
          AND status = 'running'
        RETURNING id
      ),
      cleared AS (
        DELETE FROM reconciliation_discrepancies
        WHERE run_id = ${runId}
          AND EXISTS (SELECT 1 FROM finalized)
        RETURNING id
      ),
      inserted AS (
        INSERT INTO reconciliation_discrepancies (run_id, provider, external_id, discrepancy_type)
        SELECT
          ${runId},
          ${provider},
          item ->> 'externalId',
          item ->> 'discrepancyType'
        FROM finalized f
        CROSS JOIN LATERAL json_array_elements(${discrepanciesJson}::json) as item
        WHERE f.id = ${runId}
        ON CONFLICT (run_id, provider, external_id, discrepancy_type) DO NOTHING
        RETURNING id
      )
      SELECT COUNT(*) as cnt FROM finalized
    `);

    const rows = result.rows as Array<{ cnt: string }>;
    return rows.length > 0 && Number(rows[0].cnt) === 1;
  }

  async failRun(
    db: DrizzleDatabase,
    runId: string,
    leaseToken: string,
    errorCode: string,
  ): Promise<boolean> {
    const safeCode = ALLOWED_ERROR_CODES.has(errorCode) ? errorCode : "unknown_error";
    const now = new Date();

    const result = await db.execute(dsql`
      UPDATE reconciliation_runs
      SET
        status = 'failed',
        error_code = ${safeCode},
        completed_at = ${now},
        lease_token = NULL,
        lease_expires_at = NULL
      WHERE id = ${runId}
        AND lease_token = ${leaseToken}
        AND status = 'running'
      RETURNING id
    `);

    return (result.rows as Array<{ id: string }>).length > 0;
  }

  async runReconciliation(
    db: DrizzleDatabase,
    providerAdapter: IReconciliationProvider,
    now?: Date,
  ): Promise<ReconciliationOutcome> {
    const timestamp = now ?? new Date();
    const runKey = computeRunKey(providerAdapter.name, timestamp);
    const window = computeTimeWindow(timestamp);

    await this.recoverStaleRuns(db);

    const lock = await this.acquireRunLock(db, runKey, providerAdapter.name);
    if (!lock) {
      return { status: "skipped", runKey, reason: "lock_contention" };
    }

    const { runId, leaseToken } = lock;

    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      const externalIdsPromise = providerAdapter.fetchExternalLeadIds(window);
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          controller.abort();
          reject(new Error("provider_timeout"));
        }, PROVIDER_TIMEOUT_MS);
      });

      let rawExternalIds: string[];
      try {
        rawExternalIds = await Promise.race([externalIdsPromise, timeoutPromise]);
      } finally {
        if (timeoutId !== undefined) clearTimeout(timeoutId);
      }

      const externalIds = deduplicateAndValidateIds(rawExternalIds);
      const rawStoredIds = await this.getStoredLeadIds(db, providerAdapter.name, window);
      const storedIds = deduplicateAndValidateIds(rawStoredIds);

      const externalSet = new Set(externalIds);
      const storedSet = new Set(storedIds);

      const missingInStored = externalIds.filter((id) => !storedSet.has(id));
      const missingInExternal = storedIds.filter((id) => !externalSet.has(id));

      const discrepancies = [
        ...missingInStored.map((externalId) => ({
          externalId,
          discrepancyType: "missing_in_stored",
        })),
        ...missingInExternal.map((externalId) => ({
          externalId,
          discrepancyType: "missing_in_external",
        })),
      ];

      const counts = {
        totalExternal: externalIds.length,
        totalStored: storedIds.length,
        missingInStored: missingInStored.length,
        missingInExternal: missingInExternal.length,
      };

      await this.refreshLease(db, runId, leaseToken);

      const finalized = await this.finalizeRun(
        db,
        runId,
        leaseToken,
        providerAdapter.name,
        counts,
        discrepancies,
      );

      if (!finalized) {
        return { status: "failed", runKey, errorCode: "unknown_error" };
      }

      return { status: "completed", runKey, ...counts };
    } catch (error) {
      const errorCode = sanitizeErrorCode(error);
      await this.failRun(db, runId, leaseToken, errorCode);
      return { status: "failed", runKey, errorCode };
    }
  }
}

export const reconciliationService: IReconciliationService =
  new DatabaseReconciliationService();
