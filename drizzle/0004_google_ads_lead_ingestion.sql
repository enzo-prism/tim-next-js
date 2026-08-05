ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "google_ads_lead_id" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "campaign_id" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "campaign_name" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "ingested_via" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "updated_by" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "is_test" boolean DEFAULT false NOT NULL;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "raw_payload" jsonb;

ALTER TABLE "contacts" ALTER COLUMN "email" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "contacts_google_ads_lead_id_idx"
  ON "contacts" ("google_ads_lead_id")
  WHERE "google_ads_lead_id" IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'contacts_ingested_via_check'
      AND conrelid = 'contacts'::regclass
  ) THEN
    ALTER TABLE "contacts"
      ADD CONSTRAINT "contacts_ingested_via_check"
      CHECK (
        "ingested_via" IS NULL
        OR "ingested_via" IN ('webhook', 'reconciliation', 'website-form', 'backfill')
      ) NOT VALID;
  END IF;
END $$;

ALTER TABLE "contacts" VALIDATE CONSTRAINT "contacts_ingested_via_check";

ALTER TABLE "contacts" DROP CONSTRAINT IF EXISTS "contacts_request_type_check";
ALTER TABLE "contacts"
  ADD CONSTRAINT "contacts_request_type_check"
  CHECK ("request_type" IN ('contact', 'appointment', 'google_ads_lead'));
