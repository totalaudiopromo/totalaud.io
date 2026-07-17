-- Baseline for the May 2026 labels experiment (July 2026 backfill).
--
-- labels and label_members were created directly on the remote database in
-- May 2026, outside the migrations directory. The later Label OS migration
-- (20260710000000) alters labels and consults label_members, so replaying
-- the directory from scratch (Supabase preview branches, local stacks)
-- failed with "relation labels does not exist".
--
-- This recreates exactly the pre-Label-OS shape. Production already has
-- both tables, so IF NOT EXISTS makes this a no-op there; the Label OS
-- migration adds its own columns (description, website, created_by) on top.

CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  owner_user_id UUID NOT NULL,
  plan_tier TEXT NOT NULL DEFAULT 'studio',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS label_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_label_members_label_id ON label_members(label_id);
CREATE INDEX IF NOT EXISTS idx_label_members_user_id ON label_members(user_id);
