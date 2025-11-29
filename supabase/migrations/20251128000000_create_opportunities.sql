-- Migration: Create opportunities table for Scout Mode
-- Purpose: Store curated opportunities (radio, playlists, blogs, curators, press)
-- GDPR compliant with source tracking and verification timestamps

-- Create the opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core fields
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('radio', 'playlist', 'blog', 'curator', 'press')),

  -- Targeting
  genres TEXT[] DEFAULT '{}',
  vibes TEXT[] DEFAULT '{}',
  audience_size TEXT CHECK (audience_size IN ('small', 'medium', 'large')),

  -- Contact info (GDPR: corporate emails only)
  url TEXT,
  contact_email TEXT,
  contact_name TEXT,

  -- Metadata
  importance INT DEFAULT 1 CHECK (importance >= 1 AND importance <= 5),
  description TEXT,

  -- Source tracking (GDPR compliance)
  source TEXT DEFAULT 'curated' CHECK (source IN ('curated', 'airtable', 'manual', 'research')),
  source_url TEXT,
  last_verified_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add table comment
COMMENT ON TABLE opportunities IS 'Curated opportunities for Scout Mode - radio stations, playlists, blogs, curators, and press contacts';

-- Column comments for GDPR documentation
COMMENT ON COLUMN opportunities.contact_email IS 'Corporate email addresses only (GDPR: legitimate interest for B2B)';
COMMENT ON COLUMN opportunities.source IS 'Data provenance: curated (manual research), airtable (imported), manual (user added), research (AI research)';
COMMENT ON COLUMN opportunities.source_url IS 'URL where this data was sourced from (GDPR: accountability)';
COMMENT ON COLUMN opportunities.last_verified_at IS 'When this record was last verified as accurate (GDPR: data accuracy)';

-- Enable Row Level Security
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can read active opportunities
CREATE POLICY "Authenticated users can read active opportunities"
  ON opportunities
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policy: Service role can do everything (for seeding/admin)
CREATE POLICY "Service role has full access"
  ON opportunities
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes for efficient filtering
CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_opportunities_genres ON opportunities USING GIN(genres);
CREATE INDEX idx_opportunities_vibes ON opportunities USING GIN(vibes);
CREATE INDEX idx_opportunities_audience_size ON opportunities(audience_size);
CREATE INDEX idx_opportunities_active ON opportunities(is_active) WHERE is_active = true;
CREATE INDEX idx_opportunities_source ON opportunities(source);

-- Composite index for common filter combinations
CREATE INDEX idx_opportunities_type_active ON opportunities(type, is_active) WHERE is_active = true;

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_opportunities_timestamp
  BEFORE UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_opportunities_updated_at();

-- Grant permissions
GRANT SELECT ON opportunities TO authenticated;
GRANT ALL ON opportunities TO service_role;
