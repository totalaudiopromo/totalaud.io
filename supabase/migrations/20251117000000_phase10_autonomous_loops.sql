-- Phase 10: Autonomous Loops Migration
-- Creates tables for autonomous agent loops

-- Agent Loops table
CREATE TABLE IF NOT EXISTS loops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,

  agent TEXT NOT NULL CHECK (agent IN ('scout', 'coach', 'tracker', 'insight')),
  loop_type TEXT NOT NULL CHECK (loop_type IN ('improvement', 'exploration', 'healthcheck', 'emotion', 'prediction')),
  interval TEXT NOT NULL CHECK (interval IN ('5m', '15m', '1h', 'daily')),

  payload JSONB DEFAULT '{}'::jsonb,

  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'error', 'disabled')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loop Events table
CREATE TABLE IF NOT EXISTS loop_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loop_id UUID NOT NULL REFERENCES loops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  agent TEXT NOT NULL CHECK (agent IN ('scout', 'coach', 'tracker', 'insight')),
  result JSONB NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loop Suggestions table
CREATE TABLE IF NOT EXISTS loop_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,

  agent TEXT NOT NULL CHECK (agent IN ('scout', 'coach', 'tracker', 'insight')),
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('missing_followups', 'timeline_gap', 'emotion_drop', 'overload')),
  message TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),

  recommended_action JSONB NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'modified')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_loops_user_id ON loops(user_id);
CREATE INDEX idx_loops_campaign_id ON loops(campaign_id);
CREATE INDEX idx_loops_status ON loops(status);
CREATE INDEX idx_loops_next_run ON loops(next_run);
CREATE INDEX idx_loops_agent ON loops(agent);

CREATE INDEX idx_loop_events_loop_id ON loop_events(loop_id);
CREATE INDEX idx_loop_events_user_id ON loop_events(user_id);
CREATE INDEX idx_loop_events_created_at ON loop_events(created_at DESC);

CREATE INDEX idx_loop_suggestions_user_id ON loop_suggestions(user_id);
CREATE INDEX idx_loop_suggestions_campaign_id ON loop_suggestions(campaign_id);
CREATE INDEX idx_loop_suggestions_status ON loop_suggestions(status);

-- Row Level Security (RLS) Policies

-- Loops RLS
ALTER TABLE loops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loops"
  ON loops FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loops"
  ON loops FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loops"
  ON loops FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loops"
  ON loops FOR DELETE
  USING (auth.uid() = user_id);

-- Loop Events RLS
ALTER TABLE loop_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loop events"
  ON loop_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loop events"
  ON loop_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loop events"
  ON loop_events FOR DELETE
  USING (auth.uid() = user_id);

-- Loop Suggestions RLS
ALTER TABLE loop_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loop suggestions"
  ON loop_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loop suggestions"
  ON loop_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loop suggestions"
  ON loop_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loop suggestions"
  ON loop_suggestions FOR DELETE
  USING (auth.uid() = user_id);

-- Helper function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_loops_updated_at
  BEFORE UPDATE ON loops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loop_suggestions_updated_at
  BEFORE UPDATE ON loop_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Statistics view for loop performance
CREATE OR REPLACE VIEW loop_performance_stats AS
SELECT
  l.agent,
  l.loop_type,
  COUNT(*) as total_loops,
  COUNT(CASE WHEN l.status = 'idle' THEN 1 END) as idle_loops,
  COUNT(CASE WHEN l.status = 'running' THEN 1 END) as running_loops,
  COUNT(CASE WHEN l.status = 'error' THEN 1 END) as error_loops,
  COUNT(CASE WHEN l.status = 'disabled' THEN 1 END) as disabled_loops,
  COUNT(le.id) as total_executions,
  SUM(CASE WHEN (le.result->>'success')::boolean THEN 1 ELSE 0 END) as successful_executions,
  AVG((le.result->>'executionTimeMs')::integer) as avg_execution_time_ms,
  MAX(l.last_run) as last_execution
FROM loops l
LEFT JOIN loop_events le ON l.id = le.loop_id
GROUP BY l.agent, l.loop_type;
