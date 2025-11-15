-- LoopOS Phase 5: Creator Intelligence Expansion
-- Migration: Creative Packs, Playbook, Moodboards, Flow Sessions, Auto-Chains
-- Date: 2025-11-15

-- =============================================
-- 1. CREATIVE PACKS
-- =============================================

CREATE TABLE IF NOT EXISTS creative_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pack_type TEXT NOT NULL CHECK (pack_type IN (
    'release',
    'promo',
    'audience-growth',
    'creative-sprint',
    'social-accelerator',
    'press-pr',
    'tiktok-momentum'
  )),
  description TEXT,
  is_template BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  sequences JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  micro_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  insights JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_prompts JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for creative_packs
ALTER TABLE creative_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own packs"
  ON creative_packs FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own packs"
  ON creative_packs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own packs"
  ON creative_packs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own packs"
  ON creative_packs FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for creative_packs
CREATE INDEX idx_creative_packs_user_id ON creative_packs(user_id);
CREATE INDEX idx_creative_packs_pack_type ON creative_packs(pack_type);
CREATE INDEX idx_creative_packs_is_template ON creative_packs(is_template);
CREATE INDEX idx_creative_packs_is_public ON creative_packs(is_public);

-- Updated timestamp trigger for creative_packs
CREATE TRIGGER set_creative_packs_updated_at
  BEFORE UPDATE ON creative_packs
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- =============================================
-- 2. PLAYBOOK CHAPTERS
-- =============================================

CREATE TABLE IF NOT EXISTS playbook_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'release-strategy',
    'promo-strategy',
    'growth-strategy',
    'pr-strategy',
    'social-strategy',
    'audience-strategy',
    'creative-process',
    'custom'
  )),
  content TEXT NOT NULL,
  is_ai_generated BOOLEAN DEFAULT false,
  is_favourite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  related_nodes UUID[] DEFAULT ARRAY[]::UUID[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for playbook_chapters
ALTER TABLE playbook_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chapters"
  ON playbook_chapters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chapters"
  ON playbook_chapters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chapters"
  ON playbook_chapters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chapters"
  ON playbook_chapters FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for playbook_chapters
CREATE INDEX idx_playbook_chapters_user_id ON playbook_chapters(user_id);
CREATE INDEX idx_playbook_chapters_category ON playbook_chapters(category);
CREATE INDEX idx_playbook_chapters_is_favourite ON playbook_chapters(is_favourite);

-- Updated timestamp trigger for playbook_chapters
CREATE TRIGGER set_playbook_chapters_updated_at
  BEFORE UPDATE ON playbook_chapters
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- =============================================
-- 3. MOODBOARDS
-- =============================================

CREATE TABLE IF NOT EXISTS moodboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  colour_palette JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  ai_summary TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS moodboard_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodboard_id UUID REFERENCES moodboards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('image', 'colour', 'text', 'link')),
  image_url TEXT,
  storage_path TEXT,
  colour_hex TEXT,
  text_content TEXT,
  external_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  position JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for moodboards
ALTER TABLE moodboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own moodboards"
  ON moodboards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own moodboards"
  ON moodboards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own moodboards"
  ON moodboards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own moodboards"
  ON moodboards FOR DELETE
  USING (auth.uid() = user_id);

-- RLS for moodboard_items
ALTER TABLE moodboard_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own moodboard items"
  ON moodboard_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own moodboard items"
  ON moodboard_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own moodboard items"
  ON moodboard_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own moodboard items"
  ON moodboard_items FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for moodboards
CREATE INDEX idx_moodboards_user_id ON moodboards(user_id);
CREATE INDEX idx_moodboards_is_archived ON moodboards(is_archived);

-- Indexes for moodboard_items
CREATE INDEX idx_moodboard_items_moodboard_id ON moodboard_items(moodboard_id);
CREATE INDEX idx_moodboard_items_user_id ON moodboard_items(user_id);
CREATE INDEX idx_moodboard_items_item_type ON moodboard_items(item_type);

-- Updated timestamp trigger for moodboards
CREATE TRIGGER set_moodboards_updated_at
  BEFORE UPDATE ON moodboards
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- =============================================
-- 4. FLOW SESSIONS
-- =============================================

CREATE TABLE IF NOT EXISTS flow_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
  deep_work_detected BOOLEAN DEFAULT false,
  interruptions INTEGER DEFAULT 0,
  nodes_worked_on UUID[] DEFAULT ARRAY[]::UUID[],
  peak_flow_time TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for flow_sessions
ALTER TABLE flow_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own flow sessions"
  ON flow_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flow sessions"
  ON flow_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flow sessions"
  ON flow_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flow sessions"
  ON flow_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for flow_sessions
CREATE INDEX idx_flow_sessions_user_id ON flow_sessions(user_id);
CREATE INDEX idx_flow_sessions_started_at ON flow_sessions(started_at);
CREATE INDEX idx_flow_sessions_engagement_score ON flow_sessions(engagement_score);

-- =============================================
-- 5. AUTO-CHAINS
-- =============================================

CREATE TABLE IF NOT EXISTS auto_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  chain_type TEXT NOT NULL CHECK (chain_type IN (
    'predicted-sequence',
    'dependency-chain',
    'campaign-timeline',
    'custom'
  )),
  nodes UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  auto_generated BOOLEAN DEFAULT false,
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for auto_chains
ALTER TABLE auto_chains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own auto-chains"
  ON auto_chains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own auto-chains"
  ON auto_chains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own auto-chains"
  ON auto_chains FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own auto-chains"
  ON auto_chains FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for auto_chains
CREATE INDEX idx_auto_chains_user_id ON auto_chains(user_id);
CREATE INDEX idx_auto_chains_chain_type ON auto_chains(chain_type);
CREATE INDEX idx_auto_chains_auto_generated ON auto_chains(auto_generated);

-- Updated timestamp trigger for auto_chains
CREATE TRIGGER set_auto_chains_updated_at
  BEFORE UPDATE ON auto_chains
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- =============================================
-- 6. STORAGE BUCKET FOR MOODBOARDS
-- =============================================

-- Create storage bucket for moodboard images
INSERT INTO storage.buckets (id, name, public)
VALUES ('moodboards', 'moodboards', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for moodboards bucket
CREATE POLICY "Users can upload their own moodboard images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'moodboards' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own moodboard images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'moodboards' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own moodboard images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'moodboards' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own moodboard images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'moodboards' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- COMPLETE
-- =============================================

-- Phase 5 Creator Intelligence Migration Complete
-- Tables Created:
--   1. creative_packs (7 pack types)
--   2. playbook_chapters (8 categories)
--   3. moodboards + moodboard_items (visual inspiration)
--   4. flow_sessions (flow state tracking)
--   5. auto_chains (AI sequence generation)
--   6. Storage bucket: moodboards
