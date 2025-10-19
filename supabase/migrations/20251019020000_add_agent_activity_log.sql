-- Agent Activity Log for Flow Execution Tracking
-- Tracks real-time execution status of agents working on Flow Canvas nodes

CREATE TABLE IF NOT EXISTS agent_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Session and Agent Info
  session_id uuid REFERENCES agent_sessions(id) ON DELETE CASCADE,
  agent_name text NOT NULL,
  node_id text NOT NULL,

  -- Execution Status
  status text NOT NULL CHECK (status IN ('queued', 'running', 'complete', 'error', 'cancelled')),
  message text,

  -- Results and Metadata
  result jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Timing
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes for faster queries
CREATE INDEX idx_agent_activity_session_id ON agent_activity_log(session_id);
CREATE INDEX idx_agent_activity_agent_name ON agent_activity_log(agent_name);
CREATE INDEX idx_agent_activity_node_id ON agent_activity_log(node_id);
CREATE INDEX idx_agent_activity_status ON agent_activity_log(status);
CREATE INDEX idx_agent_activity_created_at ON agent_activity_log(created_at DESC);

-- Composite index for realtime filtering
CREATE INDEX idx_agent_activity_session_node ON agent_activity_log(session_id, node_id);

-- Enable Realtime for live updates in Flow Canvas
ALTER PUBLICATION supabase_realtime ADD TABLE agent_activity_log;

-- Row Level Security
ALTER TABLE agent_activity_log ENABLE ROW LEVEL SECURITY;

-- Users can view activity logs for their own sessions
CREATE POLICY "Users can view own session activity"
  ON agent_activity_log
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM agent_sessions
      WHERE user_id = auth.uid()
    )
  );

-- Agents can insert activity logs
CREATE POLICY "Agents can insert activity logs"
  ON agent_activity_log
  FOR INSERT
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE agent_activity_log IS 'Real-time activity log for agent execution in Flow Canvas';
COMMENT ON COLUMN agent_activity_log.agent_name IS 'Name of the agent executing (broker, scout, coach, tracker, insight)';
COMMENT ON COLUMN agent_activity_log.node_id IS 'ID of the Flow Canvas node being executed';
COMMENT ON COLUMN agent_activity_log.status IS 'Current execution status of the node';
COMMENT ON COLUMN agent_activity_log.message IS 'Human-readable status message or progress update';
COMMENT ON COLUMN agent_activity_log.result IS 'Structured result data from the execution';
COMMENT ON COLUMN agent_activity_log.metadata IS 'Additional context (inputs, config, errors, etc.)';
