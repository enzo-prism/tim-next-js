-- Dedicated operational call outcomes: no caller contact details or transcript.
CREATE TABLE IF NOT EXISTS call_outcomes (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  call_id text NOT NULL,
  occurred_at timestamptz NOT NULL,
  source_observed_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('new', 'contacted', 'booked', 'arrived', 'no-show', 'lost')),
  source text NOT NULL CHECK (source IN ('google-ads', 'meta', 'microsoft-ads', 'organic', 'direct', 'referral', 'other', 'unknown')),
  campaign text,
  linked_lead_id varchar REFERENCES contacts(id),
  booked_at timestamptz,
  arrived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT call_outcomes_identity UNIQUE(provider, call_id),
  CONSTRAINT call_outcomes_observation_order CHECK (occurred_at <= source_observed_at),
  CONSTRAINT call_outcomes_provider_format CHECK (provider ~ '^[a-z0-9_.-]{1,80}$'),
  CONSTRAINT call_outcomes_call_id_format CHECK (call_id ~ '^[A-Za-z0-9_-]{1,128}$'),
  CONSTRAINT call_outcomes_campaign_format CHECK (campaign IS NULL OR campaign ~ '^[a-z0-9_.-]{1,80}$')
);
CREATE INDEX IF NOT EXISTS call_outcomes_occurred_at_idx ON call_outcomes(occurred_at);
CREATE INDEX IF NOT EXISTS call_outcomes_linked_lead_idx ON call_outcomes(linked_lead_id);
