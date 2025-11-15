-- Timeline Tables Migration
-- Creates tables for timeline states, clips, and analogue cards

-- Timeline States table
CREATE TABLE IF NOT EXISTS timeline_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timeline configuration
  zoom NUMERIC DEFAULT 50,
  scroll_offset NUMERIC DEFAULT 0,
  snap_to_grid BOOLEAN DEFAULT true,
  grid_size NUMERIC DEFAULT 1,
  duration NUMERIC DEFAULT 300,
  playhead_position NUMERIC DEFAULT 0,
  is_playing BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(campaign_id)
);

-- Timeline Tracks table
CREATE TABLE IF NOT EXISTS timeline_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timeline_state_id UUID REFERENCES timeline_states(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  colour TEXT NOT NULL DEFAULT '#3AA9BE',
  height INTEGER DEFAULT 60,
  muted BOOLEAN DEFAULT false,
  solo BOOLEAN DEFAULT false,
  track_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timeline Clips table
CREATE TABLE IF NOT EXISTS timeline_clips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID REFERENCES timeline_tracks(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  start_time NUMERIC NOT NULL,
  duration NUMERIC NOT NULL,
  colour TEXT NOT NULL DEFAULT '#3AA9BE',
  agent_source TEXT, -- 'scout', 'coach', 'tracker', 'insight'
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analogue Cards table
CREATE TABLE IF NOT EXISTS analogue_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  card_type TEXT NOT NULL CHECK (card_type IN (
    'hope', 'doubt', 'pride', 'fear', 'clarity',
    'excitement', 'frustration', 'breakthrough', 'uncertainty'
  )),
  content TEXT NOT NULL,
  colour TEXT NOT NULL,
  linked_clip_id UUID REFERENCES timeline_clips(id) ON DELETE SET NULL,

  created_by TEXT NOT NULL, -- user_id or 'system'
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Card-Clip Links junction table (many-to-many)
CREATE TABLE IF NOT EXISTS card_clip_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID REFERENCES analogue_cards(id) ON DELETE CASCADE,
  clip_id UUID REFERENCES timeline_clips(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(card_id, clip_id)
);

-- Indexes for performance
CREATE INDEX idx_timeline_states_campaign ON timeline_states(campaign_id);
CREATE INDEX idx_timeline_states_user ON timeline_states(user_id);
CREATE INDEX idx_timeline_tracks_timeline ON timeline_tracks(timeline_state_id);
CREATE INDEX idx_timeline_clips_track ON timeline_clips(track_id);
CREATE INDEX idx_analogue_cards_campaign ON analogue_cards(campaign_id);
CREATE INDEX idx_analogue_cards_user ON analogue_cards(user_id);
CREATE INDEX idx_analogue_cards_clip ON analogue_cards(linked_clip_id);
CREATE INDEX idx_card_clip_links_card ON card_clip_links(card_id);
CREATE INDEX idx_card_clip_links_clip ON card_clip_links(clip_id);

-- Row Level Security (RLS) Policies

-- Timeline States RLS
ALTER TABLE timeline_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own timeline states"
  ON timeline_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own timeline states"
  ON timeline_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timeline states"
  ON timeline_states FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timeline states"
  ON timeline_states FOR DELETE
  USING (auth.uid() = user_id);

-- Timeline Tracks RLS
ALTER TABLE timeline_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tracks in their timelines"
  ON timeline_tracks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM timeline_states
      WHERE timeline_states.id = timeline_tracks.timeline_state_id
      AND timeline_states.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tracks in their timelines"
  ON timeline_tracks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM timeline_states
      WHERE timeline_states.id = timeline_tracks.timeline_state_id
      AND timeline_states.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tracks in their timelines"
  ON timeline_tracks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM timeline_states
      WHERE timeline_states.id = timeline_tracks.timeline_state_id
      AND timeline_states.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tracks in their timelines"
  ON timeline_tracks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM timeline_states
      WHERE timeline_states.id = timeline_tracks.timeline_state_id
      AND timeline_states.user_id = auth.uid()
    )
  );

-- Timeline Clips RLS
ALTER TABLE timeline_clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view clips in their tracks"
  ON timeline_clips FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM timeline_tracks
      JOIN timeline_states ON timeline_states.id = timeline_tracks.timeline_state_id
      WHERE timeline_tracks.id = timeline_clips.track_id
      AND timeline_states.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert clips in their tracks"
  ON timeline_clips FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM timeline_tracks
      JOIN timeline_states ON timeline_states.id = timeline_tracks.timeline_state_id
      WHERE timeline_tracks.id = timeline_clips.track_id
      AND timeline_states.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update clips in their tracks"
  ON timeline_clips FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM timeline_tracks
      JOIN timeline_states ON timeline_states.id = timeline_tracks.timeline_state_id
      WHERE timeline_tracks.id = timeline_clips.track_id
      AND timeline_states.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete clips in their tracks"
  ON timeline_clips FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM timeline_tracks
      JOIN timeline_states ON timeline_states.id = timeline_tracks.timeline_state_id
      WHERE timeline_tracks.id = timeline_clips.track_id
      AND timeline_states.user_id = auth.uid()
    )
  );

-- Analogue Cards RLS
ALTER TABLE analogue_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cards"
  ON analogue_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cards"
  ON analogue_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards"
  ON analogue_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards"
  ON analogue_cards FOR DELETE
  USING (auth.uid() = user_id);

-- Card-Clip Links RLS
ALTER TABLE card_clip_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their card-clip links"
  ON card_clip_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analogue_cards
      WHERE analogue_cards.id = card_clip_links.card_id
      AND analogue_cards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their card-clip links"
  ON card_clip_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM analogue_cards
      WHERE analogue_cards.id = card_clip_links.card_id
      AND analogue_cards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their card-clip links"
  ON card_clip_links FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM analogue_cards
      WHERE analogue_cards.id = card_clip_links.card_id
      AND analogue_cards.user_id = auth.uid()
    )
  );

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_timeline_states_updated_at
  BEFORE UPDATE ON timeline_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_tracks_updated_at
  BEFORE UPDATE ON timeline_tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_clips_updated_at
  BEFORE UPDATE ON timeline_clips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analogue_cards_updated_at
  BEFORE UPDATE ON analogue_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
