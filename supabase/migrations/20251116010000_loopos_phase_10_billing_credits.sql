-- LoopOS Phase 10: Billing & Credits System
-- Author: Claude Code
-- Date: 2025-11-16

-- =====================================================
-- PLANS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS loopos_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  monthly_price_cents INTEGER NOT NULL,
  max_workspaces INTEGER NOT NULL,
  ai_credits_per_month INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default plans
INSERT INTO loopos_plans (id, name, description, monthly_price_cents, max_workspaces, ai_credits_per_month, features) VALUES
  ('free', 'Free', 'Perfect for trying out LoopOS', 0, 1, 200, '{
    "timeline": true,
    "journal": true,
    "coach": true,
    "designer": true,
    "packs": true,
    "exports": false,
    "realtime": true
  }'::jsonb),
  ('creator', 'Creator', 'For solo artists and creators', 1900, 3, 2000, '{
    "timeline": true,
    "journal": true,
    "coach": true,
    "designer": true,
    "packs": true,
    "exports": true,
    "realtime": true
  }'::jsonb),
  ('agency', 'Agency', 'For teams and agencies', 9900, 20, 10000, '{
    "timeline": true,
    "journal": true,
    "coach": true,
    "designer": true,
    "packs": true,
    "exports": true,
    "realtime": true
  }'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS loopos_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES loopos_plans(id),
  billing_status TEXT NOT NULL DEFAULT 'trial' CHECK (billing_status IN ('trial', 'active', 'past_due', 'cancelled', 'paused')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  renewal_date TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id)
);

-- Enable RLS
ALTER TABLE loopos_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Workspace owners can view subscription"
  ON loopos_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_subscriptions.workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

CREATE POLICY "Workspace owners can update subscription"
  ON loopos_subscriptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_subscriptions.workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Indexes
CREATE INDEX idx_loopos_subscriptions_workspace ON loopos_subscriptions(workspace_id);
CREATE INDEX idx_loopos_subscriptions_plan ON loopos_subscriptions(plan_id);
CREATE INDEX idx_loopos_subscriptions_status ON loopos_subscriptions(billing_status);

-- =====================================================
-- CREDIT LEDGER TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS loopos_credit_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  change INTEGER NOT NULL,
  reason TEXT NOT NULL,
  meta JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE loopos_credit_ledger ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Workspace members can view credit ledger"
  ON loopos_credit_ledger FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_credit_ledger.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert credit entries"
  ON loopos_credit_ledger FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_loopos_credit_ledger_workspace ON loopos_credit_ledger(workspace_id);
CREATE INDEX idx_loopos_credit_ledger_created_at ON loopos_credit_ledger(created_at DESC);

-- =====================================================
-- USAGE EVENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS loopos_usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  category TEXT NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 0,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE loopos_usage_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Workspace members can view usage events"
  ON loopos_usage_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_usage_events.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert usage events"
  ON loopos_usage_events FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_loopos_usage_events_workspace ON loopos_usage_events(workspace_id);
CREATE INDEX idx_loopos_usage_events_category ON loopos_usage_events(category);
CREATE INDEX idx_loopos_usage_events_created_at ON loopos_usage_events(created_at DESC);
CREATE INDEX idx_loopos_usage_events_workspace_created ON loopos_usage_events(workspace_id, created_at DESC);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get current credit balance
CREATE OR REPLACE FUNCTION loopos_current_credit_balance(p_workspace_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(change), 0)::INTEGER
  FROM loopos_credit_ledger
  WHERE workspace_id = p_workspace_id;
$$ LANGUAGE SQL STABLE;

-- Function to get credit balance for current period
CREATE OR REPLACE FUNCTION loopos_period_credit_balance(
  p_workspace_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW()),
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(change), 0)::INTEGER
  FROM loopos_credit_ledger
  WHERE workspace_id = p_workspace_id
  AND created_at >= p_start_date
  AND created_at <= p_end_date;
$$ LANGUAGE SQL STABLE;

-- Function to check if workspace has enough credits
CREATE OR REPLACE FUNCTION loopos_has_credits(
  p_workspace_id UUID,
  p_required INTEGER
)
RETURNS BOOLEAN AS $$
  SELECT loopos_current_credit_balance(p_workspace_id) >= p_required;
$$ LANGUAGE SQL STABLE;

-- Function to record usage and deduct credits
CREATE OR REPLACE FUNCTION loopos_use_credits(
  p_workspace_id UUID,
  p_user_id UUID,
  p_credits INTEGER,
  p_reason TEXT,
  p_event_type TEXT,
  p_category TEXT,
  p_meta JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_credits BOOLEAN;
BEGIN
  -- Check if workspace has enough credits
  v_has_credits := loopos_has_credits(p_workspace_id, p_credits);

  IF NOT v_has_credits THEN
    RETURN FALSE;
  END IF;

  -- Deduct credits from ledger
  INSERT INTO loopos_credit_ledger (workspace_id, change, reason, meta, created_by)
  VALUES (p_workspace_id, -p_credits, p_reason, p_meta, p_user_id);

  -- Record usage event
  INSERT INTO loopos_usage_events (workspace_id, user_id, event_type, category, credits_used, meta)
  VALUES (p_workspace_id, p_user_id, p_event_type, p_category, p_credits, p_meta);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to allocate monthly credits
CREATE OR REPLACE FUNCTION loopos_allocate_monthly_credits(p_workspace_id UUID)
RETURNS VOID AS $$
DECLARE
  v_plan_id TEXT;
  v_credits INTEGER;
BEGIN
  -- Get workspace plan
  SELECT plan_id INTO v_plan_id
  FROM loopos_subscriptions
  WHERE workspace_id = p_workspace_id;

  IF v_plan_id IS NULL THEN
    -- Default to free plan
    v_plan_id := 'free';
  END IF;

  -- Get plan credits
  SELECT ai_credits_per_month INTO v_credits
  FROM loopos_plans
  WHERE id = v_plan_id;

  -- Allocate credits
  INSERT INTO loopos_credit_ledger (workspace_id, change, reason, meta)
  VALUES (
    p_workspace_id,
    v_credits,
    'monthly_allocation',
    jsonb_build_object('plan_id', v_plan_id, 'period_start', DATE_TRUNC('month', NOW()))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_loopos_plans
  BEFORE UPDATE ON loopos_plans
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_loopos_subscriptions
  BEFORE UPDATE ON loopos_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- =====================================================
-- AUTO-ASSIGN FREE PLAN TO NEW WORKSPACES
-- =====================================================

CREATE OR REPLACE FUNCTION auto_assign_free_plan()
RETURNS TRIGGER AS $$
BEGIN
  -- Create subscription for new workspace
  INSERT INTO loopos_subscriptions (workspace_id, plan_id, billing_status)
  VALUES (NEW.id, 'free', 'active');

  -- Allocate initial credits
  PERFORM loopos_allocate_monthly_credits(NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_auto_assign_free_plan
  AFTER INSERT ON loopos_workspaces
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_free_plan();
