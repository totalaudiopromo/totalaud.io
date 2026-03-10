-- ============================================================================
-- totalaud.io — Clean Schema
-- Single migration for fresh Supabase project (mpkittuuknpjigxjnnme)
-- 10 March 2026
--
-- This replaces 47 legacy migrations with a single clean schema containing
-- only the tables actively used by the workspace codebase.
-- ============================================================================


-- ============================================================================
-- 0. Utility Functions
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 1. User Profiles
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Theme / Preferences
  ui_mode TEXT CHECK (ui_mode IN ('ascii', 'xp', 'aqua', 'ableton', 'punk')),
  sound_enabled BOOLEAN DEFAULT false,
  sound_volume NUMERIC DEFAULT 0.3 CHECK (sound_volume >= 0 AND sound_volume <= 1),
  custom_colors JSONB DEFAULT '{}'::jsonb,
  custom_fonts JSONB DEFAULT '{}'::jsonb,

  -- Onboarding Status
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step TEXT,
  onboarding_completed_at TIMESTAMPTZ,

  -- Onboarding Data (collected during Audio chat)
  artist_name TEXT,
  genre TEXT,
  vibe TEXT,
  project_type TEXT CHECK (project_type IN ('single', 'ep', 'album', 'none')),
  project_title TEXT,
  release_date DATE,
  primary_goal TEXT CHECK (primary_goal IN ('discover', 'plan', 'pitch', 'explore')),
  goals TEXT[] DEFAULT '{}',

  -- Subscription (Stripe)
  subscription_tier TEXT DEFAULT 'none',
  subscription_status TEXT CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'cancelled', NULL)),
  stripe_customer_id TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_profiles_onboarding ON user_profiles(onboarding_completed);
CREATE INDEX idx_user_profiles_genre ON user_profiles(genre);
CREATE INDEX idx_user_profiles_release_date ON user_profiles(release_date);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE user_profiles IS 'User preferences, onboarding data, and subscription status';


-- ============================================================================
-- 2. User Ideas (Ideas Mode)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  content TEXT NOT NULL,
  tag TEXT NOT NULL CHECK (tag IN ('content', 'brand', 'music', 'promo')),

  position_x FLOAT DEFAULT 100,
  position_y FLOAT DEFAULT 100,

  is_starter BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_user_ideas_user_id ON user_ideas(user_id);
CREATE INDEX idx_user_ideas_tag ON user_ideas(tag);
CREATE INDEX idx_user_ideas_created_at ON user_ideas(created_at DESC);

ALTER TABLE user_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own ideas"
  ON user_ideas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own ideas"
  ON user_ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ideas"
  ON user_ideas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ideas"
  ON user_ideas FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trigger_user_ideas_updated_at
  BEFORE UPDATE ON user_ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 3. User Timeline Events (Timeline Mode)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  lane TEXT NOT NULL CHECK (lane IN ('pre-release', 'release', 'promo', 'content', 'analytics')),
  title TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  colour TEXT DEFAULT '#3AA9BE',
  description TEXT,
  url TEXT,
  tags TEXT[] DEFAULT '{}',

  source TEXT NOT NULL CHECK (source IN ('manual', 'scout', 'sample')) DEFAULT 'manual',
  opportunity_id UUID,

  -- Signal thread linkage (added later in original schema)
  thread_id UUID,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_user_timeline_events_user_id ON user_timeline_events(user_id);
CREATE INDEX idx_user_timeline_events_lane ON user_timeline_events(lane);
CREATE INDEX idx_user_timeline_events_date ON user_timeline_events(event_date);
CREATE INDEX idx_user_timeline_events_created_at ON user_timeline_events(created_at DESC);

