-- LoopOS Phase 8: Real-Time Collaboration & Presence
-- Author: Claude Code
-- Date: 2025-11-16

-- =====================================================
-- USER PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS loopos_user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  colour TEXT NOT NULL DEFAULT '#3AA9BE',
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away')),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE loopos_user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all profiles"
  ON loopos_user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON loopos_user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON loopos_user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Indexes
CREATE INDEX idx_loopos_user_profiles_status ON loopos_user_profiles(status);
CREATE INDEX idx_loopos_user_profiles_last_seen ON loopos_user_profiles(last_seen_at);

-- =====================================================
-- DESIGNER SCENES TABLE (WITH REALTIME METADATA)
-- =====================================================

CREATE TABLE IF NOT EXISTS loopos_designer_scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  scene_type TEXT NOT NULL,
  scene_data JSONB NOT NULL DEFAULT '{}',
  locked_by UUID REFERENCES auth.users(id),
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE loopos_designer_scenes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view scenes in their workspaces"
  ON loopos_designer_scenes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_designer_scenes.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace editors can create scenes"
  ON loopos_designer_scenes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_designer_scenes.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Scene creators and workspace owners can update scenes"
  ON loopos_designer_scenes FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_designer_scenes.workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

CREATE POLICY "Scene creators and workspace owners can delete scenes"
  ON loopos_designer_scenes FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_designer_scenes.workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Indexes
CREATE INDEX idx_loopos_designer_scenes_workspace ON loopos_designer_scenes(workspace_id);
CREATE INDEX idx_loopos_designer_scenes_user ON loopos_designer_scenes(user_id);
CREATE INDEX idx_loopos_designer_scenes_locked ON loopos_designer_scenes(locked_by);

-- =====================================================
-- ENABLE REALTIME ON EXISTING TABLES
-- =====================================================

-- Enable realtime publication for timeline nodes
ALTER PUBLICATION supabase_realtime ADD TABLE loopos_nodes;

-- Enable realtime publication for designer scenes
ALTER PUBLICATION supabase_realtime ADD TABLE loopos_designer_scenes;

-- Enable realtime publication for user profiles (presence)
ALTER PUBLICATION supabase_realtime ADD TABLE loopos_user_profiles;

-- =====================================================
-- PRESENCE TRACKING FUNCTIONS
-- =====================================================

-- Function to update user status
CREATE OR REPLACE FUNCTION update_user_status(new_status TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO loopos_user_profiles (id, display_name, status, last_seen_at)
  VALUES (
    auth.uid(),
    COALESCE((SELECT email FROM auth.users WHERE id = auth.uid()), 'Anonymous'),
    new_status,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    status = new_status,
    last_seen_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark users as away after inactivity
CREATE OR REPLACE FUNCTION mark_inactive_users_away()
RETURNS VOID AS $$
BEGIN
  UPDATE loopos_user_profiles
  SET status = 'away', updated_at = NOW()
  WHERE status = 'online'
  AND last_seen_at < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Function to lock/unlock designer scenes
CREATE OR REPLACE FUNCTION lock_designer_scene(scene_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_lock UUID;
BEGIN
  SELECT locked_by INTO current_lock
  FROM loopos_designer_scenes
  WHERE id = scene_id;

  IF current_lock IS NOT NULL AND current_lock != auth.uid() THEN
    RETURN FALSE;
  END IF;

  UPDATE loopos_designer_scenes
  SET locked_by = auth.uid(), locked_at = NOW(), updated_at = NOW()
  WHERE id = scene_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION unlock_designer_scene(scene_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE loopos_designer_scenes
  SET locked_by = NULL, locked_at = NULL, updated_at = NOW()
  WHERE id = scene_id AND locked_by = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_loopos_user_profiles
  BEFORE UPDATE ON loopos_user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_loopos_designer_scenes
  BEFORE UPDATE ON loopos_designer_scenes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();
