#!/usr/bin/env npx tsx
/**
 * Setup TAP API Keys in Database
 *
 * This script uses the Supabase JavaScript client (REST API) to:
 * 1. Check if api_keys table exists
 * 2. Create it if missing (via RPC)
 * 3. Insert the key hashes
 *
 * Usage:
 *   npx tsx scripts/setup-tap-api-keys.ts
 */

import { createAdminClient } from './config'

const supabase = createAdminClient()

// Dev user ID from .env.local
const DEV_USER_ID = 'c5c261a8-8b35-4e77-ae6d-e293e65d746d'

// API keys to insert (hashes from previous generation)
const API_KEYS = [
  {
    user_id: DEV_USER_ID,
    name: 'totalaud.io - Intel Integration',
    key_prefix: 'tap_live_sEf',
    key_hash: '5549b919a5ab2fb36d6ac2a4529c58e4323824fd0f342a22deb4ae5be31e49f0',
    scopes: ['intel:read', 'intel:write'],
    rate_limit_rpm: 120,
  },
  {
    user_id: DEV_USER_ID,
    name: 'totalaud.io - Pitch Integration',
    key_prefix: 'tap_live_oTk',
    key_hash: '8d47b03b79a155715d0150e11bca931deaf59859f0e87a06a2a082ccef7a0e04',
    scopes: ['pitch:read', 'pitch:write'],
    rate_limit_rpm: 120,
  },
  {
    user_id: DEV_USER_ID,
    name: 'totalaud.io - Tracker Integration',
    key_prefix: 'tap_live_DaG',
    key_hash: '48d1a8b9f9828de230c2bd20aa0d13c4ce3b0d68d93a48e77a264d07627a3172',
    scopes: ['tracker:read', 'tracker:write'],
    rate_limit_rpm: 120,
  },
]

async function main() {
  console.log('🔐 TAP API Keys Database Setup')
  console.log('===============================\n')

  // Check if api_keys table exists
  console.log('Checking if api_keys table exists...')
  const { error: tableError } = await supabase.from('api_keys').select('id').limit(1)

  if (tableError?.code === '42P01') {
    console.error('❌ The api_keys table does not exist.')
    console.error('   You need to run the migration manually in Supabase SQL Editor:')
    console.error('   https://supabase.com/dashboard/project/ucncbighzqudaszewjrv/sql')
    console.error('')
    console.error('   Copy the contents of:')
    console.error(
      '   /total-audio-platform/packages/core-db/supabase/migrations/20251129000001_api_keys.sql'
    )
    process.exit(1)
  }

  if (tableError) {
    console.error('❌ Error checking table:', tableError.message)
    process.exit(1)
  }

  console.log('✅ api_keys table exists\n')

  // Insert API keys
  console.log('Inserting API keys...\n')

  for (const key of API_KEYS) {
    // Check if key already exists
    const { data: existing } = await supabase
      .from('api_keys')
      .select('id, key_prefix')
      .eq('name', key.name)
      .single()

    if (existing) {
      console.log(`⚠️  ${key.name} already exists (${existing.key_prefix}...)`)
      continue
    }

    // Insert key
    const { error } = await supabase.from('api_keys').insert(key)

    if (error) {
      console.error(`❌ Failed to insert ${key.name}:`, error.message)
      continue
    }

    console.log(`✅ ${key.name}`)
    console.log(`   Prefix: ${key.key_prefix}...`)
    console.log(`   Scopes: ${key.scopes.join(', ')}\n`)
  }

  // Verify
  console.log('\nVerifying...')
  const { data: keys } = await supabase
    .from('api_keys')
    .select('name, key_prefix, scopes')
    .like('name', 'totalaud.io%')

  if (keys && keys.length > 0) {
    console.log(`\n✅ ${keys.length} API keys configured for totalaud.io`)
    console.log('   The TAP integration should now work!')
  } else {
    console.log('\n⚠️  No keys found. Check for errors above.')
  }
}

main().catch(console.error)
