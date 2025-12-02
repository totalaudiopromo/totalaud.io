-- ============================================================================
-- Workspace Data Tables
-- Phase 10: Data Persistence for totalaud.io Calm Creative Workspace
--
-- Creates tables for persisting user data across devices:
-- - user_ideas: Ideas Mode canvas cards
-- - user_timeline_events: Timeline Mode planning blocks
-- - user_pitch_drafts: Pitch Mode saved drafts
-- ============================================================================

-- ============================================================================
-- 1. User Ideas (Ideas Mode)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Content
  content TEXT NOT NULL,
  tag TEXT NOT NULL CHECK (tag IN ('content', 'brand', 'music', 'promo')),

  -- Canvas position
  position_x FLOAT DEFAULT 100,
  position_y FLOAT DEFAULT 100,

  -- Metadata
  is_starter BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_user_ideas_user_id ON user_ideas(user_id);
CREATE INDEX idx_user_ideas_tag ON user_ideas(tag);
CREATE INDEX idx_user_ideas_created_at ON user_ideas(created_at DESC);

-- RLS
ALTER TABLE user_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own ideas"
  ON user_ideas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ideas"
  ON user_ideas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas"
  ON user_ideas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ideas"
  ON user_ideas FOR DELETE
  USING (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_user_ideas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_ideas_updated_at
  BEFORE UPDATE ON user_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_user_ideas_updated_at();

-- ============================================================================
-- 2. User Timeline Events (Timeline Mode)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Event data
  lane TEXT NOT NULL CHECK (lane IN ('pre-release', 'release', 'promo', 'content', 'analytics')),
  title TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  colour TEXT DEFAULT '#3AA9BE',
  description TEXT,
  url TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Source tracking
  source TEXT NOT NULL CHECK (source IN ('manual', 'scout', 'sample')) DEFAULT 'manual',
  opportunity_id UUID, -- Reference to opportunities table

  -- TAP Tracker integration
  tracker_campaign_id TEXT,
  tracker_synced_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_user_timeline_events_user_id ON user_timeline_events(user_id);
CREATE INDEX idx_user_timeline_events_lane ON user_timeline_events(lane);
CREATE INDEX idx_user_timeline_events_date ON user_timeline_events(event_date);
CREATE INDEX idx_user_timeline_events_created_at ON user_timeline_events(created_at DESC);

-- RLS
ALTER TABLE user_timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own timeline events"
  ON user_timeline_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own timeline events"
  ON user_timeline_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timeline events"
  ON user_timeline_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timeline events"
  ON user_timeline_events FOR DELETE
  USING (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_user_timeline_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_timeline_events_updated_at
  BEFORE UPDATE ON user_timeline_events
  FOR EACH ROW
  EXECUTE FUNCTION update_user_timeline_events_updated_at();

-- ============================================================================
-- 3. User Pitch Drafts (Pitch Mode)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_pitch_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Pitch data
  name TEXT NOT NULL,
  pitch_type TEXT NOT NULL CHECK (pitch_type IN ('radio', 'press', 'playlist', 'custom')),

  -- Sections stored as JSONB for flexibility
  -- Structure: [{ id, title, content, placeholder }]
  sections JSONB DEFAULT '[]'::jsonb NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_user_pitch_drafts_user_id ON user_pitch_drafts(user_id);
CREATE INDEX idx_user_pitch_drafts_type ON user_pitch_drafts(pitch_type);
CREATE INDEX idx_user_pitch_drafts_created_at ON user_pitch_drafts(created_at DESC);

-- RLS
ALTER TABLE user_pitch_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own pitch drafts"
  ON user_pitch_drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own pitch drafts"
  ON user_pitch_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pitch drafts"
  ON user_pitch_drafts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pitch drafts"
  ON user_pitch_drafts FOR DELETE
  USING (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_user_pitch_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_pitch_drafts_updated_at
  BEFORE UPDATE ON user_pitch_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_pitch_drafts_updated_at();

-- ============================================================================
-- 4. User Workspace Preferences (Settings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_workspace_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Ideas Mode preferences
  ideas_view_mode TEXT DEFAULT 'canvas' CHECK (ideas_view_mode IN ('canvas', 'list')),
  ideas_sort_mode TEXT DEFAULT 'newest' CHECK (ideas_sort_mode IN ('newest', 'oldest', 'alpha')),
  ideas_has_seen_starters BOOLEAN DEFAULT FALSE,

  -- General preferences
  last_active_mode TEXT DEFAULT 'ideas' CHECK (last_active_mode IN ('ideas', 'scout', 'timeline', 'pitch')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX idx_user_workspace_preferences_user_id ON user_workspace_preferences(user_id);

-- RLS
ALTER TABLE user_workspace_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON user_workspace_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own preferences"
  ON user_workspace_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_workspace_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Upsert function for preferences
CREATE OR REPLACE FUNCTION upsert_workspace_preferences(
  p_user_id UUID,
  p_ideas_view_mode TEXT DEFAULT NULL,
  p_ideas_sort_mode TEXT DEFAULT NULL,
  p_ideas_has_seen_starters BOOLEAN DEFAULT NULL,
  p_last_active_mode TEXT DEFAULT NULL
) RETURNS user_workspace_preferences AS $$
DECLARE
  result user_workspace_preferences;
BEGIN
  INSERT INTO user_workspace_preferences (
    user_id,
    ideas_view_mode,
    ideas_sort_mode,
    ideas_has_seen_starters,
    last_active_mode
  ) VALUES (
    p_user_id,
    COALESCE(p_ideas_view_mode, 'canvas'),
    COALESCE(p_ideas_sort_mode, 'newest'),
    COALESCE(p_ideas_has_seen_starters, FALSE),
    COALESCE(p_last_active_mode, 'ideas')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    ideas_view_mode = COALESCE(p_ideas_view_mode, user_workspace_preferences.ideas_view_mode),
    ideas_sort_mode = COALESCE(p_ideas_sort_mode, user_workspace_preferences.ideas_sort_mode),
    ideas_has_seen_starters = COALESCE(p_ideas_has_seen_starters, user_workspace_preferences.ideas_has_seen_starters),
    last_active_mode = COALESCE(p_last_active_mode, user_workspace_preferences.last_active_mode),
    updated_at = NOW()
  RETURNING * INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_user_workspace_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_workspace_preferences_updated_at
  BEFORE UPDATE ON user_workspace_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_workspace_preferences_updated_at();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE user_ideas IS 'Ideas Mode cards - drag-drop canvas for creative/marketing ideas';
COMMENT ON TABLE user_timeline_events IS 'Timeline Mode blocks - release planning across 5 swim lanes';
COMMENT ON TABLE user_pitch_drafts IS 'Pitch Mode drafts - saved pitches for radio, press, playlists';
COMMENT ON TABLE user_workspace_preferences IS 'Per-user workspace settings and preferences';
