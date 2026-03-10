-- Dashboard Tables Migration
-- Created: 1st December 2025
-- Purpose: Add tables for campaign contacts, coverage events, patterns, and actions

-- ================================================
-- Table: campaign_contacts
-- Purpose: Track contacts targeted in campaigns
-- ================================================
CREATE TABLE IF NOT EXISTS campaign_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  campaign_id UUID REFERENCES campaigns ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_type TEXT, -- radio_dj, playlist_curator, press, blogger
  organisation TEXT,
  genre_fit DECIMAL(3,2), -- 0.0 to 1.0
  status TEXT DEFAULT 'pending', -- pending, sent, opened, replied, bounced
  enrichment_data JSONB,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_user_id ON campaign_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_campaign_id ON campaign_contacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_status ON campaign_contacts(status);

-- ================================================
-- Table: coverage_events
-- Purpose: Track geographic/coverage achievements
-- ================================================
CREATE TABLE IF NOT EXISTS coverage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  campaign_id UUID REFERENCES campaigns ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- play, mention, feature, spin, add
  outlet_type TEXT, -- radio, streaming, press, blog
  outlet_name TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  coverage_score DECIMAL(3,2) DEFAULT 0.5,
  confidence DECIMAL(3,2),
  event_date TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_coverage_events_user_id ON coverage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_coverage_events_campaign_id ON coverage_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_coverage_events_event_type ON coverage_events(event_type);
CREATE INDEX IF NOT EXISTS idx_coverage_events_country ON coverage_events(country);

-- ================================================
-- Table: campaign_patterns
-- Purpose: Detected patterns and insights
-- ================================================
CREATE TABLE IF NOT EXISTS campaign_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  campaign_id UUID REFERENCES campaigns ON DELETE CASCADE,
  pattern_type TEXT, -- engagement_trend, timing, outlet_type, genre
  pattern_text TEXT NOT NULL,
  confidence DECIMAL(3,2),
  impact_score TEXT, -- high, medium, low
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_campaign_patterns_user_id ON campaign_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_patterns_campaign_id ON campaign_patterns(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_patterns_impact_score ON campaign_patterns(impact_score);

-- ================================================
-- Table: campaign_actions
-- Purpose: Recommended next actions
-- ================================================
CREATE TABLE IF NOT EXISTS campaign_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  campaign_id UUID REFERENCES campaigns ON DELETE CASCADE,
  action_text TEXT NOT NULL,
  priority TEXT DEFAULT 'medium', -- high, medium, low
  category TEXT, -- outreach, content, promo, timing, maintenance
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, dismissed
  due_date TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_campaign_actions_user_id ON campaign_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_actions_campaign_id ON campaign_actions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_actions_status ON campaign_actions(status);
CREATE INDEX IF NOT EXISTS idx_campaign_actions_priority ON campaign_actions(priority);

-- ================================================
-- RLS Policies: User-scoped access only
-- ================================================

-- Enable RLS on all tables
ALTER TABLE campaign_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coverage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_actions ENABLE ROW LEVEL SECURITY;

-- campaign_contacts policies
CREATE POLICY "Users can view own contacts"
  ON campaign_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON campaign_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON campaign_contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON campaign_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- coverage_events policies
CREATE POLICY "Users can view own coverage events"
  ON coverage_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coverage events"
  ON coverage_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coverage events"
  ON coverage_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own coverage events"
  ON coverage_events FOR DELETE
  USING (auth.uid() = user_id);

-- campaign_patterns policies
CREATE POLICY "Users can view own patterns"
  ON campaign_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own patterns"
  ON campaign_patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patterns"
  ON campaign_patterns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own patterns"
  ON campaign_patterns FOR DELETE
  USING (auth.uid() = user_id);

-- campaign_actions policies
CREATE POLICY "Users can view own actions"
  ON campaign_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own actions"
  ON campaign_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own actions"
  ON campaign_actions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own actions"
  ON campaign_actions FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================
-- Updated at trigger function (reuse if exists)
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to campaign_contacts
DROP TRIGGER IF EXISTS update_campaign_contacts_updated_at ON campaign_contacts;
CREATE TRIGGER update_campaign_contacts_updated_at
  BEFORE UPDATE ON campaign_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
