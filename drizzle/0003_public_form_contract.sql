ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "request_type" text DEFAULT 'contact' NOT NULL;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "preferred_date" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "preferred_time" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "formspree_status" text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'contacts_request_type_check'
      AND conrelid = 'contacts'::regclass
  ) THEN
    ALTER TABLE "contacts"
      ADD CONSTRAINT "contacts_request_type_check"
      CHECK ("request_type" IN ('contact', 'appointment')) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'contacts_formspree_status_check'
      AND conrelid = 'contacts'::regclass
  ) THEN
    ALTER TABLE "contacts"
      ADD CONSTRAINT "contacts_formspree_status_check"
      CHECK (
        "formspree_status" IS NULL
        OR "formspree_status" IN ('failed', 'sending', 'delivered')
      ) NOT VALID;
  END IF;
END $$;

-- Validation intentionally fails instead of rewriting unexpected production
-- values. Inspect and reconcile any invalid rows before rerunning this migration.
ALTER TABLE "contacts" VALIDATE CONSTRAINT "contacts_request_type_check";
ALTER TABLE "contacts" VALIDATE CONSTRAINT "contacts_formspree_status_check";
