CREATE TABLE IF NOT EXISTS "reconciliation_runs" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "run_key" text NOT NULL,
  "provider" text NOT NULL,
  "status" text NOT NULL DEFAULT 'running',
  "total_external" integer,
  "total_stored" integer,
  "missing_in_stored" integer,
  "missing_in_external" integer,
  "error_code" text,
  "started_at" timestamp NOT NULL DEFAULT now(),
  "completed_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "reconciliation_runs_run_key_idx"
  ON "reconciliation_runs" ("run_key");

CREATE INDEX IF NOT EXISTS "reconciliation_runs_status_idx"
  ON "reconciliation_runs" ("status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reconciliation_runs_status_check'
      AND conrelid = 'reconciliation_runs'::regclass
  ) THEN
    ALTER TABLE "reconciliation_runs"
      ADD CONSTRAINT "reconciliation_runs_status_check"
      CHECK ("status" IN ('running', 'completed', 'failed')) NOT VALID;
  END IF;
END $$;

ALTER TABLE "reconciliation_runs" VALIDATE CONSTRAINT "reconciliation_runs_status_check";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reconciliation_runs_provider_check'
      AND conrelid = 'reconciliation_runs'::regclass
  ) THEN
    ALTER TABLE "reconciliation_runs"
      ADD CONSTRAINT "reconciliation_runs_provider_check"
      CHECK ("provider" IN ('google_ads', 'formspree')) NOT VALID;
  END IF;
END $$;

ALTER TABLE "reconciliation_runs" VALIDATE CONSTRAINT "reconciliation_runs_provider_check";

CREATE TABLE IF NOT EXISTS "reconciliation_discrepancies" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "run_id" varchar NOT NULL REFERENCES "reconciliation_runs"("id"),
  "provider" text NOT NULL,
  "external_id" text NOT NULL,
  "discrepancy_type" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "reconciliation_discrepancies_run_id_idx"
  ON "reconciliation_discrepancies" ("run_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reconciliation_discrepancies_type_check'
      AND conrelid = 'reconciliation_discrepancies'::regclass
  ) THEN
    ALTER TABLE "reconciliation_discrepancies"
      ADD CONSTRAINT "reconciliation_discrepancies_type_check"
      CHECK ("discrepancy_type" IN ('missing_in_stored', 'missing_in_external')) NOT VALID;
  END IF;
END $$;

ALTER TABLE "reconciliation_discrepancies" VALIDATE CONSTRAINT "reconciliation_discrepancies_type_check";
