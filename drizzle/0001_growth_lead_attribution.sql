ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "submission_id" varchar(36);
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "landing_page" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "referrer" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "cta_source" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "utm_source" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "utm_medium" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "utm_campaign" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "utm_term" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "utm_content" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "gclid" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "gbraid" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "wbraid" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "consent_to_contact" boolean DEFAULT false NOT NULL;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "consent_version" text;
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "contacts_submission_id_unique"
  ON "contacts" ("submission_id")
  WHERE "submission_id" IS NOT NULL;
