ALTER TABLE "reconciliation_runs"
  ADD COLUMN IF NOT EXISTS "lease_token" text,
  ADD COLUMN IF NOT EXISTS "lease_expires_at" timestamp;

CREATE UNIQUE INDEX IF NOT EXISTS "reconciliation_discrepancies_unique_idx"
  ON "reconciliation_discrepancies" ("run_id", "provider", "external_id", "discrepancy_type");
