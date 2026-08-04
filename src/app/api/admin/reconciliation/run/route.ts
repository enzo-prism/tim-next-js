import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import {
  ALL_RECONCILIATION_PROVIDERS,
  getReconciliationProvider,
} from "@/server/reconciliation-providers";
import { reconciliationService } from "@/server/reconciliation-service";
import type { ReconciliationOutcome } from "@/server/reconciliation-service";

export const runtime = "nodejs";

const jsonResponse = (payload: unknown, init?: ResponseInit) => {
  const response = NextResponse.json(payload, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
};

const requireCronAuth = (req: NextRequest): NextResponse | null => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return jsonResponse(
      { ok: false, error: "cron_not_configured", message: "Cron secret is not configured." },
      { status: 503 },
    );
  }

  const authHeader = req.headers.get("authorization") || "";
  const provided = Buffer.from(authHeader, "utf-8");
  const expected = Buffer.from(`Bearer ${cronSecret}`, "utf-8");

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return jsonResponse(
      { ok: false, error: "unauthorized", message: "Invalid cron authorization." },
      { status: 401 },
    );
  }

  return null;
};

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
      missingInExternal: outcome.missingInExternal,
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
    return jsonResponse({
      ok: true,
      disabled: true,
      message: "Reconciliation is disabled.",
      results: [],
    });
  }

  if (!db) {
    return jsonResponse(
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
    return jsonResponse(
      { ok: false, disabled: false, results },
      { status: 502 },
    );
  }

  return jsonResponse({ ok: true, disabled: false, results });
}
