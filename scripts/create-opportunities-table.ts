#!/usr/bin/env npx tsx
/**
 * Create the opportunities table via Supabase Management API
 *
 * Since we can't run raw SQL via the client library,
 * we'll use the Supabase Management API or just output instructions
 */

import { SUPABASE_URL } from './config'

console.log('═══════════════════════════════════════════════════════════')
console.log('     CREATE OPPORTUNITIES TABLE - MANUAL STEP REQUIRED')
console.log('═══════════════════════════════════════════════════════════\n')

console.log('The opportunities table needs to be created in Supabase.\n')

console.log('🌐 Open the Supabase SQL Editor:')
console.log(`   ${SUPABASE_URL.replace('.supabase.co', '')}/sql\n`)
console.log('   Or go to: https://supabase.com/dashboard/project/ucncbighzqudaszewjrv/sql/new\n')

console.log('📋 Copy and paste the following SQL:\n')

console.log('─────────────────────────────────────────────────────────────')
console.log(`
-- Create opportunities table for Scout Mode
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('radio', 'playlist', 'blog', 'curator', 'press')),
  genres TEXT[] DEFAULT '{}',
  vibes TEXT[] DEFAULT '{}',
  audience_size TEXT CHECK (audience_size IN ('small', 'medium', 'large')),
  url TEXT,
  contact_email TEXT,
  contact_name TEXT,
  importance INT DEFAULT 1 CHECK (importance >= 1 AND importance <= 5),
  description TEXT,
  source TEXT DEFAULT 'curated' CHECK (source IN ('curated', 'airtable', 'manual', 'research')),
  source_url TEXT,
  last_verified_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can read active opportunities"
  ON opportunities FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Service role has full access"
  ON opportunities FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_genres ON opportunities USING GIN(genres);
CREATE INDEX IF NOT EXISTS idx_opportunities_vibes ON opportunities USING GIN(vibes);
CREATE INDEX IF NOT EXISTS idx_opportunities_audience_size ON opportunities(audience_size);
CREATE INDEX IF NOT EXISTS idx_opportunities_active ON opportunities(is_active) WHERE is_active = true;

-- Timestamp trigger
CREATE OR REPLACE FUNCTION update_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_opportunities_timestamp
  BEFORE UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_opportunities_updated_at();

-- Permissions
GRANT SELECT ON opportunities TO authenticated;
GRANT ALL ON opportunities TO service_role;
`)
console.log('─────────────────────────────────────────────────────────────\n')

console.log('✅ After running the SQL, come back and run:')
console.log('   pnpm tsx scripts/seed-opportunities.ts\n')