ALTER TABLE user_timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own timeline events"
  ON user_timeline_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own timeline events"
  ON user_timeline_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own timeline events"
  ON user_timeline_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own timeline events"
  ON user_timeline_events FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trigger_user_timeline_events_updated_at
  BEFORE UPDATE ON user_timeline_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 4. User Pitch Drafts (Pitch Mode)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_pitch_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,
  pitch_type TEXT NOT NULL CHECK (pitch_type IN ('radio', 'press', 'playlist', 'custom')),
  sections JSONB DEFAULT '[]'::jsonb NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_user_pitch_drafts_user_id ON user_pitch_drafts(user_id);
CREATE INDEX idx_user_pitch_drafts_type ON user_pitch_drafts(pitch_type);
CREATE INDEX idx_user_pitch_drafts_created_at ON user_pitch_drafts(created_at DESC);

ALTER TABLE user_pitch_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own pitch drafts"
  ON user_pitch_drafts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own pitch drafts"
  ON user_pitch_drafts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pitch drafts"
  ON user_pitch_drafts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pitch drafts"
  ON user_pitch_drafts FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trigger_user_pitch_drafts_updated_at
  BEFORE UPDATE ON user_pitch_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 5. User Workspace Preferences
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_workspace_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  ideas_view_mode TEXT DEFAULT 'canvas' CHECK (ideas_view_mode IN ('canvas', 'list')),
  ideas_sort_mode TEXT DEFAULT 'newest' CHECK (ideas_sort_mode IN ('newest', 'oldest', 'alpha')),
  ideas_has_seen_starters BOOLEAN DEFAULT FALSE,
  last_active_mode TEXT DEFAULT 'ideas' CHECK (last_active_mode IN ('ideas', 'scout', 'timeline', 'pitch')),

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_user_workspace_preferences_user_id ON user_workspace_preferences(user_id);

ALTER TABLE user_workspace_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON user_workspace_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own preferences"
  ON user_workspace_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences"
  ON user_workspace_preferences FOR UPDATE USING (auth.uid() = user_id);

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
    user_id, ideas_view_mode, ideas_sort_mode, ideas_has_seen_starters, last_active_mode
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
    updated_at = now()
  RETURNING * INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_user_workspace_preferences_updated_at
  BEFORE UPDATE ON user_workspace_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 6. Opportunities (Scout Mode)
-- ============================================================================

CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('playlist', 'blog', 'radio', 'press', 'curator')),
  description TEXT,

  genres TEXT[] NOT NULL DEFAULT '{}',
  vibes TEXT[] DEFAULT '{}',

  audience_size TEXT CHECK (audience_size IN ('small', 'medium', 'large', 'huge')),
  follower_count INT,

  url TEXT,
  contact_email TEXT,
  contact_name TEXT,
  contact_info JSONB,

  source TEXT DEFAULT 'curated',
  source_url TEXT,
  last_verified_at TIMESTAMPTZ,

  is_active BOOLEAN DEFAULT true,
  submission_open BOOLEAN DEFAULT true,
  submission_notes TEXT,
  importance INT DEFAULT 50,

  avg_response_time INTEGER,
  acceptance_rate NUMERIC(5,2),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- Authenticated users can browse active opportunities
CREATE POLICY "Authenticated users can read active opportunities"
  ON opportunities FOR SELECT
  USING (is_active = true);

-- Only service role can modify (manual curation via Studio)
CREATE POLICY "Only service role can modify opportunities"
  ON opportunities FOR ALL
  USING (false);

CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_opportunities_genres ON opportunities USING GIN(genres);
CREATE INDEX idx_opportunities_vibes ON opportunities USING GIN(vibes);
CREATE INDEX idx_opportunities_active ON opportunities(is_active) WHERE is_active = true;
CREATE INDEX idx_opportunities_importance ON opportunities(importance DESC);

CREATE TRIGGER trigger_opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

GRANT SELECT ON opportunities TO authenticated;
GRANT ALL ON opportunities TO service_role;

COMMENT ON TABLE opportunities IS 'Curated opportunities for Scout Mode - radio, playlists, blogs, curators, press';


