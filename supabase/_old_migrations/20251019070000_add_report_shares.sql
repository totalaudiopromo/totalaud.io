/**
 * Report Shares Migration
 *
 * Enables token-based sharing of campaign mixdown reports.
 * Users can generate shareable links with optional expiration.
 */

-- Create report_shares table
CREATE TABLE IF NOT EXISTS report_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES agent_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz,
  views_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_report_shares_token ON report_shares(token);

-- Index for session-based queries
CREATE INDEX IF NOT EXISTS idx_report_shares_session ON report_shares(session_id);

-- Index for user-based queries
CREATE INDEX IF NOT EXISTS idx_report_shares_user ON report_shares(user_id);

-- Row-Level Security Policies
ALTER TABLE report_shares ENABLE ROW LEVEL SECURITY;

-- Users can view their own report shares
CREATE POLICY "Users can view their own report shares"
  ON report_shares FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own report shares
CREATE POLICY "Users can create their own report shares"
  ON report_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own report shares (for view count)
CREATE POLICY "Users can update their own report shares"
  ON report_shares FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own report shares
CREATE POLICY "Users can delete their own report shares"
  ON report_shares FOR DELETE
  USING (auth.uid() = user_id);

-- Public can access reports by valid token (for shared viewing)
CREATE POLICY "Public can access reports by valid token"
  ON report_shares FOR SELECT
  USING (
    token IS NOT NULL
    AND (expires_at IS NULL OR expires_at > now())
  );

-- Enable realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE report_shares;

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_report_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER report_shares_updated_at
  BEFORE UPDATE ON report_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_report_shares_updated_at();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_report_view_count(share_token text)
RETURNS void AS $$
BEGIN
  UPDATE report_shares
  SET views_count = views_count + 1
  WHERE token = share_token
    AND (expires_at IS NULL OR expires_at > now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired tokens (runs daily via pg_cron or manual call)
CREATE OR REPLACE FUNCTION cleanup_expired_report_shares()
RETURNS void AS $$
BEGIN
  DELETE FROM report_shares
  WHERE expires_at IS NOT NULL
    AND expires_at < now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE report_shares IS 'Token-based sharing for campaign mixdown reports';
COMMENT ON COLUMN report_shares.token IS 'Unique shareable token (e.g., nanoid or uuid)';
COMMENT ON COLUMN report_shares.expires_at IS 'Optional expiration timestamp (NULL = never expires)';
COMMENT ON COLUMN report_shares.views_count IS 'Number of times report has been viewed';
