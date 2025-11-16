-- Phase 9: DAW OS Agent Behaviour Engine
-- Agent Events and Outputs Tables

-- =====================================================
-- Table: agent_events
-- Purpose: Log all agent execution events
-- =====================================================

CREATE TABLE IF NOT EXISTS agent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL CHECK (agent_name IN ('scout', 'coach', 'tracker', 'insight')),
  clip_id UUID,
  campaign_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'clip_activated',
      'clip_completed',
      'clip_rejected',
      'timeline_updated',
      'card_created',
      'agent_error',
      'agent_output',
      'agent_needs_input',
      'agent_started',
      'agent_stopped',
      'playhead_moved'
    )
  ),
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_agent_events_user_id ON agent_events(user_id);
CREATE INDEX idx_agent_events_campaign_id ON agent_events(campaign_id);
CREATE INDEX idx_agent_events_clip_id ON agent_events(clip_id);
CREATE INDEX idx_agent_events_agent_name ON agent_events(agent_name);
CREATE INDEX idx_agent_events_event_type ON agent_events(event_type);
CREATE INDEX idx_agent_events_created_at ON agent_events(created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_agent_events_campaign_agent ON agent_events(campaign_id, agent_name, created_at DESC);

-- =====================================================
-- Table: agent_outputs
-- Purpose: Store agent execution results
-- =====================================================

CREATE TABLE IF NOT EXISTS agent_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL CHECK (agent_name IN ('scout', 'coach', 'tracker', 'insight')),
  clip_id UUID NOT NULL,
  campaign_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  behaviour_type TEXT CHECK (
    behaviour_type IN ('research', 'planning', 'followup', 'analysis', 'story', 'custom')
  ),
  success BOOLEAN NOT NULL DEFAULT true,
  message TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  output JSONB DEFAULT '{}'::jsonb,
  errors JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_agent_outputs_user_id ON agent_outputs(user_id);
CREATE INDEX idx_agent_outputs_campaign_id ON agent_outputs(campaign_id);
CREATE INDEX idx_agent_outputs_clip_id ON agent_outputs(clip_id);
CREATE INDEX idx_agent_outputs_agent_name ON agent_outputs(agent_name);
CREATE INDEX idx_agent_outputs_behaviour_type ON agent_outputs(behaviour_type);
CREATE INDEX idx_agent_outputs_created_at ON agent_outputs(created_at DESC);
CREATE INDEX idx_agent_outputs_success ON agent_outputs(success);

-- Composite index for common queries
CREATE INDEX idx_agent_outputs_campaign_agent ON agent_outputs(campaign_id, agent_name, created_at DESC);

-- GIN index for JSONB payload/output searches
CREATE INDEX idx_agent_outputs_payload ON agent_outputs USING GIN (payload);
CREATE INDEX idx_agent_outputs_output ON agent_outputs USING GIN (output);

-- =====================================================
-- Table: analogue_cards
-- Purpose: Store emotional story cards (Analogue OS)
-- =====================================================

CREATE TABLE IF NOT EXISTS analogue_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sentiment TEXT NOT NULL CHECK (
    sentiment IN ('excited', 'worried', 'blocked', 'breakthrough', 'reflective')
  ),
  content TEXT NOT NULL,
  linked_clip_ids UUID[] DEFAULT ARRAY[]::UUID[],
  colour TEXT,
  position_x REAL,
  position_y REAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_analogue_cards_user_id ON analogue_cards(user_id);
CREATE INDEX idx_analogue_cards_campaign_id ON analogue_cards(campaign_id);
CREATE INDEX idx_analogue_cards_sentiment ON analogue_cards(sentiment);
CREATE INDEX idx_analogue_cards_created_at ON analogue_cards(created_at DESC);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE agent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analogue_cards ENABLE ROW LEVEL SECURITY;

-- agent_events policies
CREATE POLICY "Users can view their own agent events"
  ON agent_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent events"
  ON agent_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all agent events"
  ON agent_events FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- agent_outputs policies
CREATE POLICY "Users can view their own agent outputs"
  ON agent_outputs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent outputs"
  ON agent_outputs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent outputs"
  ON agent_outputs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all agent outputs"
  ON agent_outputs FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- analogue_cards policies
CREATE POLICY "Users can view their own analogue cards"
  ON analogue_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analogue cards"
  ON analogue_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analogue cards"
  ON analogue_cards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analogue cards"
  ON analogue_cards FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all analogue cards"
  ON analogue_cards FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for agent_outputs
CREATE TRIGGER agent_outputs_updated_at
  BEFORE UPDATE ON agent_outputs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger for analogue_cards
CREATE TRIGGER analogue_cards_updated_at
  BEFORE UPDATE ON analogue_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- Views for common queries
-- =====================================================

-- View: Agent execution summary by campaign
CREATE OR REPLACE VIEW agent_campaign_summary AS
SELECT
  campaign_id,
  agent_name,
  COUNT(*) as total_executions,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_executions,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed_executions,
  AVG(duration_ms) as avg_duration_ms,
  MAX(created_at) as last_execution
FROM agent_outputs
GROUP BY campaign_id, agent_name;

-- View: Recent agent activity
CREATE OR REPLACE VIEW recent_agent_activity AS
SELECT
  ae.id,
  ae.agent_name,
  ae.event_type,
  ae.campaign_id,
  ae.clip_id,
  ae.payload,
  ae.created_at
FROM agent_events ae
ORDER BY ae.created_at DESC
LIMIT 100;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE agent_events IS 'Phase 9: Logs all agent execution events for auditing and debugging';
COMMENT ON TABLE agent_outputs IS 'Phase 9: Stores agent execution results with full context and outputs';
COMMENT ON TABLE analogue_cards IS 'Phase 9: Emotional story cards for Analogue OS theme';
COMMENT ON VIEW agent_campaign_summary IS 'Phase 9: Summary of agent executions per campaign';
COMMENT ON VIEW recent_agent_activity IS 'Phase 9: Recent agent activity feed';

-- =====================================================
-- Grant permissions
-- =====================================================

-- Grant authenticated users access to their own data
GRANT SELECT, INSERT ON agent_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON agent_outputs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON analogue_cards TO authenticated;

-- Grant service role full access
GRANT ALL ON agent_events TO service_role;
GRANT ALL ON agent_outputs TO service_role;
GRANT ALL ON analogue_cards TO service_role;

-- Grant access to views
GRANT SELECT ON agent_campaign_summary TO authenticated;
GRANT SELECT ON recent_agent_activity TO authenticated;
