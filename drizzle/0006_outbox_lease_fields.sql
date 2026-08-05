ALTER TABLE "notification_outbox" ADD COLUMN IF NOT EXISTS "lease_token" text;
ALTER TABLE "notification_outbox" ADD COLUMN IF NOT EXISTS "lease_expires_at" timestamp;
ALTER TABLE "notification_outbox" ADD COLUMN IF NOT EXISTS "next_attempt_at" timestamp;

CREATE INDEX IF NOT EXISTS "notification_outbox_next_attempt_idx"
  ON "notification_outbox" ("status", "next_attempt_at");
