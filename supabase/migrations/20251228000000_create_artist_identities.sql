-- Artist Identities Table
-- Stores brand voice, creative profile, and EPK fragments for Pitch Mode
-- Used by identity-kernel integration

CREATE TABLE artist_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Brand Voice
  brand_tone TEXT,
  brand_themes TEXT[] DEFAULT '{}',
  brand_style TEXT,
  key_phrases TEXT[] DEFAULT '{}',

  -- Creative Profile
  primary_motifs TEXT[] DEFAULT '{}',
  emotional_range TEXT,
  unique_elements TEXT[] DEFAULT '{}',

  -- EPK Fragments
  one_liner TEXT,
  press_angle TEXT,
  pitch_hook TEXT,
  comparisons TEXT[] DEFAULT '{}',

  -- Auto-generated bios
  bio_short TEXT,
  bio_long TEXT,

  -- Metadata
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE artist_identities ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own identity
CREATE POLICY "Users manage own identity"
  ON artist_identities
  FOR ALL
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_artist_identities_user_id ON artist_identities(user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_artist_identities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER artist_identities_updated_at
  BEFORE UPDATE ON artist_identities
  FOR EACH ROW
  EXECUTE FUNCTION update_artist_identities_updated_at();

-- Comment for documentation
COMMENT ON TABLE artist_identities IS 'Stores artist brand voice, creative profile, and EPK fragments for AI-powered pitch generation';