-- ============================================================================
-- 7. Signal Threads
-- ============================================================================

CREATE TABLE IF NOT EXISTS signal_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  title TEXT NOT NULL,
  thread_type TEXT NOT NULL CHECK (thread_type IN ('narrative', 'campaign', 'creative', 'scene', 'performance')),
  colour TEXT DEFAULT '#3AA9BE',

  event_ids UUID[] DEFAULT '{}',

  narrative_summary TEXT,
  insights TEXT[] DEFAULT '{}',

  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_signal_threads_user_id ON signal_threads(user_id);
CREATE INDEX idx_signal_threads_type ON signal_threads(thread_type);
CREATE INDEX idx_signal_threads_created_at ON signal_threads(created_at DESC);

-- Add FK from timeline events to signal threads (now that both tables exist)
ALTER TABLE user_timeline_events
  ADD CONSTRAINT fk_timeline_thread
  FOREIGN KEY (thread_id) REFERENCES signal_threads(id) ON DELETE SET NULL;

CREATE INDEX idx_user_timeline_events_thread_id ON user_timeline_events(thread_id);

ALTER TABLE signal_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own threads"
  ON signal_threads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own threads"
  ON signal_threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own threads"
  ON signal_threads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own threads"
  ON signal_threads FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trigger_signal_threads_updated_at
  BEFORE UPDATE ON signal_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper: Recalculate thread date range from linked events
CREATE OR REPLACE FUNCTION recalculate_thread_dates(p_thread_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE signal_threads
  SET
    start_date = (SELECT MIN(event_date) FROM user_timeline_events WHERE thread_id = p_thread_id),
    end_date = (SELECT MAX(event_date) FROM user_timeline_events WHERE thread_id = p_thread_id),
    event_ids = (SELECT COALESCE(array_agg(id ORDER BY event_date), '{}') FROM user_timeline_events WHERE thread_id = p_thread_id),
    updated_at = now()
  WHERE id = p_thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update thread dates when events change
CREATE OR REPLACE FUNCTION sync_thread_on_event_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.thread_id IS DISTINCT FROM NEW.thread_id) THEN
    IF OLD.thread_id IS NOT NULL THEN
      PERFORM recalculate_thread_dates(OLD.thread_id);
    END IF;
  END IF;

  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.thread_id IS DISTINCT FROM NEW.thread_id) THEN
    IF NEW.thread_id IS NOT NULL THEN
      PERFORM recalculate_thread_dates(NEW.thread_id);
    END IF;
  END IF;

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
  FOR EACH ROW EXECUTE FUNCTION sync_thread_on_event_change();


-- ============================================================================
-- 8. Artist Identities (Identity Kernel)
-- ============================================================================

CREATE TABLE IF NOT EXISTS artist_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  brand_tone TEXT,
  brand_themes TEXT[] DEFAULT '{}',
  brand_style TEXT,
  key_phrases TEXT[] DEFAULT '{}',

  primary_motifs TEXT[] DEFAULT '{}',
  emotional_range TEXT,
  unique_elements TEXT[] DEFAULT '{}',

  one_liner TEXT,
  press_angle TEXT,
  pitch_hook TEXT,
  comparisons TEXT[] DEFAULT '{}',

  bio_short TEXT,
  bio_long TEXT,

  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE artist_identities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own identity"
  ON artist_identities FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_artist_identities_user_id ON artist_identities(user_id);

CREATE TRIGGER trigger_artist_identities_updated_at
  BEFORE UPDATE ON artist_identities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 9. Agent Manifests (Agent Spawning)
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('scout', 'coach', 'tracker', 'insight', 'custom')),
  personality TEXT,
  colour TEXT DEFAULT '#6366f1',
  sound_profile JSONB DEFAULT '{"start": 440, "complete": 880, "error": 220}'::jsonb,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT unique_agent_name_per_user UNIQUE (user_id, name)
);

