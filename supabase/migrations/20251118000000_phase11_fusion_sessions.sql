-- Phase 11: Multi-OS Fusion Mode & Cross-Reality System
-- Tables for fusion sessions and cross-OS collaboration

-- ============================================================================
-- FUSION SESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS fusion_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  focus_type TEXT NOT NULL CHECK (focus_type IN ('clip', 'card', 'campaign')),
  focus_id UUID NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  os_contributors TEXT[] NOT NULL DEFAULT ARRAY['ascii', 'xp', 'aqua', 'daw', 'analogue']::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_os_contributors CHECK (
    os_contributors <@ ARRAY['ascii', 'xp', 'aqua', 'daw', 'analogue']::TEXT[]
  )
);

-- Indexes
CREATE INDEX idx_fusion_sessions_user_id ON fusion_sessions(user_id);
CREATE INDEX idx_fusion_sessions_focus ON fusion_sessions(focus_type, focus_id);
CREATE INDEX idx_fusion_sessions_active ON fusion_sessions(active) WHERE active = TRUE;
CREATE INDEX idx_fusion_sessions_created_at ON fusion_sessions(created_at DESC);

-- RLS Policies
ALTER TABLE fusion_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fusion sessions"
  ON fusion_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fusion sessions"
  ON fusion_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fusion sessions"
  ON fusion_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fusion sessions"
  ON fusion_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUSION MESSAGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS fusion_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES fusion_sessions(id) ON DELETE CASCADE,
  os TEXT NOT NULL CHECK (os IN ('ascii', 'xp', 'aqua', 'daw', 'analogue')),
  agent TEXT NOT NULL CHECK (agent IN ('scout', 'coach', 'tracker', 'insight')),
  role TEXT NOT NULL CHECK (role IN ('system', 'agent', 'summary')),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Content validation
  CONSTRAINT valid_content CHECK (
    jsonb_typeof(content) = 'object' AND
    content ? 'message'
  )
);

-- Indexes
CREATE INDEX idx_fusion_messages_session_id ON fusion_messages(session_id);
CREATE INDEX idx_fusion_messages_os ON fusion_messages(os);
CREATE INDEX idx_fusion_messages_agent ON fusion_messages(agent);
CREATE INDEX idx_fusion_messages_role ON fusion_messages(role);
CREATE INDEX idx_fusion_messages_created_at ON fusion_messages(created_at DESC);

-- Compound index for session + OS queries
CREATE INDEX idx_fusion_messages_session_os ON fusion_messages(session_id, os, created_at DESC);

-- RLS Policies
ALTER TABLE fusion_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view fusion messages from their sessions"
  ON fusion_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM fusion_sessions
      WHERE fusion_sessions.id = fusion_messages.session_id
      AND fusion_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create fusion messages in their sessions"
  ON fusion_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fusion_sessions
      WHERE fusion_sessions.id = fusion_messages.session_id
      AND fusion_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update fusion messages in their sessions"
  ON fusion_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM fusion_sessions
      WHERE fusion_sessions.id = fusion_messages.session_id
      AND fusion_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete fusion messages from their sessions"
  ON fusion_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM fusion_sessions
      WHERE fusion_sessions.id = fusion_messages.session_id
      AND fusion_sessions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to close a fusion session
CREATE OR REPLACE FUNCTION close_fusion_session(p_session_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE fusion_sessions
  SET
    active = FALSE,
    closed_at = NOW()
  WHERE id = p_session_id
  AND user_id = auth.uid();
END;
$$;

-- Function to get active fusion session for user
CREATE OR REPLACE FUNCTION get_active_fusion_session(p_user_id UUID)
RETURNS SETOF fusion_sessions
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM fusion_sessions
  WHERE user_id = p_user_id
  AND active = TRUE
  ORDER BY created_at DESC
  LIMIT 1;
$$;

-- Function to count messages per OS in a session
CREATE OR REPLACE FUNCTION count_fusion_messages_by_os(p_session_id UUID)
RETURNS TABLE(os TEXT, message_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    os,
    COUNT(*) as message_count
  FROM fusion_messages
  WHERE session_id = p_session_id
  GROUP BY os
  ORDER BY os;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE fusion_sessions IS 'Multi-OS collaboration sessions where all 5 OS personalities work together';
COMMENT ON TABLE fusion_messages IS 'Messages generated by agents in each OS during fusion sessions';
COMMENT ON COLUMN fusion_sessions.focus_type IS 'Type of object being analysed: clip, card, or campaign';
COMMENT ON COLUMN fusion_sessions.focus_id IS 'UUID of the clip, card, or campaign being analysed';
COMMENT ON COLUMN fusion_sessions.os_contributors IS 'Array of OS personalities participating (usually all 5)';
COMMENT ON COLUMN fusion_messages.role IS 'Message role: system (context), agent (contribution), summary (synthesis)';
COMMENT ON COLUMN fusion_messages.content IS 'JSONB containing message text, recommendations, and metadata';
