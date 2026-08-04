CREATE TABLE IF NOT EXISTS "notification_outbox" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_key" text NOT NULL,
  "event_type" text NOT NULL DEFAULT 'new_lead',
  "contact_id" varchar NOT NULL REFERENCES "contacts"("id"),
  "status" text NOT NULL DEFAULT 'pending',
  "attempts" integer NOT NULL DEFAULT 0,
  "last_error" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "sent_at" timestamp
);

CREATE UNIQUE INDEX IF NOT EXISTS "notification_outbox_event_key_idx"
  ON "notification_outbox" ("event_key");

CREATE INDEX IF NOT EXISTS "notification_outbox_status_idx"
  ON "notification_outbox" ("status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'notification_outbox_status_check'
      AND conrelid = 'notification_outbox'::regclass
  ) THEN
    ALTER TABLE "notification_outbox"
      ADD CONSTRAINT "notification_outbox_status_check"
      CHECK ("status" IN ('pending', 'sending', 'sent', 'failed')) NOT VALID;
  END IF;
END $$;

ALTER TABLE "notification_outbox" VALIDATE CONSTRAINT "notification_outbox_status_check";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'notification_outbox_event_type_check'
      AND conrelid = 'notification_outbox'::regclass
  ) THEN
    ALTER TABLE "notification_outbox"
      ADD CONSTRAINT "notification_outbox_event_type_check"
      CHECK ("event_type" IN ('new_lead')) NOT VALID;
  END IF;
END $$;

ALTER TABLE "notification_outbox" VALIDATE CONSTRAINT "notification_outbox_event_type_check";
