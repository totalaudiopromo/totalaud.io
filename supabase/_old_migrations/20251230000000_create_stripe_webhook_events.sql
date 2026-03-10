-- Stripe Webhook Events (Idempotency)
-- totalaud.io - December 2025
--
-- Tracks processed Stripe webhook events to prevent replay attacks
-- and duplicate processing of the same event.

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX idx_stripe_webhook_events_event_id ON stripe_webhook_events(event_id);

-- Index for cleanup queries (delete events older than X days)
CREATE INDEX idx_stripe_webhook_events_processed_at ON stripe_webhook_events(processed_at);

-- Comment for documentation
COMMENT ON TABLE stripe_webhook_events IS 'Tracks processed Stripe webhook events for idempotency and replay attack prevention';
COMMENT ON COLUMN stripe_webhook_events.event_id IS 'Stripe event ID (e.g., evt_xxx)';
COMMENT ON COLUMN stripe_webhook_events.event_type IS 'Event type (e.g., checkout.session.completed)';
COMMENT ON COLUMN stripe_webhook_events.processed_at IS 'When the event was processed by our webhook handler';

-- RLS: Only service role can access this table
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- No policies = service role only (webhook uses service role key)
