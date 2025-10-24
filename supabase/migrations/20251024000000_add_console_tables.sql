-- Console Realtime Data Schema
-- Stage 6: Real-time campaign tracking and insights
-- Created: 2025-10-24

-- Campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  release_date DATE,
  goal_total INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Campaign events table (realtime activity stream)
CREATE TABLE IF NOT EXISTS public.campaign_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pitch_sent', 'pitch_opened', 'pitch_replied', 'workflow_started', 'release_planned')),
  target TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'opened', 'replied', 'queued')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Campaign metrics table (aggregated progress)
CREATE TABLE IF NOT EXISTS public.campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL UNIQUE,
  pitches_sent INTEGER DEFAULT 0,
  pitches_total INTEGER DEFAULT 50,
  opens INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  open_rate DECIMAL(5,2) DEFAULT 0.00,
  reply_rate DECIMAL(5,2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Campaign insights table (AI-generated learnings)
CREATE TABLE IF NOT EXISTS public.campaign_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  trend TEXT NOT NULL CHECK (trend IN ('up', 'down', 'neutral')),
  metric TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_events_campaign_id ON public.campaign_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_events_created_at ON public.campaign_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign_id ON public.campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_insights_campaign_id ON public.campaign_insights(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_insights_created_at ON public.campaign_insights(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own campaigns
CREATE POLICY "Users can view their own campaigns"
  ON public.campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON public.campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON public.campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Campaign events policies
CREATE POLICY "Users can view events for their campaigns"
  ON public.campaign_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_events.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert events for their campaigns"
  ON public.campaign_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_events.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Campaign metrics policies
CREATE POLICY "Users can view metrics for their campaigns"
  ON public.campaign_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_metrics.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert metrics for their campaigns"
  ON public.campaign_metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_metrics.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update metrics for their campaigns"
  ON public.campaign_metrics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_metrics.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Campaign insights policies
CREATE POLICY "Users can view insights for their campaigns"
  ON public.campaign_insights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_insights.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert insights for their campaigns"
  ON public.campaign_insights FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_insights.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Trigger to update campaigns.updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to update campaign_metrics.updated_at
CREATE TRIGGER campaign_metrics_updated_at
  BEFORE UPDATE ON public.campaign_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically update metrics when events are added
CREATE OR REPLACE FUNCTION public.update_campaign_metrics()
RETURNS TRIGGER AS $$
DECLARE
  total_events INTEGER;
  total_opens INTEGER;
  total_replies INTEGER;
  campaign_goal INTEGER;
BEGIN
  -- Get campaign goal
  SELECT goal_total INTO campaign_goal
  FROM public.campaigns
  WHERE id = NEW.campaign_id;

  -- Count events
  SELECT COUNT(*) INTO total_events
  FROM public.campaign_events
  WHERE campaign_id = NEW.campaign_id
  AND type = 'pitch_sent';

  SELECT COUNT(*) INTO total_opens
  FROM public.campaign_events
  WHERE campaign_id = NEW.campaign_id
  AND status IN ('opened', 'replied');

  SELECT COUNT(*) INTO total_replies
  FROM public.campaign_events
  WHERE campaign_id = NEW.campaign_id
  AND status = 'replied';

  -- Upsert metrics
  INSERT INTO public.campaign_metrics (
    campaign_id,
    pitches_sent,
    pitches_total,
    opens,
    replies,
    open_rate,
    reply_rate
  )
  VALUES (
    NEW.campaign_id,
    total_events,
    campaign_goal,
    total_opens,
    total_replies,
    CASE WHEN total_events > 0 THEN ROUND((total_opens::DECIMAL / total_events) * 100, 2) ELSE 0 END,
    CASE WHEN total_events > 0 THEN ROUND((total_replies::DECIMAL / total_events) * 100, 2) ELSE 0 END
  )
  ON CONFLICT (campaign_id)
  DO UPDATE SET
    pitches_sent = EXCLUDED.pitches_sent,
    opens = EXCLUDED.opens,
    replies = EXCLUDED.replies,
    open_rate = EXCLUDED.open_rate,
    reply_rate = EXCLUDED.reply_rate,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_metrics_on_event
  AFTER INSERT ON public.campaign_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_campaign_metrics();

-- Comments for documentation
COMMENT ON TABLE public.campaigns IS 'Artist campaigns with release information';
COMMENT ON TABLE public.campaign_events IS 'Realtime event stream for activity feed';
COMMENT ON TABLE public.campaign_metrics IS 'Aggregated campaign progress metrics';
COMMENT ON TABLE public.campaign_insights IS 'AI-generated insights and learnings';