CREATE INDEX idx_agent_manifests_user_id ON agent_manifests(user_id);
CREATE INDEX idx_agent_manifests_role ON agent_manifests(role);
CREATE INDEX idx_agent_manifests_active ON agent_manifests(is_active) WHERE is_active = true;

ALTER TABLE agent_manifests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agents"
  ON agent_manifests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own agents"
  ON agent_manifests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agents"
  ON agent_manifests FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own agents"
  ON agent_manifests FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trigger_agent_manifests_updated_at
  BEFORE UPDATE ON agent_manifests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 10. User Credits (Pay-per-contact enrichment)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  balance_pence INTEGER NOT NULL DEFAULT 0 CHECK (balance_pence >= 0),
  total_purchased_pence INTEGER NOT NULL DEFAULT 0,
  total_spent_pence INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  amount_pence INTEGER NOT NULL,
  balance_after_pence INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'enrichment', 'refund', 'bonus')),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credits row"
  ON user_credits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own credits"
  ON user_credits FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions"
  ON credit_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Atomic deduct function (prevents race conditions)
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount_pence INTEGER,
  p_description TEXT DEFAULT 'Contact enrichment',
  p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  SELECT balance_pence INTO v_current_balance
  FROM user_credits WHERE user_id = p_user_id FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_credits_record');
  END IF;

  IF v_current_balance < p_amount_pence THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_funds', 'current_balance', v_current_balance, 'required', p_amount_pence);
  END IF;

  v_new_balance := v_current_balance - p_amount_pence;

  UPDATE user_credits SET balance_pence = v_new_balance, total_spent_pence = total_spent_pence + p_amount_pence WHERE user_id = p_user_id;

  INSERT INTO credit_transactions (user_id, amount_pence, balance_after_pence, transaction_type, description, metadata)
  VALUES (p_user_id, -p_amount_pence, v_new_balance, 'enrichment', p_description, p_metadata)
  RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object('success', true, 'transaction_id', v_transaction_id, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add credits function
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount_pence INTEGER,
  p_transaction_type TEXT DEFAULT 'purchase',
  p_description TEXT DEFAULT 'Credits purchased',
  p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  IF p_transaction_type NOT IN ('purchase', 'refund', 'bonus') THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_transaction_type');
  END IF;

  INSERT INTO user_credits (user_id, balance_pence, total_purchased_pence)
  VALUES (p_user_id, p_amount_pence, p_amount_pence)
  ON CONFLICT (user_id) DO UPDATE SET
    balance_pence = user_credits.balance_pence + p_amount_pence,
    total_purchased_pence = user_credits.total_purchased_pence + p_amount_pence
  RETURNING balance_pence INTO v_new_balance;

  INSERT INTO credit_transactions (user_id, amount_pence, balance_after_pence, transaction_type, description, metadata)
  VALUES (p_user_id, p_amount_pence, v_new_balance, p_transaction_type, p_description, p_metadata)
  RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object('success', true, 'transaction_id', v_transaction_id, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION deduct_credits TO authenticated;
GRANT EXECUTE ON FUNCTION add_credits TO authenticated;

CREATE TRIGGER trigger_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 11. Stripe Webhook Events (Idempotency)
-- ============================================================================

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stripe_webhook_events_event_id ON stripe_webhook_events(event_id);
CREATE INDEX idx_stripe_webhook_events_processed_at ON stripe_webhook_events(processed_at);

ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;
-- No policies = service role only (webhook uses service role key)


-- ============================================================================
-- 12. Waitlist (Landing Page)
-- ============================================================================

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'landing_page',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_source ON waitlist(source);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at DESC);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can signup for waitlist"
  ON waitlist FOR INSERT WITH CHECK (true);

CREATE POLICY "Only service role can read waitlist"
  ON waitlist FOR SELECT USING (false);

CREATE TRIGGER trigger_waitlist_updated_at
  BEFORE UPDATE ON waitlist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 13. Seed Data: Opportunities (50 curated UK music contacts)
-- ============================================================================

INSERT INTO opportunities (name, type, genres, vibes, audience_size, url, description, submission_notes, importance) VALUES
  -- PLAYLISTS
  ('Indie Vibes', 'playlist', ARRAY['indie', 'alternative'], ARRAY['chill', 'mellow'], 'medium', 'https://open.spotify.com/playlist/example1', 'Curated indie playlist for bedroom pop and lo-fi artists', 'Submit via SubmitHub', 50),
  ('Electronic Dreams', 'playlist', ARRAY['electronic', 'ambient'], ARRAY['dreamy', 'atmospheric'], 'large', 'https://open.spotify.com/playlist/example2', 'Electronic and ambient new releases', 'Direct email preferred', 55),
  ('Fresh Finds UK', 'playlist', ARRAY['indie', 'rock', 'pop'], ARRAY['upbeat', 'energetic'], 'huge', 'https://open.spotify.com/playlist/example3', 'Official Spotify Fresh Finds UK edition', 'Apply through Spotify for Artists', 90),
  ('Coffee Shop Acoustics', 'playlist', ARRAY['acoustic', 'folk'], ARRAY['calm', 'peaceful'], 'medium', 'https://open.spotify.com/playlist/example4', 'Acoustic guitar and gentle vocals', 'Open submissions via link', 45),
  ('Underground Techno', 'playlist', ARRAY['techno', 'electronic'], ARRAY['dark', 'energetic'], 'small', 'https://open.spotify.com/playlist/example5', 'Underground techno and minimal', 'DM on Instagram', 35),
  ('Indie Sleaze Revival', 'playlist', ARRAY['indie', 'rock'], ARRAY['edgy', 'nostalgic'], 'medium', 'https://open.spotify.com/playlist/example6', '2000s indie vibes', 'SubmitHub only', 45),
  ('Bedroom Pop Collective', 'playlist', ARRAY['indie', 'pop'], ARRAY['lo-fi', 'intimate'], 'large', 'https://open.spotify.com/playlist/example7', 'DIY bedroom pop artists', 'Email with streaming links', 55),
  ('Jazz Fusion Explorations', 'playlist', ARRAY['jazz', 'fusion'], ARRAY['sophisticated', 'experimental'], 'small', 'https://open.spotify.com/playlist/example8', 'Modern jazz fusion', 'Monthly submissions', 35),
  ('UK Garage Essentials', 'playlist', ARRAY['garage', 'electronic'], ARRAY['groovy', 'upbeat'], 'medium', 'https://open.spotify.com/playlist/example9', 'UKG and 2-step', 'Closed submissions', 40),
  ('Post-Rock Atmosphere', 'playlist', ARRAY['post-rock', 'instrumental'], ARRAY['cinematic', 'emotional'], 'medium', 'https://open.spotify.com/playlist/example10', 'Instrumental post-rock', 'Submit via Toneden', 40),
  ('Indie Folk Central', 'playlist', ARRAY['folk', 'indie', 'acoustic'], ARRAY['warm', 'organic'], 'large', 'https://open.spotify.com/playlist/example11', 'Independent folk playlist curator', 'SubmitHub', 50),
  ('Chill Nation', 'playlist', ARRAY['electronic', 'chill'], ARRAY['relaxed', 'mellow'], 'huge', 'https://open.spotify.com/playlist/example12', 'Massive chill electronic playlist', 'Closed submissions', 70),
  ('alexrainbirdMusic', 'playlist', ARRAY['indie', 'folk'], ARRAY['acoustic', 'indie'], 'large', 'https://open.spotify.com/playlist/example13', 'YouTube and Spotify curator', 'Email submissions', 60),

  -- BLOGS
  ('The Line of Best Fit', 'blog', ARRAY['indie', 'alternative', 'electronic'], ARRAY[]::text[], 'huge', 'https://www.thelineofbestfit.com', 'Leading UK music blog covering indie and alternative', 'Email press team', 90),
  ('DIY Magazine', 'blog', ARRAY['indie', 'rock', 'pop'], ARRAY[]::text[], 'huge', 'https://diymag.com', 'UK music and culture magazine', 'Submit via press contact', 85),
  ('The Quietus', 'blog', ARRAY['experimental', 'electronic', 'rock'], ARRAY['avant-garde', 'challenging'], 'large', 'https://thequietus.com', 'In-depth music journalism', 'Pitch stories to editors', 80),
  ('Earmilk', 'blog', ARRAY['electronic', 'hip-hop', 'indie'], ARRAY[]::text[], 'large', 'https://earmilk.com', 'Music discovery and culture', 'Submit via contact form', 65),
  ('Indie Shuffle', 'blog', ARRAY['indie', 'electronic', 'pop'], ARRAY[]::text[], 'large', 'https://www.indieshuffle.com', 'Music blog and playlist curator', 'SubmitHub submissions', 60),
  ('Atwood Magazine', 'blog', ARRAY['indie', 'folk', 'singer-songwriter'], ARRAY['intimate', 'thoughtful'], 'medium', 'https://atwoodmagazine.com', 'Independent music magazine', 'Email with EPK', 55),
  ('Clash Magazine', 'blog', ARRAY['indie', 'rock', 'electronic'], ARRAY[]::text[], 'huge', 'https://www.clashmusic.com', 'Music and style magazine', 'Via management or PR only', 85),
  ('Consequence', 'blog', ARRAY['rock', 'indie', 'alternative'], ARRAY[]::text[], 'huge', 'https://consequence.net', 'Music news and reviews', 'Submit to editors', 75),
  ('Stereogum', 'blog', ARRAY['indie', 'rock', 'pop'], ARRAY[]::text[], 'huge', 'https://www.stereogum.com', 'Music blog and news site', 'Closed submissions', 80),
  ('BrooklynVegan', 'blog', ARRAY['indie', 'rock', 'punk'], ARRAY['edgy'], 'large', 'https://www.brooklynvegan.com', 'NYC-based music blog', 'Submit via contact', 70),
  ('Hypebeast Music', 'blog', ARRAY['hip-hop', 'electronic', 'experimental'], ARRAY['cutting-edge'], 'huge', 'https://hypebeast.com/music', 'Culture and music coverage', 'Via PR agencies', 75),
  ('Resident Advisor', 'blog', ARRAY['techno', 'house', 'electronic'], ARRAY[]::text[], 'huge', 'https://ra.co', 'Electronic music magazine', 'Submit events and music', 85),
  ('Pitchfork', 'blog', ARRAY['indie', 'rock', 'electronic', 'hip-hop'], ARRAY[]::text[], 'huge', 'https://pitchfork.com', 'Music journalism and reviews', 'Closed submissions', 95),
  ('For The Rabbits', 'blog', ARRAY['indie', 'folk', 'acoustic'], ARRAY['intimate'], 'medium', 'https://fortherabbits.net', 'Independent music blog', 'Email submissions', 45),
  ('All Things Go', 'blog', ARRAY['indie', 'pop', 'electronic'], ARRAY[]::text[], 'large', 'https://allthingsgomusic.com', 'Music blog and festival', 'Submit via contact', 60),
  ('Pigeons & Planes', 'blog', ARRAY['hip-hop', 'electronic', 'indie'], ARRAY['forward-thinking'], 'huge', 'https://pigeonsandplanes.com', 'Music and culture site', 'Via PR', 75),
  ('The FADER', 'blog', ARRAY['hip-hop', 'rnb', 'electronic'], ARRAY[]::text[], 'huge', 'https://www.thefader.com', 'Music and culture magazine', 'Via management/PR', 85),
  ('Crack Magazine', 'blog', ARRAY['electronic', 'experimental', 'indie'], ARRAY['underground'], 'large', 'https://crackmagazine.net', 'UK music and culture', 'Email submissions', 70),

  -- RADIO
  ('BBC Radio 6 Music', 'radio', ARRAY['indie', 'alternative', 'rock'], ARRAY[]::text[], 'huge', 'https://www.bbc.co.uk/6music', 'BBC alternative music station', 'Via BBC Introducing', 95),
  ('BBC Introducing', 'radio', ARRAY['all'], ARRAY[]::text[], 'huge', 'https://www.bbc.co.uk/introducing', 'Platform for unsigned artists', 'Upload to BBC Introducing', 95),
  ('Amazing Radio', 'radio', ARRAY['indie', 'alternative'], ARRAY[]::text[], 'large', 'https://amazingradio.com', 'New music radio station', 'Submit via Audiu platform', 75),
  ('NTS Radio', 'radio', ARRAY['electronic', 'experimental', 'jazz'], ARRAY['eclectic'], 'large', 'https://www.nts.live', 'Freeform online radio', 'Contact show hosts directly', 80),
  ('Rinse FM', 'radio', ARRAY['electronic', 'grime', 'garage'], ARRAY['underground'], 'large', 'https://rinse.fm', 'London-based underground radio', 'DM presenters', 75),
  ('Soho Radio', 'radio', ARRAY['indie', 'electronic', 'soul'], ARRAY['eclectic'], 'medium', 'https://sohoradiolondon.com', 'Independent London radio', 'Email music team', 55),
  ('Worldwide FM', 'radio', ARRAY['world', 'jazz', 'electronic'], ARRAY['global', 'eclectic'], 'medium', 'https://worldwidefm.net', 'Gilles Peterson radio station', 'Submit to shows', 70),
  ('The Lot Radio', 'radio', ARRAY['electronic', 'experimental'], ARRAY['underground'], 'medium', 'https://thelotradio.com', 'Brooklyn community radio', 'Contact via Instagram', 50),
  ('dublab', 'radio', ARRAY['electronic', 'experimental', 'jazz'], ARRAY['eclectic'], 'medium', 'https://dublab.com', 'Non-profit web radio', 'Email submissions', 50),
  ('Balamii', 'radio', ARRAY['electronic', 'grime', 'garage'], ARRAY['underground'], 'medium', 'https://balamii.com', 'East London community radio', 'Contact show hosts', 45),
  ('KEXP', 'radio', ARRAY['indie', 'rock', 'world'], ARRAY['eclectic'], 'huge', 'https://kexp.org', 'Seattle public radio', 'Submit via form', 85),

  -- CURATORS / PLATFORMS
  ('SubmitHub', 'curator', ARRAY['all'], ARRAY[]::text[], 'huge', 'https://www.submithub.com', 'Music submission platform', 'Create account and submit', 80),
  ('Musosoup', 'curator', ARRAY['all'], ARRAY[]::text[], 'large', 'https://musosoup.com', 'Music promotion platform', 'Free and paid campaigns', 65),
  ('Playlist Push', 'curator', ARRAY['all'], ARRAY[]::text[], 'large', 'https://playlistpush.com', 'Playlist pitching service', 'Paid service', 60),
  ('Daily Playlists', 'curator', ARRAY['all'], ARRAY[]::text[], 'medium', 'https://www.daily-playlists.com', 'Independent playlist network', 'Submit via website', 45),
  ('iMusician', 'curator', ARRAY['all'], ARRAY[]::text[], 'medium', 'https://imusician.pro', 'Distribution with playlist pitching', 'Via distribution service', 50),
  ('Colors', 'curator', ARRAY['soul', 'rnb', 'indie'], ARRAY['aesthetic'], 'huge', 'https://colors.show', 'Aesthetic music platform', 'Apply for show', 80)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- Done. 12 tables, all with RLS, all with updated_at triggers.
-- ============================================================================
