-- Add onboarding profile fields for conversational onboarding
-- These store data collected during the "Audio" chat experience

-- Add new columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS artist_name text,
ADD COLUMN IF NOT EXISTS genre text,
ADD COLUMN IF NOT EXISTS vibe text,
ADD COLUMN IF NOT EXISTS project_type text CHECK (project_type IN ('single', 'ep', 'album', 'none')),
ADD COLUMN IF NOT EXISTS project_title text,
ADD COLUMN IF NOT EXISTS release_date date,
ADD COLUMN IF NOT EXISTS primary_goal text CHECK (primary_goal IN ('discover', 'plan', 'pitch', 'explore')),
ADD COLUMN IF NOT EXISTS goals text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_genre ON user_profiles(genre);
CREATE INDEX IF NOT EXISTS idx_user_profiles_release_date ON user_profiles(release_date);
CREATE INDEX IF NOT EXISTS idx_user_profiles_primary_goal ON user_profiles(primary_goal);

-- Add comments
COMMENT ON COLUMN user_profiles.artist_name IS 'Artist or project name from onboarding';
COMMENT ON COLUMN user_profiles.genre IS 'Music genre/style (freeform text)';
COMMENT ON COLUMN user_profiles.vibe IS 'Additional descriptors for the artist sound';
COMMENT ON COLUMN user_profiles.project_type IS 'Current project type: single, ep, album, or none';
COMMENT ON COLUMN user_profiles.project_title IS 'Name of current project (if any)';
COMMENT ON COLUMN user_profiles.release_date IS 'Planned release date - centre of gravity for Timeline';
COMMENT ON COLUMN user_profiles.primary_goal IS 'What the artist wants to focus on: discover, plan, pitch, explore';
COMMENT ON COLUMN user_profiles.goals IS 'Additional goals mentioned during onboarding';
COMMENT ON COLUMN user_profiles.onboarding_completed_at IS 'When conversational onboarding was completed';
