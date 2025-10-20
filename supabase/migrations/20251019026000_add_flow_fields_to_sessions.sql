-- Add Flow Canvas fields to agent_sessions table
-- This migration adds support for Flow Studio workflow sessions

-- Add new columns for Flow Canvas
ALTER TABLE agent_sessions
  ADD COLUMN IF NOT EXISTS flow_template_id text,
  ADD COLUMN IF NOT EXISTS session_name text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Make user_id nullable to support demo mode
ALTER TABLE agent_sessions
  ALTER COLUMN user_id DROP NOT NULL;

-- Make agent_name nullable (Flow sessions may have multiple agents)
ALTER TABLE agent_sessions
  ALTER COLUMN agent_name DROP NOT NULL;

-- Make initial_input nullable (Flow sessions start empty)
ALTER TABLE agent_sessions
  ALTER COLUMN initial_input DROP NOT NULL;

-- Enable RLS (if not already enabled)
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to allow demo mode
DROP POLICY IF EXISTS "Users can view own sessions" ON agent_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON agent_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON agent_sessions;
DROP POLICY IF EXISTS "Users can view sessions" ON agent_sessions;
DROP POLICY IF EXISTS "Users can insert sessions" ON agent_sessions;
DROP POLICY IF EXISTS "Users can update sessions" ON agent_sessions;

-- Allow SELECT for authenticated users viewing their own sessions OR anyone viewing demo sessions
CREATE POLICY "Users can view sessions"
  ON agent_sessions
  FOR SELECT
  USING (
    user_id IS NULL  -- Demo sessions visible to all
    OR user_id = auth.uid()  -- Own sessions
  );

-- Allow INSERT for everyone (demo mode + authenticated)
-- This is required because Supabase RLS blocks all inserts by default
CREATE POLICY "Anyone can insert sessions"
  ON agent_sessions
  FOR INSERT
  WITH CHECK (true);  -- Allow all inserts

-- Allow UPDATE for session owners OR demo sessions
CREATE POLICY "Users can update sessions"
  ON agent_sessions
  FOR UPDATE
  USING (
    user_id IS NULL  -- Demo sessions updatable by all
    OR user_id = auth.uid()  -- Own sessions
  );

-- Comments for new fields
COMMENT ON COLUMN agent_sessions.flow_template_id IS 'ID of the flow template used in Flow Studio';
COMMENT ON COLUMN agent_sessions.session_name IS 'Human-readable session name for Flow Studio';
COMMENT ON COLUMN agent_sessions.metadata IS 'Additional session context for Flow Studio';
