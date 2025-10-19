/**
 * User Integrations System
 *
 * Stores OAuth credentials and connection status for external service integrations.
 * Based on tracker.totalaudiopromo.com integrations system.
 */

-- Integration Connections Table
CREATE TABLE IF NOT EXISTS integration_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User association
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Provider info
  provider text NOT NULL CHECK (provider IN ('gmail', 'google_sheets', 'airtable', 'mailchimp', 'spotify')),
  provider_user_id text, -- Email or external user ID

  -- OAuth credentials (encrypted at rest by Supabase)
  access_token text NOT NULL,
  refresh_token text,
  token_type text DEFAULT 'Bearer',
  expires_at timestamptz,

  -- Connection metadata
  scopes text[], -- OAuth scopes granted
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Status tracking
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'error')),
  last_sync_at timestamptz,
  last_error text,

  -- Auto-sync settings
  auto_sync_enabled boolean DEFAULT true,
  sync_frequency_minutes integer DEFAULT 15,

  -- Timestamps
  connected_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_integration_connections_user_id
  ON integration_connections(user_id);

CREATE INDEX IF NOT EXISTS idx_integration_connections_provider
  ON integration_connections(provider);

CREATE INDEX IF NOT EXISTS idx_integration_connections_status
  ON integration_connections(status);

CREATE INDEX IF NOT EXISTS idx_integration_connections_user_provider
  ON integration_connections(user_id, provider);

-- Unique constraint: one connection per user per provider
CREATE UNIQUE INDEX IF NOT EXISTS idx_integration_connections_unique
  ON integration_connections(user_id, provider);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_integration_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_integration_connections_updated_at
  BEFORE UPDATE ON integration_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_connections_updated_at();

-- Integration Sync Logs Table (audit trail)
CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key
  connection_id uuid NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,

  -- Sync details
  sync_type text NOT NULL CHECK (sync_type IN ('manual', 'auto', 'scheduled')),
  direction text CHECK (direction IN ('to_service', 'from_service', 'bidirectional')),

  -- Results
  status text NOT NULL CHECK (status IN ('started', 'success', 'partial', 'failed')),
  items_synced integer DEFAULT 0,
  items_failed integer DEFAULT 0,
  error_message text,
  error_details jsonb,

  -- Timing
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  duration_ms integer,

  -- Additional context
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_connection_id
  ON integration_sync_logs(connection_id);

CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_status
  ON integration_sync_logs(status);

CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_started_at
  ON integration_sync_logs(started_at DESC);

-- Gmail Tracked Emails Table (specific to Gmail integration)
CREATE TABLE IF NOT EXISTS gmail_tracked_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key
  connection_id uuid NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
  session_id uuid REFERENCES agent_sessions(id) ON DELETE SET NULL,

  -- Gmail identifiers
  gmail_message_id text NOT NULL,
  gmail_thread_id text NOT NULL,

  -- Email metadata
  subject text,
  recipient_email text,
  sent_at timestamptz NOT NULL,

  -- Reply tracking
  has_reply boolean DEFAULT false,
  reply_snippet text,
  replied_at timestamptz,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gmail_tracked_emails_connection_id
  ON gmail_tracked_emails(connection_id);

CREATE INDEX IF NOT EXISTS idx_gmail_tracked_emails_session_id
  ON gmail_tracked_emails(session_id);

CREATE INDEX IF NOT EXISTS idx_gmail_tracked_emails_gmail_thread_id
  ON gmail_tracked_emails(gmail_thread_id);

CREATE INDEX IF NOT EXISTS idx_gmail_tracked_emails_has_reply
  ON gmail_tracked_emails(has_reply);

-- Unique constraint: one tracked email per message ID
CREATE UNIQUE INDEX IF NOT EXISTS idx_gmail_tracked_emails_unique
  ON gmail_tracked_emails(connection_id, gmail_message_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_gmail_tracked_emails_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_gmail_tracked_emails_updated_at
  BEFORE UPDATE ON gmail_tracked_emails
  FOR EACH ROW
  EXECUTE FUNCTION update_gmail_tracked_emails_updated_at();

-- Row Level Security (RLS)
ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmail_tracked_emails ENABLE ROW LEVEL SECURITY;

-- Policies: integration_connections
CREATE POLICY "Users can view own integration connections"
  ON integration_connections
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own integration connections"
  ON integration_connections
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own integration connections"
  ON integration_connections
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own integration connections"
  ON integration_connections
  FOR DELETE
  USING (user_id = auth.uid());

-- Policies: integration_sync_logs
CREATE POLICY "Users can view own integration sync logs"
  ON integration_sync_logs
  FOR SELECT
  USING (
    connection_id IN (
      SELECT id FROM integration_connections
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert integration sync logs"
  ON integration_sync_logs
  FOR INSERT
  WITH CHECK (true);

-- Policies: gmail_tracked_emails
CREATE POLICY "Users can view own gmail tracked emails"
  ON gmail_tracked_emails
  FOR SELECT
  USING (
    connection_id IN (
      SELECT id FROM integration_connections
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert gmail tracked emails"
  ON gmail_tracked_emails
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update gmail tracked emails"
  ON gmail_tracked_emails
  FOR UPDATE
  WITH CHECK (true);

-- Enable Realtime for integration_connections (for UI updates)
ALTER PUBLICATION supabase_realtime ADD TABLE integration_connections;
ALTER PUBLICATION supabase_realtime ADD TABLE integration_sync_logs;

-- OAuth State Tokens Table (for CSRF protection)
CREATE TABLE IF NOT EXISTS oauth_state_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- State token (PKCE)
  state text NOT NULL UNIQUE,
  code_verifier text,

  -- Provider info
  provider text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Expiry
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),

  -- Timestamps
  created_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_oauth_state_tokens_state
  ON oauth_state_tokens(state);

CREATE INDEX IF NOT EXISTS idx_oauth_state_tokens_expires_at
  ON oauth_state_tokens(expires_at);

-- Cleanup expired tokens (run via cron or manually)
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM oauth_state_tokens
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE integration_connections IS 'Stores OAuth credentials and connection status for external service integrations (Gmail, Sheets, Airtable, Mailchimp, Spotify)';
COMMENT ON TABLE integration_sync_logs IS 'Audit trail of all integration sync operations with timing and error tracking';
COMMENT ON TABLE gmail_tracked_emails IS 'Tracks sent emails via Gmail API for automatic reply detection';
COMMENT ON TABLE oauth_state_tokens IS 'Temporary storage for OAuth state tokens to prevent CSRF attacks';
