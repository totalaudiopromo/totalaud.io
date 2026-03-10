/**
 * Agent Results Table
 * Adds storage for agent outputs (intel/pitch/tracker/etc).
 *
 * Columns:
 * - user_id: owner of the agent run
 * - session_id: optional link to agent_sessions
 * - agent_type: intel/pitch/tracker/etc
 * - result_data: JSON payload of the agent output
 * - status: simple lifecycle state
 */

CREATE TABLE IF NOT EXISTS agent_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES agent_sessions(id) ON DELETE SET NULL,
  agent_type text NOT NULL,
  result_data jsonb NOT NULL,
  status text DEFAULT 'completed' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_results_user_created ON agent_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_results_session_created ON agent_results(session_id, created_at DESC);

-- Updated_at trigger (uses global helper from 20250118000000_add_agent_system.sql)
CREATE TRIGGER update_agent_results_updated_at
  BEFORE UPDATE ON agent_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE agent_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own agent results"
  ON agent_results
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent results"
  ON agent_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent results"
  ON agent_results
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent results"
  ON agent_results
  FOR DELETE
  USING (auth.uid() = user_id);
