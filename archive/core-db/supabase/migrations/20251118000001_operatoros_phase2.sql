-- OperatorOS Phase 2: Layout Persistence & App Profiles
-- Migration: 20251118000001_operatoros_phase2.sql

-- ============================================================================
-- operator_layouts
-- Stores user-specific desktop layouts (window positions, theme, persona)
-- ============================================================================

CREATE TABLE IF NOT EXISTS operator_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  layout_name TEXT NOT NULL,
  windows JSONB NOT NULL DEFAULT '[]'::jsonb,
  theme TEXT NOT NULL DEFAULT 'xp' CHECK (theme IN ('xp', 'aqua', 'daw', 'ascii', 'analogue')),
  persona TEXT NOT NULL DEFAULT 'default' CHECK (persona IN ('default', 'strategist', 'producer', 'campaign', 'dev')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one layout name per user per workspace
  CONSTRAINT operator_layouts_unique_name UNIQUE (user_id, workspace_id, layout_name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_operator_layouts_user_workspace
  ON operator_layouts(user_id, workspace_id);

CREATE INDEX IF NOT EXISTS idx_operator_layouts_layout_name
  ON operator_layouts(layout_name);

-- RLS Policies
ALTER TABLE operator_layouts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own layouts
CREATE POLICY operator_layouts_select_own
  ON operator_layouts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own layouts
CREATE POLICY operator_layouts_insert_own
  ON operator_layouts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own layouts
CREATE POLICY operator_layouts_update_own
  ON operator_layouts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own layouts
CREATE POLICY operator_layouts_delete_own
  ON operator_layouts
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- operator_app_profiles
-- Stores user preferences for individual apps (launch mode, pinning, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS operator_app_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  app_id TEXT NOT NULL,
  preferred_layout_name TEXT,
  launch_mode TEXT NOT NULL DEFAULT 'last_state' CHECK (launch_mode IN ('maximized', 'floating', 'last_state')),
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one profile per app per user per workspace
  CONSTRAINT operator_app_profiles_unique_app UNIQUE (user_id, workspace_id, app_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_operator_app_profiles_user_workspace
  ON operator_app_profiles(user_id, workspace_id);

CREATE INDEX IF NOT EXISTS idx_operator_app_profiles_app_id
  ON operator_app_profiles(app_id);

CREATE INDEX IF NOT EXISTS idx_operator_app_profiles_pinned
  ON operator_app_profiles(pinned) WHERE pinned = TRUE;

-- RLS Policies
ALTER TABLE operator_app_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own app profiles
CREATE POLICY operator_app_profiles_select_own
  ON operator_app_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own app profiles
CREATE POLICY operator_app_profiles_insert_own
  ON operator_app_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own app profiles
CREATE POLICY operator_app_profiles_update_own
  ON operator_app_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own app profiles
CREATE POLICY operator_app_profiles_delete_own
  ON operator_app_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Trigger Functions for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_operator_layouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER operator_layouts_updated_at_trigger
  BEFORE UPDATE ON operator_layouts
  FOR EACH ROW
  EXECUTE FUNCTION update_operator_layouts_updated_at();

CREATE OR REPLACE FUNCTION update_operator_app_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER operator_app_profiles_updated_at_trigger
  BEFORE UPDATE ON operator_app_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_operator_app_profiles_updated_at();

-- ============================================================================
-- Helper Comments
-- ============================================================================

COMMENT ON TABLE operator_layouts IS 'User-specific desktop layouts for OperatorOS (window positions, theme, persona)';
COMMENT ON TABLE operator_app_profiles IS 'User preferences for individual apps in OperatorOS (launch mode, pinning)';

COMMENT ON COLUMN operator_layouts.windows IS 'Array of window states: [{ appId, x, y, width, height, zIndex, isMinimized }]';
COMMENT ON COLUMN operator_app_profiles.metadata IS 'Additional app-specific settings (last window position, custom config)';
