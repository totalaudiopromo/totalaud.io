/**
 * User Preferences Migration
 *
 * Stores user-specific UI preferences, settings, and onboarding state.
 * Enables personalized UX without requiring full profile data.
 */

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Onboarding & first-time experience
  show_onboarding_overlay boolean NOT NULL DEFAULT true,
  onboarding_completed_at timestamptz,

  -- View preferences
  preferred_view text NOT NULL DEFAULT 'flow' CHECK (preferred_view IN ('flow', 'dashboard')),

  -- Feature flags
  demo_mode boolean NOT NULL DEFAULT false,
  auto_sync_enabled boolean NOT NULL DEFAULT true,

  -- Accessibility
  reduced_motion boolean NOT NULL DEFAULT false,
  mute_sounds boolean NOT NULL DEFAULT false,

  -- Theme preferences
  preferred_theme text DEFAULT 'ascii' CHECK (preferred_theme IN ('ascii', 'xp', 'aqua', 'ableton', 'punk')),

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Ensure one row per user
  UNIQUE(user_id)
);

-- Index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Row-Level Security Policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete their own preferences"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE user_preferences;

-- Auto-update timestamp trigger
CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Helper function to get or create user preferences
CREATE OR REPLACE FUNCTION get_or_create_user_preferences(p_user_id uuid)
RETURNS user_preferences AS $$
DECLARE
  v_prefs user_preferences;
BEGIN
  -- Try to get existing preferences
  SELECT * INTO v_prefs
  FROM user_preferences
  WHERE user_id = p_user_id;

  -- Create if not exists
  IF NOT FOUND THEN
    INSERT INTO user_preferences (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_prefs;
  END IF;

  RETURN v_prefs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE user_preferences IS 'User-specific UI preferences and settings';
COMMENT ON COLUMN user_preferences.show_onboarding_overlay IS 'Whether to show onboarding overlay on next visit';
COMMENT ON COLUMN user_preferences.preferred_view IS 'Default view: flow (node graph) or dashboard (narrative)';
COMMENT ON COLUMN user_preferences.demo_mode IS 'Enable demo/tutorial mode with sample data';
COMMENT ON COLUMN user_preferences.reduced_motion IS 'Disable animations for accessibility';
COMMENT ON COLUMN user_preferences.mute_sounds IS 'Disable all sound effects';
