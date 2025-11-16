-- Agent System Tables Migration
-- Creates tables for agent events and outputs

-- Agent Events table
CREATE TABLE IF NOT EXISTS agent_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clip_id UUID REFERENCES timeline_clips(id) ON DELETE SET NULL,

  agent_name TEXT NOT NULL CHECK (agent_name IN ('scout', 'coach', 'tracker', 'insight')),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'clip_activated',
    'clip_completed',
    'clip_rejected',
    'card_created',
    'timeline_updated',
    'agent_error',
    'agent_output',
    'agent_request_input',
    'agent_started',
    'agent_finished'
  )),

  payload JSONB DEFAULT '{}'::jsonb,
  success BOOLEAN DEFAULT true,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Outputs table
CREATE TABLE IF NOT EXISTS agent_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clip_id UUID REFERENCES timeline_clips(id) ON DELETE CASCADE,

  agent_name TEXT NOT NULL CHECK (agent_name IN ('scout', 'coach', 'tracker', 'insight')),
  behaviour_type TEXT NOT NULL,

  output_data JSONB NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  execution_time_ms INTEGER,

  -- Generated artifacts
  clips_created INTEGER DEFAULT 0,
  cards_created INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Dialogue Messages table
CREATE TABLE IF NOT EXISTS agent_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clip_id UUID REFERENCES timeline_clips(id) ON DELETE SET NULL,

  agent_name TEXT NOT NULL CHECK (agent_name IN ('scout', 'coach', 'tracker', 'insight')),
  message TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  requires_decision BOOLEAN DEFAULT false,
  decision_options JSONB,
  user_response TEXT,

  context JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_agent_events_campaign ON agent_events(campaign_id);
CREATE INDEX idx_agent_events_user ON agent_events(user_id);
CREATE INDEX idx_agent_events_clip ON agent_events(clip_id);
CREATE INDEX idx_agent_events_agent ON agent_events(agent_name);
CREATE INDEX idx_agent_events_type ON agent_events(event_type);
CREATE INDEX idx_agent_events_created ON agent_events(created_at DESC);

CREATE INDEX idx_agent_outputs_campaign ON agent_outputs(campaign_id);
CREATE INDEX idx_agent_outputs_user ON agent_outputs(user_id);
CREATE INDEX idx_agent_outputs_clip ON agent_outputs(clip_id);
CREATE INDEX idx_agent_outputs_agent ON agent_outputs(agent_name);
CREATE INDEX idx_agent_outputs_created ON agent_outputs(created_at DESC);

CREATE INDEX idx_agent_messages_campaign ON agent_messages(campaign_id);
CREATE INDEX idx_agent_messages_user ON agent_messages(user_id);
CREATE INDEX idx_agent_messages_agent ON agent_messages(agent_name);
CREATE INDEX idx_agent_messages_requires_decision ON agent_messages(requires_decision);
CREATE INDEX idx_agent_messages_expires ON agent_messages(expires_at);

-- Row Level Security (RLS) Policies

-- Agent Events RLS
ALTER TABLE agent_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own agent events"
  ON agent_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent events"
  ON agent_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent events"
  ON agent_events FOR DELETE
  USING (auth.uid() = user_id);

-- Agent Outputs RLS
ALTER TABLE agent_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own agent outputs"
  ON agent_outputs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent outputs"
  ON agent_outputs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent outputs"
  ON agent_outputs FOR DELETE
  USING (auth.uid() = user_id);

-- Agent Messages RLS
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own agent messages"
  ON agent_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent messages"
  ON agent_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent messages"
  ON agent_messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent messages"
  ON agent_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Helper function to clean up expired messages
CREATE OR REPLACE FUNCTION cleanup_expired_agent_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM agent_messages
  WHERE expires_at IS NOT NULL
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run cleanup daily (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-agent-messages', '0 0 * * *', 'SELECT cleanup_expired_agent_messages()');

-- Statistics view for agent performance
CREATE OR REPLACE VIEW agent_performance_stats AS
SELECT
  agent_name,
  COUNT(*) as total_executions,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_executions,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed_executions,
  AVG(execution_time_ms) as avg_execution_time_ms,
  SUM(clips_created) as total_clips_created,
  SUM(cards_created) as total_cards_created,
  MAX(created_at) as last_execution
FROM agent_outputs
GROUP BY agent_name;
