-- ============================================================================
-- Label OS — multi-tenant workspace for independent labels
-- Applied to qopmwhdermudwufrloqb on 10 July 2026.
--
-- Adapted to coexist with the pre-existing labels/label_members tables
-- (from an 18 May 2026 experiment already on the remote database, alongside
-- releases/roster_artists/milestones/partners — those remain untouched and
-- unused by current code). Additive only: extends labels with three columns,
-- adds SECURITY DEFINER membership helpers, the create_label RPC, and five
-- new tables with membership-based RLS.
-- ============================================================================

-- Extend the existing labels table with columns the Label OS app uses
ALTER TABLE labels ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE labels ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE labels ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Membership helpers (SECURITY DEFINER to avoid RLS recursion on
-- label_members when policies on other tables consult membership)
CREATE OR REPLACE FUNCTION is_label_member(p_label_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM label_members
    WHERE label_id = p_label_id AND user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION label_member_role(p_label_id UUID, p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT role FROM label_members
  WHERE label_id = p_label_id AND user_id = p_user_id
  LIMIT 1;
$$;

-- Atomic label + owner membership creation (RLS chicken-and-egg)
CREATE OR REPLACE FUNCTION create_label(
  p_name TEXT,
  p_slug TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS labels
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_label labels;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO labels (name, slug, description, owner_user_id, created_by, plan_tier)
  VALUES (p_name, p_slug, p_description, auth.uid(), auth.uid(), 'indie')
  RETURNING * INTO v_label;

  INSERT INTO label_members (label_id, user_id, role)
  VALUES (v_label.id, auth.uid(), 'owner');

  RETURN v_label;
END;
$$;

GRANT EXECUTE ON FUNCTION create_label TO authenticated;

-- ----------------------------------------------------------------------------
-- label_artists
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS label_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  genres TEXT[] DEFAULT '{}',
  image_url TEXT,
  website TEXT,
  spotify_url TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_label_artists_label_id ON label_artists(label_id);
CREATE INDEX IF NOT EXISTS idx_label_artists_name ON label_artists(label_id, name);

CREATE TRIGGER trigger_label_artists_updated_at
  BEFORE UPDATE ON label_artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE label_artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read label artists" ON label_artists
  FOR SELECT USING (is_label_member(label_id, auth.uid()));
CREATE POLICY "Members can create label artists" ON label_artists
  FOR INSERT WITH CHECK (is_label_member(label_id, auth.uid()));
CREATE POLICY "Members can update label artists" ON label_artists
  FOR UPDATE USING (is_label_member(label_id, auth.uid()));
CREATE POLICY "Owners and managers can delete label artists" ON label_artists
  FOR DELETE USING (label_member_role(label_id, auth.uid()) IN ('owner', 'manager'));

-- ----------------------------------------------------------------------------
-- label_releases
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS label_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE NOT NULL,
  artist_id UUID REFERENCES label_artists(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('single', 'ep', 'album')),
  status TEXT NOT NULL DEFAULT 'idea'
    CHECK (status IN ('idea', 'in_progress', 'scheduled', 'released')),
  release_date DATE,
  upc TEXT,
  artwork_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_label_releases_label_id ON label_releases(label_id);
CREATE INDEX IF NOT EXISTS idx_label_releases_artist_id ON label_releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_label_releases_status ON label_releases(label_id, status);
CREATE INDEX IF NOT EXISTS idx_label_releases_date ON label_releases(label_id, release_date);

CREATE TRIGGER trigger_label_releases_updated_at
  BEFORE UPDATE ON label_releases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE label_releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read label releases" ON label_releases
  FOR SELECT USING (is_label_member(label_id, auth.uid()));
CREATE POLICY "Members can create label releases" ON label_releases
  FOR INSERT WITH CHECK (is_label_member(label_id, auth.uid()));
CREATE POLICY "Members can update label releases" ON label_releases
  FOR UPDATE USING (is_label_member(label_id, auth.uid()));
CREATE POLICY "Owners and managers can delete label releases" ON label_releases
  FOR DELETE USING (label_member_role(label_id, auth.uid()) IN ('owner', 'manager'));

-- ----------------------------------------------------------------------------
-- label_tracks
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS label_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE NOT NULL,
  release_id UUID REFERENCES label_releases(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  track_number INT,
  duration_seconds INT,
  isrc TEXT,
  version TEXT,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'mixed', 'mastered', 'delivered')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_label_tracks_release_id ON label_tracks(release_id);
CREATE INDEX IF NOT EXISTS idx_label_tracks_label_id ON label_tracks(label_id);

CREATE TRIGGER trigger_label_tracks_updated_at
  BEFORE UPDATE ON label_tracks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE label_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read label tracks" ON label_tracks
  FOR SELECT USING (is_label_member(label_id, auth.uid()));
CREATE POLICY "Members can create label tracks" ON label_tracks
  FOR INSERT WITH CHECK (is_label_member(label_id, auth.uid()));
CREATE POLICY "Members can update label tracks" ON label_tracks
  FOR UPDATE USING (is_label_member(label_id, auth.uid()));
CREATE POLICY "Members can delete label tracks" ON label_tracks
  FOR DELETE USING (is_label_member(label_id, auth.uid()));

-- ----------------------------------------------------------------------------
-- label_release_tasks
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS label_release_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE NOT NULL,
  release_id UUID REFERENCES label_releases(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  completed_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_label_release_tasks_release_id ON label_release_tasks(release_id);
CREATE INDEX IF NOT EXISTS idx_label_release_tasks_label_id ON label_release_tasks(label_id);
CREATE INDEX IF NOT EXISTS idx_label_release_tasks_due_date ON label_release_tasks(label_id, due_date);
CREATE INDEX IF NOT EXISTS idx_label_release_tasks_incomplete
  ON label_release_tasks(label_id, due_date) WHERE completed = FALSE;

CREATE TRIGGER trigger_label_release_tasks_updated_at
  BEFORE UPDATE ON label_release_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE label_release_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read label tasks" ON label_release_tasks
  FOR SELECT USING (is_label_member(label_id, auth.uid()));
CREATE POLICY "Members can create label tasks" ON label_release_tasks
  FOR INSERT WITH CHECK (is_label_member(label_id, auth.uid()));
CREATE POLICY "Members can update label tasks" ON label_release_tasks
  FOR UPDATE USING (is_label_member(label_id, auth.uid()));
CREATE POLICY "Members can delete label tasks" ON label_release_tasks
  FOR DELETE USING (is_label_member(label_id, auth.uid()));

-- ----------------------------------------------------------------------------
-- label_contacts
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS label_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  outlet TEXT,
  type TEXT CHECK (type IN ('radio', 'playlist', 'blog', 'press', 'dsp')),
  email TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  last_contacted DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_label_contacts_label_id ON label_contacts(label_id);
CREATE INDEX IF NOT EXISTS idx_label_contacts_type ON label_contacts(label_id, type);

CREATE TRIGGER trigger_label_contacts_updated_at
  BEFORE UPDATE ON label_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE label_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read label contacts" ON label_contacts
  FOR SELECT USING (is_label_member(label_id, auth.uid()));
CREATE POLICY "Members can create label contacts" ON label_contacts
  FOR INSERT WITH CHECK (is_label_member(label_id, auth.uid()));
CREATE POLICY "Members can update label contacts" ON label_contacts
  FOR UPDATE USING (is_label_member(label_id, auth.uid()));
CREATE POLICY "Members can delete label contacts" ON label_contacts
  FOR DELETE USING (is_label_member(label_id, auth.uid()));
