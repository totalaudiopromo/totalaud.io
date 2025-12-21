-- ============================================================================
-- LoopOS Phase 8: Real-Time Collaboration & Presence
-- ============================================================================
-- This migration adds support for real-time collaboration features:
-- - Designer scenes (persistent AI-generated visualisations)
-- - User profiles (for display names and cursor colours)
-- - Collaboration metadata on existing tables
-- ============================================================================

-- ============================================================================
-- USER PROFILES (for collaboration display)
-- ============================================================================

CREATE TABLE IF NOT EXISTS loopos_user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  cursor_colour TEXT NOT NULL DEFAULT '#3AA9BE',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for user profiles
ALTER TABLE loopos_user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles in their workspaces"
  ON loopos_user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members wm1
      WHERE wm1.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM loopos_workspace_members wm2
        WHERE wm2.user_id = loopos_user_profiles.id
        AND wm2.workspace_id = wm1.workspace_id
      )
    )
  );

CREATE POLICY "Users can update their own profile"
  ON loopos_user_profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON loopos_user_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- DESIGNER SCENES (AI-generated visual strategies)
-- ============================================================================

CREATE TABLE IF NOT EXISTS loopos_designer_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'strategy', -- 'strategy', 'audience', 'timeline', 'campaign'
  prompt TEXT, -- Original AI prompt
  data JSONB NOT NULL, -- Scene structure (elements, arcs, etc.)
  is_active BOOLEAN NOT NULL DEFAULT false, -- Currently displayed scene
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for active scene lookups
CREATE INDEX idx_designer_scenes_workspace ON loopos_designer_scenes(workspace_id);
CREATE INDEX idx_designer_scenes_active ON loopos_designer_scenes(workspace_id, is_active) WHERE is_active = true;

-- RLS for designer scenes
ALTER TABLE loopos_designer_scenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scenes in their workspaces"
  ON loopos_designer_scenes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_designer_scenes.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can create scenes"
  ON loopos_designer_scenes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_designer_scenes.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can update scenes"
  ON loopos_designer_scenes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_designer_scenes.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Owners can delete scenes"
  ON loopos_designer_scenes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_designer_scenes.workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- ============================================================================
-- ADD COLLABORATION METADATA TO EXISTING TABLES
-- ============================================================================

-- Add version tracking to nodes for conflict resolution
ALTER TABLE loopos_nodes ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE loopos_nodes ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES auth.users(id);

-- Update trigger to increment version on updates
CREATE OR REPLACE FUNCTION increment_node_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  NEW.last_edited_by = auth.uid();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER node_version_increment
  BEFORE UPDATE ON loopos_nodes
  FOR EACH ROW
  EXECUTE FUNCTION increment_node_version();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get or create user profile with colour assignment
CREATE OR REPLACE FUNCTION get_or_create_user_profile(user_uuid UUID)
RETURNS loopos_user_profiles AS $$
DECLARE
  profile loopos_user_profiles;
  assigned_colour TEXT;
  colour_options TEXT[] := ARRAY[
    '#3AA9BE', -- Slate Cyan (default)
    '#BE3A6B', -- Rose
    '#BE8A3A', -- Amber
    '#3ABE8A', -- Teal
    '#8A3ABE', -- Purple
    '#BE3A3A', -- Red
    '#3A8ABE', -- Blue
    '#BEBE3A'  -- Yellow
  ];
BEGIN
  -- Try to get existing profile
  SELECT * INTO profile FROM loopos_user_profiles WHERE id = user_uuid;

  IF profile IS NULL THEN
    -- Assign a colour (cycle through options based on user count)
    SELECT colour_options[(COUNT(*) % array_length(colour_options, 1)) + 1]
    INTO assigned_colour
    FROM loopos_user_profiles;

    -- Create new profile
    INSERT INTO loopos_user_profiles (id, cursor_colour)
    VALUES (user_uuid, COALESCE(assigned_colour, '#3AA9BE'))
    RETURNING * INTO profile;
  END IF;

  RETURN profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- REALTIME PUBLICATIONS
-- ============================================================================

-- Enable realtime for collaboration tables
ALTER PUBLICATION supabase_realtime ADD TABLE loopos_nodes;
ALTER PUBLICATION supabase_realtime ADD TABLE loopos_designer_scenes;
ALTER PUBLICATION supabase_realtime ADD TABLE loopos_user_profiles;

-- ============================================================================
-- INDICES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_nodes_workspace_updated ON loopos_nodes(workspace_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_nodes_version ON loopos_nodes(id, version);
