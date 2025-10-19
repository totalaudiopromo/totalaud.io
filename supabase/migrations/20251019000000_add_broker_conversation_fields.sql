-- Add Broker conversation memory fields to user_profiles
-- These fields store data collected during Broker's onboarding chat

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS artist_name text,
  ADD COLUMN IF NOT EXISTS genre text,
  ADD COLUMN IF NOT EXISTS goal text,
  ADD COLUMN IF NOT EXISTS experience text,
  ADD COLUMN IF NOT EXISTS broker_session_id text,
  ADD COLUMN IF NOT EXISTS broker_completed_at timestamptz;

-- Create index for faster broker session lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_broker_session
  ON user_profiles(broker_session_id);

-- Comments for documentation
COMMENT ON COLUMN user_profiles.artist_name IS 'Artist or project name collected by Broker during onboarding';
COMMENT ON COLUMN user_profiles.genre IS 'Musical genre/style collected by Broker';
COMMENT ON COLUMN user_profiles.goal IS 'Primary promotional goal (radio, press, playlists, etc.)';
COMMENT ON COLUMN user_profiles.experience IS 'User experience level (beginner, DIY, professional, veteran)';
COMMENT ON COLUMN user_profiles.broker_session_id IS 'UUID of the Broker conversation session';
COMMENT ON COLUMN user_profiles.broker_completed_at IS 'Timestamp when Broker onboarding was completed';
