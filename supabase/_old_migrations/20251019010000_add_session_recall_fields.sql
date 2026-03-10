-- Add session recall fields to user_profiles
-- Enable Broker to remember returning users and their previous campaigns

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS last_session_id text,
  ADD COLUMN IF NOT EXISTS last_goal text,
  ADD COLUMN IF NOT EXISTS last_flow_template jsonb,
  ADD COLUMN IF NOT EXISTS last_accessed timestamptz DEFAULT now();

-- Create index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_session
  ON user_profiles(last_session_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_last_accessed
  ON user_profiles(last_accessed DESC);

-- Comments for documentation
COMMENT ON COLUMN user_profiles.last_session_id IS 'ID of the most recent Broker session';
COMMENT ON COLUMN user_profiles.last_goal IS 'Most recent promotional goal (for quick resume)';
COMMENT ON COLUMN user_profiles.last_flow_template IS 'Serialized flow template from last session';
COMMENT ON COLUMN user_profiles.last_accessed IS 'Timestamp of last interaction with Broker';

-- Trigger to auto-update last_accessed
CREATE OR REPLACE FUNCTION update_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_last_accessed
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_last_accessed();
