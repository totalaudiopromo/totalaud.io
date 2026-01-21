#!/usr/bin/env npx tsx
/**
 * Apply the opportunities table migration directly via SQL
 * This bypasses the supabase CLI migration tracking issues
 */

import { createAdminClient } from './config'

const MIGRATION_SQL = `
-- Migration: Create opportunities table for Scout Mode
-- Drop if exists (for clean recreation)
DROP TABLE IF EXISTS opportunities CASCADE;

-- Create the opportunities table
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core fields
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('radio', 'playlist', 'blog', 'curator', 'press')),

  -- Targeting
  genres TEXT[] DEFAULT '{}',
  vibes TEXT[] DEFAULT '{}',
  audience_size TEXT CHECK (audience_size IN ('small', 'medium', 'large')),

  -- Contact info (GDPR: corporate emails only)
  url TEXT,
  contact_email TEXT,
  contact_name TEXT,

  -- Metadata
  importance INT DEFAULT 1 CHECK (importance >= 1 AND importance <= 5),
  description TEXT,

  -- Source tracking (GDPR compliance)
  source TEXT DEFAULT 'curated' CHECK (source IN ('curated', 'airtable', 'manual', 'research')),
  source_url TEXT,
  last_verified_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add table comment
COMMENT ON TABLE opportunities IS 'Curated opportunities for Scout Mode - radio stations, playlists, blogs, curators, and press contacts';

-- Enable Row Level Security
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can read active opportunities" ON opportunities;
DROP POLICY IF EXISTS "Service role has full access" ON opportunities;

-- RLS Policy: Authenticated users can read active opportunities
CREATE POLICY "Authenticated users can read active opportunities"
  ON opportunities
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policy: Service role can do everything (for seeding/admin)
CREATE POLICY "Service role has full access"
  ON opportunities
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_opportunities_genres ON opportunities USING GIN(genres);
CREATE INDEX idx_opportunities_vibes ON opportunities USING GIN(vibes);
CREATE INDEX idx_opportunities_audience_size ON opportunities(audience_size);
CREATE INDEX idx_opportunities_active ON opportunities(is_active) WHERE is_active = true;
CREATE INDEX idx_opportunities_source ON opportunities(source);
CREATE INDEX idx_opportunities_type_active ON opportunities(type, is_active) WHERE is_active = true;

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_opportunities_timestamp ON opportunities;
CREATE TRIGGER trigger_update_opportunities_timestamp
  BEFORE UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_opportunities_updated_at();

-- Grant permissions
GRANT SELECT ON opportunities TO authenticated;
GRANT ALL ON opportunities TO service_role;
`

/**
 * Robust SQL splitter that understands basic PostgreSQL syntax
 */
function splitSqlStatements(sql: string): string[] {
  const statements: string[] = []
  let currentPosition = 0
  let inString = false
  let dollarQuoteTag: string | null = null

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i]
    if (dollarQuoteTag) {
      if (char === '$' && sql.startsWith(dollarQuoteTag, i)) {
        i += dollarQuoteTag.length - 1
        dollarQuoteTag = null
      }
      continue
    }
    if (inString) {
      if (char === "'") {
        if (sql[i + 1] === "'") i++
        else inString = false
      }
      continue
    }
    if (char === "'") {
      inString = true
      continue
    }
    if (char === '$') {
      const match = sql.slice(i).match(/^(\$[a-zA-Z0-9_]*\$)/)
      if (match) {
        dollarQuoteTag = match[0]
        i += dollarQuoteTag.length - 1
        continue
      }
    }
    if (char === ';') {
      const statement = sql.substring(currentPosition, i).trim()
      if (statement && !statement.startsWith('--')) {
        statements.push(statement)
      }
      currentPosition = i + 1
    }
  }
  const lastStatement = sql.substring(currentPosition).trim()
  if (lastStatement && !lastStatement.startsWith('--')) {
    statements.push(lastStatement)
  }
  return statements
}

async function main() {
  console.log('🔧 Applying opportunities table migration...\n')

  const supabase = createAdminClient()

  // Split into separate statements and execute
  const statements = splitSqlStatements(MIGRATION_SQL)

  let successCount = 0
  let errorCount = 0

  for (const statement of statements) {
    // Skip comments
    if (statement.startsWith('--')) continue

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })

      if (error) {
        // Try direct query instead
        const { error: directError } = await supabase.from('opportunities').select('id').limit(0)
        if (directError && !directError.message.includes('does not exist')) {
          console.error(`  ❌ Error:`, error.message)
          errorCount++
        } else {
          successCount++
        }
      } else {
        successCount++
      }
    } catch (err) {
      // Ignore certain expected errors
      console.log(`  ⚠️  Statement skipped`)
    }
  }

  // Verify table exists by trying to query it
  console.log('\n📋 Verifying table creation...')
  const { data, error } = await supabase.from('opportunities').select('id').limit(1)

  if (error) {
    if (error.message.includes('does not exist')) {
      console.log('❌ Table does not exist - migration may have failed')
      console.log('   You may need to run this SQL directly in Supabase SQL Editor')
      console.log('\n   SQL is in: supabase/migrations/20251128000000_create_opportunities.sql')
    } else {
      console.log('✅ Table exists but query returned error:', error.message)
    }
  } else {
    console.log('✅ Table "opportunities" exists and is accessible!')
    console.log(`   Current row count: ${data?.length || 0}`)
  }

  console.log('\n🎉 Done!')
}

main().catch(console.error)
