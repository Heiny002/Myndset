-- Webhook Events Table for Idempotency and Logging
-- Migration 003: Create stripe_webhook_events table

-- Create stripe_webhook_events table
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  created TIMESTAMPTZ NOT NULL,
  data JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'processed',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON stripe_webhook_events(type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created ON stripe_webhook_events(created DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON stripe_webhook_events(status);

-- Enable RLS (only admins should access webhook logs)
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Admins can view webhook events"
  ON stripe_webhook_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Comment
COMMENT ON TABLE stripe_webhook_events IS 'Stores Stripe webhook events for idempotency and debugging';
