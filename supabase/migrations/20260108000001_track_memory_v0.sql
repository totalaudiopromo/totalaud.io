-- Track Memory v0: Passive Continuity Persistence
-- Migration: 20260108000001_track_memory_v0.sql
--
-- Purpose:
-- - Store track memory entries (intent, perspectives, story fragments, etc.)
-- - Append-only log structure (no overwrites)
-- - Keyed by (user_id, track_id) where track_id = artist_assets.id
-- 
-- Safety boundaries:
-- - No keystrokes, hesitation, rejected content, or "performance" metrics
-- - Deletion cascades when track is deleted

-- ============================================================================
-- track_memory
-- Master record for each track (one per user+track combination)
-- ============================================================================

CREATE TABLE IF NOT EXISTS track_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  track_id UUID NOT NULL,
  
  -- Canonical intent (the most recent explicit intent statement)
  canonical_intent TEXT,
  canonical_intent_updated_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one memory record per user per track
  CONSTRAINT track_memory_unique_track UNIQUE (user_id, track_id)
);

-- Note: idx_track_memory_user_track not needed - covered by track_memory_unique_track constraint

-- ============================================================================
-- track_memory_entries
-- Append-only log of memory deposits (never overwritten, only deleted)
-- ============================================================================

CREATE TABLE IF NOT EXISTS track_memory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_memory_id UUID NOT NULL REFERENCES track_memory(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Entry type (what kind of memory this is)
  entry_type TEXT NOT NULL CHECK (entry_type IN (
    'intent',              -- From Ideas: why the work exists
    'perspective',         -- From Finish: system observations
    'story_fragment',      -- From Story/Pitch: narrative pieces
    'sequence_decision',   -- From Timeline: placement decisions
    'scout_consideration', -- From Scout: opportunities viewed
    'version_note',        -- From Finish: artist notes on a version
    'note'                 -- General note (catch-all)
  )),
  
  -- Payload (type-specific content)
  payload JSONB NOT NULL,
  
  -- Source tracking (which mode deposited this)
  source_mode TEXT CHECK (source_mode IN (
    'ideas', 'finish', 'story', 'scout', 'timeline', 'content', 'manual'
  )),
  
  -- Immutable timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for querying entries
CREATE INDEX IF NOT EXISTS idx_track_memory_entries_track
  ON track_memory_entries(track_memory_id);

CREATE INDEX IF NOT EXISTS idx_track_memory_entries_user
  ON track_memory_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_track_memory_entries_type
  ON track_memory_entries(entry_type);

CREATE INDEX IF NOT EXISTS idx_track_memory_entries_created
  ON track_memory_entries(created_at DESC);

-- ============================================================================
-- RLS Policies: track_memory
-- ============================================================================

ALTER TABLE track_memory ENABLE ROW LEVEL SECURITY;

-- Users can only see their own track memory
CREATE POLICY track_memory_select_own
  ON track_memory
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own track memory
CREATE POLICY track_memory_insert_own
  ON track_memory
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own track memory
CREATE POLICY track_memory_update_own
  ON track_memory
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own track memory
CREATE POLICY track_memory_delete_own
  ON track_memory
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS Policies: track_memory_entries
-- ============================================================================

ALTER TABLE track_memory_entries ENABLE ROW LEVEL SECURITY;

-- Users can only see their own entries
CREATE POLICY track_memory_entries_select_own
  ON track_memory_entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own entries
CREATE POLICY track_memory_entries_insert_own
  ON track_memory_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: No UPDATE policy - entries are append-only
-- Users can still delete their entries if needed

-- Users can delete their own entries
CREATE POLICY track_memory_entries_delete_own
  ON track_memory_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Trigger for updated_at on track_memory
-- ============================================================================

CREATE OR REPLACE FUNCTION update_track_memory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_memory_updated_at_trigger
  BEFORE UPDATE ON track_memory
  FOR EACH ROW
  EXECUTE FUNCTION update_track_memory_updated_at();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE track_memory IS 'Master record for track memory (one per user+track). Stores canonical intent and links to append-only entries.';
COMMENT ON TABLE track_memory_entries IS 'Append-only log of memory deposits. Never overwritten, only deleted when track is deleted.';

COMMENT ON COLUMN track_memory.track_id IS 'References artist_assets.id where kind=audio. The track this memory belongs to.';
COMMENT ON COLUMN track_memory.canonical_intent IS 'The most recent explicit statement of why this track exists.';
COMMENT ON COLUMN track_memory_entries.entry_type IS 'Type of memory: intent, perspective, story_fragment, sequence_decision, scout_consideration, version_note, note.';
COMMENT ON COLUMN track_memory_entries.payload IS 'JSON payload with type-specific content (content, source, metadata).';
COMMENT ON COLUMN track_memory_entries.source_mode IS 'Which workspace mode deposited this entry.';
