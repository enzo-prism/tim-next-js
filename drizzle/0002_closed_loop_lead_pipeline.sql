ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "lead_status" text DEFAULT 'new' NOT NULL;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "contacted_at" timestamp;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "booked_at" timestamp;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "arrived_at" timestamp;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "lost_reason" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "staff_notes" text;

UPDATE "contacts"
SET "lead_status" = 'new'
WHERE "lead_status" IS NULL
   OR "lead_status" NOT IN ('new', 'contacted', 'booked', 'arrived', 'no-show', 'lost');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'contacts_lead_status_check'
      AND conrelid = 'contacts'::regclass
  ) THEN
    ALTER TABLE "contacts"
      ADD CONSTRAINT "contacts_lead_status_check"
      CHECK ("lead_status" IN ('new', 'contacted', 'booked', 'arrived', 'no-show', 'lost'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "contacts_lead_status_idx"
  ON "contacts" ("lead_status");

CREATE INDEX IF NOT EXISTS "contacts_created_at_idx"
  ON "contacts" ("created_at" DESC);
