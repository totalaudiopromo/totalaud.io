-- LoopOS Phase 2: Intelligence + Persistence
-- Database schema for nodes, notes, and momentum

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- NODES TABLE
-- Stores creative loop nodes (create/promote/analyse/refine)
-- =====================================================
CREATE TABLE IF NOT EXISTS loopos_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('create', 'promote', 'analyse', 'refine')),
  title TEXT NOT NULL,
  description TEXT,
  friction INTEGER NOT NULL DEFAULT 5 CHECK (friction >= 0 AND friction <= 10),
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 0 AND priority <= 10),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  position_x REAL NOT NULL DEFAULT 0,
  position_y REAL NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_loopos_nodes_user_id ON loopos_nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_loopos_nodes_status ON loopos_nodes(status);
CREATE INDEX IF NOT EXISTS idx_loopos_nodes_type ON loopos_nodes(type);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_loopos_nodes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_loopos_nodes_updated_at
  BEFORE UPDATE ON loopos_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_loopos_nodes_updated_at();

-- RLS Policies for nodes
ALTER TABLE loopos_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own nodes"
  ON loopos_nodes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nodes"
  ON loopos_nodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nodes"
  ON loopos_nodes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nodes"
  ON loopos_nodes FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- NOTES TABLE
-- Stores creative notes categorised by type
-- =====================================================
CREATE TABLE IF NOT EXISTS loopos_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('idea', 'task', 'insight', 'blocker', 'win')),
  title TEXT NOT NULL,
  body TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_loopos_notes_user_id ON loopos_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_loopos_notes_category ON loopos_notes(category);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_loopos_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_loopos_notes_updated_at
  BEFORE UPDATE ON loopos_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_loopos_notes_updated_at();

-- RLS Policies for notes
ALTER TABLE loopos_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes"
  ON loopos_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON loopos_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON loopos_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON loopos_notes FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- MOMENTUM TABLE
-- Stores user momentum and streak data (one row per user)
-- =====================================================
CREATE TABLE IF NOT EXISTS loopos_momentum (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  momentum INTEGER NOT NULL DEFAULT 0 CHECK (momentum >= 0 AND momentum <= 100),
  streak INTEGER NOT NULL DEFAULT 0 CHECK (streak >= 0),
  last_gain TIMESTAMPTZ,
  last_reset TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_loopos_momentum_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_loopos_momentum_updated_at
  BEFORE UPDATE ON loopos_momentum
  FOR EACH ROW
  EXECUTE FUNCTION update_loopos_momentum_updated_at();

-- RLS Policies for momentum
ALTER TABLE loopos_momentum ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own momentum"
  ON loopos_momentum FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own momentum"
  ON loopos_momentum FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own momentum"
  ON loopos_momentum FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own momentum"
  ON loopos_momentum FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- INITIAL DATA SEED (Optional)
-- =====================================================
-- Function to initialize momentum for new users
CREATE OR REPLACE FUNCTION initialize_user_momentum()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO loopos_momentum (user_id, momentum, streak)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create momentum row when user signs up
CREATE TRIGGER trigger_initialize_user_momentum
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_momentum();
