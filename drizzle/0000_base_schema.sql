CREATE TABLE IF NOT EXISTS "users" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" text NOT NULL UNIQUE,
  "password" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "contacts" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "submission_id" varchar(36),
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "service" text,
  "message" text,
  "request_type" text DEFAULT 'contact' NOT NULL,
  "preferred_date" text,
  "preferred_time" text,
  "formspree_status" text,
  "landing_page" text,
  "referrer" text,
  "cta_source" text,
  "utm_source" text,
  "utm_medium" text,
  "utm_campaign" text,
  "utm_term" text,
  "utm_content" text,
  "gclid" text,
  "gbraid" text,
  "wbraid" text,
  "consent_to_contact" boolean DEFAULT false NOT NULL,
  "consent_version" text,
  "lead_status" text DEFAULT 'new' NOT NULL,
  "contacted_at" timestamp,
  "booked_at" timestamp,
  "arrived_at" timestamp,
  "lost_reason" text,
  "staff_notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "contacts_request_type_check"
    CHECK ("request_type" IN ('contact', 'appointment')),
  CONSTRAINT "contacts_formspree_status_check"
    CHECK ("formspree_status" IS NULL OR "formspree_status" IN ('failed', 'sending', 'delivered')),
  CONSTRAINT "contacts_lead_status_check"
    CHECK ("lead_status" IN ('new', 'contacted', 'booked', 'arrived', 'no-show', 'lost'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "contacts_submission_id_unique"
  ON "contacts" ("submission_id")
  WHERE "submission_id" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "contacts_lead_status_idx"
  ON "contacts" ("lead_status");

CREATE INDEX IF NOT EXISTS "contacts_created_at_idx"
  ON "contacts" ("created_at" DESC);
