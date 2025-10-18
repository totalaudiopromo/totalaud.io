-- User Profiles for theme and preference storage
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Theme Selection
  ui_mode text CHECK (ui_mode IN ('ascii', 'xp', 'aqua', 'ableton', 'punk')),
  
  -- Preferences
  sound_enabled boolean DEFAULT false,
  sound_volume numeric DEFAULT 0.3 CHECK (sound_volume >= 0 AND sound_volume <= 1),
  
  -- Custom Theme Settings
  custom_colors jsonb DEFAULT '{}'::jsonb,
  custom_fonts jsonb DEFAULT '{}'::jsonb,
  
  -- Onboarding Status
  onboarding_completed boolean DEFAULT false,
  onboarding_step text,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_user_profiles_ui_mode ON user_profiles(ui_mode);
CREATE INDEX idx_user_profiles_onboarding ON user_profiles(onboarding_completed);

-- Updated_at trigger
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

COMMENT ON TABLE user_profiles IS 'User preferences including UI theme, sound settings, and onboarding status';
COMMENT ON COLUMN user_profiles.ui_mode IS 'Selected OS theme: ascii, xp, aqua, ableton, or punk';
COMMENT ON COLUMN user_profiles.custom_colors IS 'User-defined color overrides as JSON';
COMMENT ON COLUMN user_profiles.custom_fonts IS 'User-defined font preferences as JSON';

