-- Fix agent_activity_log foreign key to allow nullable session_id
-- This allows demo mode to work without authentication

-- Make session_id nullable and allow NULL values
ALTER TABLE agent_activity_log
  ALTER COLUMN session_id DROP NOT NULL;

-- Update the foreign key constraint to allow NULL values
-- First drop the existing constraint if it exists
ALTER TABLE agent_activity_log
  DROP CONSTRAINT IF EXISTS agent_activity_log_session_id_fkey;

-- Add back the constraint allowing NULL
ALTER TABLE agent_activity_log
  ADD CONSTRAINT agent_activity_log_session_id_fkey
  FOREIGN KEY (session_id)
  REFERENCES agent_sessions(id)
  ON DELETE CASCADE;

-- Update RLS policies to allow anonymous inserts (for demo mode)
DROP POLICY IF EXISTS "Agents can insert activity logs" ON agent_activity_log;

CREATE POLICY "Anyone can insert activity logs"
  ON agent_activity_log
  FOR INSERT
  WITH CHECK (true);

-- Allow users to view activity for their sessions OR sessions with NULL user_id (demo mode)
DROP POLICY IF EXISTS "Users can view own session activity" ON agent_activity_log;

CREATE POLICY "Users can view session activity"
  ON agent_activity_log
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM agent_sessions
      WHERE user_id = auth.uid() OR user_id IS NULL
    )
    OR session_id IS NULL
  );

COMMENT ON TABLE agent_activity_log IS 'Real-time activity log for agent execution in Flow Canvas. Supports both authenticated and demo mode.';
