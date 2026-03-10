-- ============================================================================
-- Signal Threads
-- Phase 2: Connect Timeline Events into Narrative Story Arcs
--
-- Enables artists to group timeline events into meaningful threads:
-- - Narrative arcs (the story of a release)
-- - Campaign threads (linked promotional activities)
-- - Creative threads (related content/ideas)
-- - Scene threads (live performance connections)
-- - Performance threads (analytics/results grouping)
-- ============================================================================

-- ============================================================================
-- 1. Signal Threads Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS signal_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Thread identity
  title TEXT NOT NULL,
  thread_type TEXT NOT NULL CHECK (thread_type IN ('narrative', 'campaign', 'creative', 'scene', 'performance')),
  colour TEXT DEFAULT '#3AA9BE',

  -- Event membership (denormalised for faster queries)
  event_ids UUID[] DEFAULT '{}',

  -- AI-generated content
  narrative_summary TEXT,
  insights TEXT[] DEFAULT '{}',

  -- Computed date range (from linked events)
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_signal_threads_user_id ON signal_threads(user_id);
CREATE INDEX idx_signal_threads_type ON signal_threads(thread_type);
CREATE INDEX idx_signal_threads_created_at ON signal_threads(created_at DESC);

-- ============================================================================
-- 2. Add thread_id to Timeline Events
-- ============================================================================

ALTER TABLE user_timeline_events
ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES signal_threads(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_timeline_events_thread_id ON user_timeline_events(thread_id);

-- ============================================================================
-- 3. Row Level Security
-- ============================================================================

ALTER TABLE signal_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own threads"
  ON signal_threads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own threads"
  ON signal_threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads"
  ON signal_threads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own threads"
  ON signal_threads FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. Updated At Trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_signal_threads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_signal_threads_updated_at
  BEFORE UPDATE ON signal_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_signal_threads_updated_at();

-- ============================================================================
-- 5. Helper Function: Recalculate Thread Date Range
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_thread_dates(p_thread_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE signal_threads
  SET
    start_date = (
      SELECT MIN(event_date)
      FROM user_timeline_events
      WHERE thread_id = p_thread_id
    ),
    end_date = (
      SELECT MAX(event_date)
      FROM user_timeline_events
      WHERE thread_id = p_thread_id
    ),
    event_ids = (
      SELECT COALESCE(array_agg(id ORDER BY event_date), '{}')
      FROM user_timeline_events
      WHERE thread_id = p_thread_id
    ),
    updated_at = NOW()
  WHERE id = p_thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. Trigger: Auto-Update Thread Dates on Event Changes
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_thread_on_event_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle event deletion or thread_id change
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.thread_id IS DISTINCT FROM NEW.thread_id) THEN
    IF OLD.thread_id IS NOT NULL THEN
      PERFORM recalculate_thread_dates(OLD.thread_id);
    END IF;
  END IF;

  -- Handle event insertion or thread_id change
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.thread_id IS DISTINCT FROM NEW.thread_id) THEN
    IF NEW.thread_id IS NOT NULL THEN
      PERFORM recalculate_thread_dates(NEW.thread_id);
    END IF;
  END IF;

  -- Handle date change within same thread
  IF TG_OP = 'UPDATE' AND OLD.thread_id = NEW.thread_id AND OLD.event_date IS DISTINCT FROM NEW.event_date THEN
    IF NEW.thread_id IS NOT NULL THEN
      PERFORM recalculate_thread_dates(NEW.thread_id);
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_thread_on_event_change
  AFTER INSERT OR UPDATE OR DELETE ON user_timeline_events
  FOR EACH ROW
  EXECUTE FUNCTION sync_thread_on_event_change();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE signal_threads IS 'Signal Threads - connect timeline events into narrative story arcs';
COMMENT ON COLUMN signal_threads.thread_type IS 'Thread category: narrative, campaign, creative, scene, or performance';
COMMENT ON COLUMN signal_threads.event_ids IS 'Denormalised array of linked event IDs for fast querying';
COMMENT ON COLUMN signal_threads.narrative_summary IS 'AI-generated story summary for the thread';
COMMENT ON COLUMN signal_threads.insights IS 'AI-generated insights about the thread pattern';
