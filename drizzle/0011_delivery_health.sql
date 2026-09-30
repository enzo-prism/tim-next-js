-- No patient data: scheduler heartbeats and durable deduplication of health alerts.
CREATE TABLE IF NOT EXISTS lead_delivery_worker_state (
  worker text PRIMARY KEY,
  last_started_at timestamptz NOT NULL DEFAULT NOW(),
  last_completed_at timestamptz,
  last_success_at timestamptz,
  status text NOT NULL CHECK (status IN ('running', 'healthy', 'failed')),
  error_code text,
  run_token text NOT NULL
);
CREATE TABLE IF NOT EXISTS lead_delivery_alert_state (
  monitor text PRIMARY KEY,
  sent_fingerprint text NOT NULL DEFAULT 'healthy',
  last_sent_at timestamptz,
  pending_fingerprint text,
  event_key text,
  lease_token text,
  lease_expires_at timestamptz
);
