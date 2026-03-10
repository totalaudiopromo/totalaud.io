-- Collaboration Schema
-- Stage 8: Studio Personalisation & Collaboration
-- Created: 2025-10-24

-- User preferences table (personal settings that sync across devices)
CREATE TABLE IF NOT EXISTS public.user_prefs (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'ascii' CHECK (theme IN ('ascii', 'xp', 'aqua', 'daw', 'analogue')),
  comfort_mode BOOLEAN DEFAULT false,
  calm_mode BOOLEAN DEFAULT false,
  sound_muted BOOLEAN DEFAULT false,
  tone TEXT DEFAULT 'balanced' CHECK (tone IN ('minimal', 'balanced', 'verbose')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Campaign collaborators table (who has access to which campaigns)
CREATE TABLE IF NOT EXISTS public.campaign_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(campaign_id, user_id)
);

-- Collaboration invite tokens (temporary tokens for inviting users)
CREATE TABLE IF NOT EXISTS public.collaboration_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  invited_email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
  invite_token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_prefs_user_id ON public.user_prefs(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_collaborators_campaign_id ON public.campaign_collaborators(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_collaborators_user_id ON public.campaign_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_invites_token ON public.collaboration_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_collaboration_invites_email ON public.collaboration_invites(invited_email);
CREATE INDEX IF NOT EXISTS idx_collaboration_invites_expires ON public.collaboration_invites(expires_at);

-- Row Level Security (RLS)
ALTER TABLE public.user_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_invites ENABLE ROW LEVEL SECURITY;

-- User Prefs Policies: Users can only access their own preferences
CREATE POLICY "Users can view their own prefs"
  ON public.user_prefs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prefs"
  ON public.user_prefs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prefs"
  ON public.user_prefs FOR UPDATE
  USING (auth.uid() = user_id);

-- Campaign Collaborators Policies: Users can see collaborators for campaigns they have access to
CREATE POLICY "Users can view collaborators for their campaigns"
  ON public.campaign_collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_collaborators cc
      WHERE cc.campaign_id = campaign_collaborators.campaign_id
      AND cc.user_id = auth.uid()
    )
  );

CREATE POLICY "Campaign owners can add collaborators"
  ON public.campaign_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaign_collaborators
      WHERE campaign_id = campaign_collaborators.campaign_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

CREATE POLICY "Campaign owners can remove collaborators"
  ON public.campaign_collaborators FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_collaborators
      WHERE campaign_id = campaign_collaborators.campaign_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Collaboration Invites Policies
CREATE POLICY "Users can view invites they sent"
  ON public.collaboration_invites FOR SELECT
  USING (invited_by = auth.uid());

CREATE POLICY "Users can view invites sent to their email"
  ON public.collaboration_invites FOR SELECT
  USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Campaign owners can create invites"
  ON public.collaboration_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaign_collaborators
      WHERE campaign_id = collaboration_invites.campaign_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

CREATE POLICY "Users can update invites they received"
  ON public.collaboration_invites FOR UPDATE
  USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Update campaigns RLS policies to respect collaborator roles
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.campaigns;

-- New policies that check campaign_collaborators
CREATE POLICY "Users can view campaigns they have access to"
  ON public.campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_collaborators
      WHERE campaign_id = campaigns.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Campaign owners and editors can update campaigns"
  ON public.campaigns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_collaborators
      WHERE campaign_id = campaigns.id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Campaign owners can delete campaigns"
  ON public.campaigns FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_collaborators
      WHERE campaign_id = campaigns.id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Update campaign_events policies for role-based access
DROP POLICY IF EXISTS "Users can insert events for their campaigns" ON public.campaign_events;

CREATE POLICY "Owners and editors can insert events"
  ON public.campaign_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaign_collaborators
      WHERE campaign_id = campaign_events.campaign_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- Trigger to update user_prefs.updated_at
CREATE TRIGGER user_prefs_updated_at
  BEFORE UPDATE ON public.user_prefs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to auto-create collaborator record when campaign is created
CREATE OR REPLACE FUNCTION public.create_campaign_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.campaign_collaborators (campaign_id, user_id, role, invited_by)
  VALUES (NEW.id, NEW.user_id, 'owner', NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_campaign_owner_trigger
  AFTER INSERT ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.create_campaign_owner();

-- Function to cleanup expired invite tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_invites()
RETURNS void AS $$
BEGIN
  DELETE FROM public.collaboration_invites
  WHERE expires_at < NOW() AND accepted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE public.user_prefs IS 'User preferences that sync across devices (theme, comfort, sound, tone)';
COMMENT ON TABLE public.campaign_collaborators IS 'Campaign access control - who has what role on which campaign';
COMMENT ON TABLE public.collaboration_invites IS 'Temporary invite tokens for adding collaborators (24h expiry)';
