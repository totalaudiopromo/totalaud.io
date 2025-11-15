/**
 * Campaign Dashboard & EPK Analytics Migration
 * Phase 15.5: Connected Campaign Dashboard + EPK Analytics
 *
 * Purpose:
 * - Track campaign performance metrics (views, downloads, shares, engagement)
 * - Track EPK asset analytics (views by region, device, timestamp)
 * - Enable real-time dashboard and analytics features
 */

--
-- 1. campaign_dashboard_metrics: Aggregate campaign performance
--

CREATE TABLE IF NOT EXISTS campaign_dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metrics
  views INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  engagement_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,

  -- Period tracking
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_engagement CHECK (engagement_score >= 0 AND engagement_score <= 100),
  CONSTRAINT valid_period CHECK (period_end > period_start)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_campaign_dashboard_metrics_campaign_id
  ON campaign_dashboard_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_dashboard_metrics_user_id
  ON campaign_dashboard_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_dashboard_metrics_period
  ON campaign_dashboard_metrics(period_start, period_end);

-- Enable RLS
ALTER TABLE campaign_dashboard_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own campaign metrics" ON campaign_dashboard_metrics;
CREATE POLICY "Users can view own campaign metrics"
  ON campaign_dashboard_metrics FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own campaign metrics" ON campaign_dashboard_metrics;
CREATE POLICY "Users can create own campaign metrics"
  ON campaign_dashboard_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own campaign metrics" ON campaign_dashboard_metrics;
CREATE POLICY "Users can update own campaign metrics"
  ON campaign_dashboard_metrics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own campaign metrics" ON campaign_dashboard_metrics;
CREATE POLICY "Users can delete own campaign metrics"
  ON campaign_dashboard_metrics FOR DELETE
  USING (auth.uid() = user_id);

--
-- 2. epk_analytics: Detailed EPK asset tracking
--

CREATE TABLE IF NOT EXISTS epk_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epk_id TEXT NOT NULL,
  asset_id UUID,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event type
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'download', 'share')),

  -- Analytics data
  views INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  region TEXT,
  device TEXT,

  -- Timestamp
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_epk_analytics_epk_id
  ON epk_analytics(epk_id);
CREATE INDEX IF NOT EXISTS idx_epk_analytics_asset_id
  ON epk_analytics(asset_id);
CREATE INDEX IF NOT EXISTS idx_epk_analytics_user_id
  ON epk_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_epk_analytics_event_type
  ON epk_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_epk_analytics_timestamp
  ON epk_analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_epk_analytics_region
  ON epk_analytics(region) WHERE region IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_epk_analytics_device
  ON epk_analytics(device) WHERE device IS NOT NULL;

-- Enable RLS
ALTER TABLE epk_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own EPK analytics" ON epk_analytics;
CREATE POLICY "Users can view own EPK analytics"
  ON epk_analytics FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own EPK analytics" ON epk_analytics;
CREATE POLICY "Users can create own EPK analytics"
  ON epk_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own EPK analytics" ON epk_analytics;
CREATE POLICY "Users can update own EPK analytics"
  ON epk_analytics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own EPK analytics" ON epk_analytics;
CREATE POLICY "Users can delete own EPK analytics"
  ON epk_analytics FOR DELETE
  USING (auth.uid() = user_id);

-- Public view policy for shared EPKs (optional - for future public EPK sharing)
DROP POLICY IF EXISTS "Anyone can view public EPK analytics" ON epk_analytics;
CREATE POLICY "Anyone can view public EPK analytics"
  ON epk_analytics FOR SELECT
  USING (metadata->>'public' = 'true');

--
-- 3. Helper functions
--

-- Function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(
  p_views INTEGER,
  p_downloads INTEGER,
  p_shares INTEGER
) RETURNS DECIMAL(5,2) AS $$
DECLARE
  score DECIMAL(5,2);
BEGIN
  -- Weighted scoring: views (30%), downloads (50%), shares (20%)
  score := (
    (p_views * 0.3) +
    (p_downloads * 0.5) +
    (p_shares * 0.2)
  );

  -- Normalize to 0-100 scale (assuming max values)
  -- Max views: 1000, max downloads: 100, max shares: 50
  score := LEAST(100, (
    (p_views::DECIMAL / 1000 * 30) +
    (p_downloads::DECIMAL / 100 * 50) +
    (p_shares::DECIMAL / 50 * 20)
  ));

  RETURN ROUND(score, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to aggregate EPK metrics by period
CREATE OR REPLACE FUNCTION aggregate_epk_metrics(
  p_epk_id TEXT,
  p_period_start TIMESTAMPTZ,
  p_period_end TIMESTAMPTZ
) RETURNS TABLE (
  total_views BIGINT,
  total_downloads BIGINT,
  total_shares BIGINT,
  unique_regions BIGINT,
  unique_devices BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'view') as total_views,
    COUNT(*) FILTER (WHERE event_type = 'download') as total_downloads,
    COUNT(*) FILTER (WHERE event_type = 'share') as total_shares,
    COUNT(DISTINCT region) FILTER (WHERE region IS NOT NULL) as unique_regions,
    COUNT(DISTINCT device) FILTER (WHERE device IS NOT NULL) as unique_devices
  FROM epk_analytics
  WHERE epk_id = p_epk_id
    AND timestamp >= p_period_start
    AND timestamp < p_period_end;
END;
$$ LANGUAGE plpgsql STABLE;

--
-- 4. Table comments
--

COMMENT ON TABLE campaign_dashboard_metrics IS 'Aggregate campaign performance metrics for dashboard (Phase 15.5)';
COMMENT ON TABLE epk_analytics IS 'Detailed EPK asset analytics tracking (Phase 15.5)';
COMMENT ON FUNCTION calculate_engagement_score IS 'Calculates weighted engagement score from metrics';
COMMENT ON FUNCTION aggregate_epk_metrics IS 'Aggregates EPK metrics for a given time period';

--
-- Migration complete
--
