-- Migration: Add agent_manifests table for dynamic agent spawning
-- Phase 5: Generative Workspace
-- UK English, lowercase, minimal design

-- Create agent_manifests table
CREATE TABLE IF NOT EXISTS agent_manifests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('scout', 'coach', 'tracker', 'insight', 'custom')),
  personality text,
  colour text DEFAULT '#6366f1',
  sound_profile jsonb DEFAULT '{"start": 440, "complete": 880, "error": 220}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Ensure unique agent names per user
  CONSTRAINT unique_agent_name_per_user UNIQUE (user_id, name)
);

-- Create index for faster lookups
CREATE INDEX idx_agent_manifests_user_id ON agent_manifests(user_id);
CREATE INDEX idx_agent_manifests_role ON agent_manifests(role);
CREATE INDEX idx_agent_manifests_active ON agent_manifests(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE agent_manifests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own agent manifests
CREATE POLICY "Users can view their own agent manifests"
  ON agent_manifests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent manifests"
  ON agent_manifests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent manifests"
  ON agent_manifests
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent manifests"
  ON agent_manifests
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_agent_manifest_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_agent_manifest_timestamp
  BEFORE UPDATE ON agent_manifests
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_manifest_updated_at();

-- Comment on table
COMMENT ON TABLE agent_manifests IS 'Stores user-created agent configurations for dynamic spawning in Flow Studio';
COMMENT ON COLUMN agent_manifests.name IS 'Unique agent name per user (lowercase, no spaces recommended)';
COMMENT ON COLUMN agent_manifests.role IS 'Agent role type: scout, coach, tracker, insight, or custom';
COMMENT ON COLUMN agent_manifests.personality IS 'Free-text personality description influencing agent behaviour';
COMMENT ON COLUMN agent_manifests.colour IS 'Hex colour code for agent UI representation';
COMMENT ON COLUMN agent_manifests.sound_profile IS 'JSON object defining agent sound frequencies (start, complete, error)';
COMMENT ON COLUMN agent_manifests.is_active IS 'Whether the agent is currently active in the workspace';
