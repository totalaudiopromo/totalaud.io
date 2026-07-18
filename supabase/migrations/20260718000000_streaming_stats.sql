-- Streaming stats imported from the artist's own exports (Phase 5,
-- docs/ROADMAP_2026.md). Spotify for Artists CSV first; the unique key on
-- (user_id, source, stat_date) makes re-importing the same export a no-op
-- rather than a duplicate. Own data only — nothing is scraped.

CREATE TABLE IF NOT EXISTS streaming_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'spotify_csv',
  stat_date DATE NOT NULL,
  streams INTEGER,
  listeners INTEGER,
  saves INTEGER,
  followers INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, source, stat_date)
);

CREATE INDEX IF NOT EXISTS idx_streaming_stats_user_date
  ON streaming_stats(user_id, stat_date);

ALTER TABLE streaming_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own streaming stats" ON streaming_stats;
CREATE POLICY "Users can view own streaming stats" ON streaming_stats
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own streaming stats" ON streaming_stats;
CREATE POLICY "Users can insert own streaming stats" ON streaming_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own streaming stats" ON streaming_stats;
CREATE POLICY "Users can update own streaming stats" ON streaming_stats
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own streaming stats" ON streaming_stats;
CREATE POLICY "Users can delete own streaming stats" ON streaming_stats
  FOR DELETE USING (auth.uid() = user_id);
