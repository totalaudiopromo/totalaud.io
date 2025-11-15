-- LoopOS Phase 4: Cinematic Agentic Flow Engine
-- Migration: Create core tables for LoopOS

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Loop Nodes Table
CREATE TABLE IF NOT EXISTS loop_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('create', 'promote', 'analyse', 'refine')),
  title TEXT NOT NULL,
  description TEXT,
  friction INTEGER NOT NULL DEFAULT 50 CHECK (friction >= 0 AND friction <= 100),
  priority INTEGER NOT NULL DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
  dependencies UUID[] DEFAULT '{}',
  position_x REAL NOT NULL DEFAULT 0,
  position_y REAL NOT NULL DEFAULT 0,
  time_start REAL,
  duration REAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Journal Entries Table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  ai_summary TEXT,
  blockers TEXT[] DEFAULT '{}',
  themes TEXT[] DEFAULT '{}',
  momentum INTEGER CHECK (momentum >= 0 AND momentum <= 100),
  linked_nodes UUID[] DEFAULT '{}',
  tomorrow_actions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Orchestrations Table
CREATE TABLE IF NOT EXISTS orchestrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'complete', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS loop_nodes_user_id_idx ON loop_nodes(user_id);
CREATE INDEX IF NOT EXISTS loop_nodes_created_at_idx ON loop_nodes(created_at DESC);
CREATE INDEX IF NOT EXISTS journal_entries_user_id_idx ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS journal_entries_date_idx ON journal_entries(date DESC);
CREATE INDEX IF NOT EXISTS orchestrations_user_id_idx ON orchestrations(user_id);
CREATE INDEX IF NOT EXISTS orchestrations_status_idx ON orchestrations(status);

-- Row Level Security (RLS) Policies
ALTER TABLE loop_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestrations ENABLE ROW LEVEL SECURITY;

-- Loop Nodes Policies
CREATE POLICY "Users can view their own nodes"
  ON loop_nodes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own nodes"
  ON loop_nodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nodes"
  ON loop_nodes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nodes"
  ON loop_nodes FOR DELETE
  USING (auth.uid() = user_id);

-- Journal Entries Policies
CREATE POLICY "Users can view their own journal entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Orchestrations Policies
CREATE POLICY "Users can view their own orchestrations"
  ON orchestrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orchestrations"
  ON orchestrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orchestrations"
  ON orchestrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orchestrations"
  ON orchestrations FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_loop_nodes_updated_at
  BEFORE UPDATE ON loop_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orchestrations_updated_at
  BEFORE UPDATE ON orchestrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
