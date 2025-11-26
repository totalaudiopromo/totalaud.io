-- Scout Contact & Opportunity Schema
-- Phase 4: Workspace pivot - real data integration
-- Created: 2025-11-26

-- ============================================
-- CONTACTS TABLE (shared curated database)
-- ============================================
-- This is a shared database of music industry contacts
-- All authenticated users can read, but only admins can modify

CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'playlist', 'blog', 'radio', 'youtube', 'podcast', 'curator', 'press', etc.
  email TEXT,
  submission_url TEXT,
  genres TEXT[] DEFAULT '{}',
  region TEXT DEFAULT 'UK',
  notes TEXT,
  verified BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'manual',  -- 'manual', 'scraped', 'api'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- OPPORTUNITIES TABLE (user-specific)
-- ============================================
-- User-specific opportunities discovered by Scout
-- Each user has their own list of saved/tracked opportunities

CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,

  -- Search context (what query found this)
  search_track_title TEXT NOT NULL,
  search_genres TEXT[] NOT NULL,
  search_vibe TEXT,
  search_goals TEXT[] NOT NULL,

  -- Opportunity details
  type TEXT NOT NULL CHECK (type IN ('playlist', 'blog', 'radio', 'youtube', 'podcast')),
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_submission_url TEXT,
  relevance_score INTEGER DEFAULT 50 CHECK (relevance_score >= 0 AND relevance_score <= 100),
  genres TEXT[] DEFAULT '{}',
  pitch_tips TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'database' CHECK (source IN ('database', 'scraped', 'api')),

  -- Status tracking
  status TEXT DEFAULT 'discovered' CHECK (status IN ('discovered', 'saved', 'pitched', 'responded', 'archived')),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

-- Contacts indexes
CREATE INDEX IF NOT EXISTS idx_contacts_type ON public.contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_genres ON public.contacts USING GIN(genres);
CREATE INDEX IF NOT EXISTS idx_contacts_region ON public.contacts(region);

-- Opportunities indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON public.opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON public.opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON public.opportunities(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Contacts RLS: All authenticated users can read (shared database)
CREATE POLICY "Authenticated users can view contacts"
  ON public.contacts FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role can manage contacts (for admin/seeding)
CREATE POLICY "Service role can manage contacts"
  ON public.contacts FOR ALL
  USING (auth.role() = 'service_role');

-- Opportunities RLS: Users can only access their own
CREATE POLICY "Users can view their own opportunities"
  ON public.opportunities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own opportunities"
  ON public.opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own opportunities"
  ON public.opportunities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own opportunities"
  ON public.opportunities FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Reuse existing handle_updated_at function from console tables migration
-- If it doesn't exist, create it
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.contacts IS 'Curated database of UK music industry contacts for Scout discovery';
COMMENT ON TABLE public.opportunities IS 'User-specific opportunities discovered and tracked by Scout wizard';

COMMENT ON COLUMN public.contacts.type IS 'Contact category: playlist, blog, radio, youtube, podcast, curator, press, etc.';
COMMENT ON COLUMN public.contacts.source IS 'How the contact was added: manual, scraped, or api';
COMMENT ON COLUMN public.contacts.verified IS 'Whether the contact info has been verified as accurate';

COMMENT ON COLUMN public.opportunities.status IS 'Workflow status: discovered, saved, pitched, responded, archived';
COMMENT ON COLUMN public.opportunities.source IS 'Where the opportunity came from: database, scraped, api';
