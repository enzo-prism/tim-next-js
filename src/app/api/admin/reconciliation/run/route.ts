import { NextRequest } from "next/server";
import { db } from "@/server/db";
import {
  ALL_RECONCILIATION_PROVIDERS,
  getReconciliationProvider,
} from "@/server/reconciliation-providers";
import { reconciliationService } from "@/server/reconciliation-service";
import type { ReconciliationOutcome } from "@/server/reconciliation-service";
import { cronJsonResponse, requireCronAuth } from "@/server/cron-auth";

export const runtime = "nodejs";

const isReconciliationEnabled = (): boolean =>
  process.env.RECONCILIATION_ENABLED === "true";

const redactOutcome = (outcome: ReconciliationOutcome) => {
  if (outcome.status === "completed") {
    return {
      status: outcome.status,
      runKey: outcome.runKey,
      totalExternal: outcome.totalExternal,
      totalStored: outcome.totalStored,
      missingInStored: outcome.missingInStored,
      inserted: outcome.inserted,
    };
  }
  if (outcome.status === "failed") {
    return {
      status: outcome.status,
      runKey: outcome.runKey,
      errorCode: outcome.errorCode,
    };
  }
  return {
    status: outcome.status,
    runKey: outcome.runKey,
    reason: outcome.reason,
  };
};

export async function GET(req: NextRequest) {
  const authResponse = requireCronAuth(req);
  if (authResponse) return authResponse;

  if (!isReconciliationEnabled()) {
    return cronJsonResponse({
      ok: true,
      disabled: true,
      message: "Reconciliation is disabled.",
      results: [],
    });
  }

  if (!db) {
    return cronJsonResponse(
      { ok: false, error: "database_unavailable", message: "Database is not configured." },
      { status: 503 },
    );
  }

  const database = db;

  const results = await Promise.all(
    ALL_RECONCILIATION_PROVIDERS.map(async (providerName) => {
      const provider = getReconciliationProvider(providerName);
      const outcome = await reconciliationService.runReconciliation(database, provider);
      return redactOutcome(outcome);
    }),
  );

  const anyFailed = results.some((r) => r.status === "failed");

  if (anyFailed) {
    return cronJsonResponse(
      { ok: false, disabled: false, results },
      { status: 502 },
    );
  }

  return cronJsonResponse({ ok: true, disabled: false, results });
}
