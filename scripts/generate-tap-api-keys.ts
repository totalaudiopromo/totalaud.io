#!/usr/bin/env npx tsx
/**
 * Generate TAP API Keys for totalaud.io
 *
 * This script generates API keys for connecting totalaud.io to the
 * Total Audio Platform (TAP) services: Intel, Pitch, and Tracker.
 *
 * Usage:
 *   npx tsx scripts/generate-tap-api-keys.ts
 *   npx tsx scripts/generate-tap-api-keys.ts --skip-db  # Generate keys without DB storage
 *
 * The script will:
 * 1. Generate 3 API keys (one per TAP service)
 * 2. Store the hashed keys in the TAP database (unless --skip-db)
 * 3. Output the plain keys for your .env.local file
 *
 * IMPORTANT: The plain keys are shown ONCE. Save them immediately!
 */

import crypto from 'crypto'
import { createAdminClient } from './config'

// Check for --skip-db flag
const skipDb = process.argv.includes('--skip-db')

// Token type identifiers for TAP credentials. Keep prefixes short and
// human-readable so they are recognisable in logs and secret scanners.
//   tap_ak_  -- API key (server-to-server)
//   tap_wh_  -- Webhook signing secret (reserved)
type TapTokenPrefix = 'tap_ak'

/**
 * Generate a TAP API key
 */
function generateApiKey(prefix: TapTokenPrefix = 'tap_ak'): {
  key: string
  keyPrefix: string
  keyHash: string
} {
  const keyBody = crypto.randomBytes(32).toString('base64url')
  const key = `${prefix}_${keyBody}`
  const keyPrefix = key.slice(0, 10)
  const keyHash = crypto.createHash('sha256').update(key).digest('hex')

  return { key, keyPrefix, keyHash }
}

interface ApiKeyConfig {
  name: string
  scopes: string[]
  envVar: string
}

// Scopes follow the resource:action convention across the entire API surface.
// See docs/TAP_API_REFERENCE.md for the canonical scope list.
const API_KEYS_TO_CREATE: ApiKeyConfig[] = [
  {
    name: 'totalaud.io - Intel Integration',
    scopes: ['contacts:read', 'contacts:write', 'contacts:enrich', 'emails:validate'],
    envVar: 'TAP_API_KEY_INTEL',
  },
  {
    name: 'totalaud.io - Pitch Integration',
    scopes: ['pitches:read', 'pitches:write'],
    envVar: 'TAP_API_KEY_PITCH',
  },
  {
    name: 'totalaud.io - Tracker Integration',
    scopes: ['campaigns:read', 'campaigns:write', 'outcomes:read', 'outcomes:write'],
    envVar: 'TAP_API_KEY_TRACKER',
  },
]

async function main() {
  console.log('🔐 TAP API Key Generator for totalaud.io')
  console.log('=========================================\n')

  if (skipDb) {
    console.log('⚠️  Running in --skip-db mode (keys NOT stored in database)\n')
    console.log('   This is useful for development/testing, but for production')
    console.log('   you should run the api_keys migration and store keys properly.\n')
  }

  const supabase = skipDb ? null : createAdminClient()

  // Check if api_keys table exists (only if not skipping DB)
  if (supabase) {
    const { error: tableCheck } = await supabase.from('api_keys').select('id').limit(1)

    if (tableCheck?.code === '42P01') {
      console.error('❌ The api_keys table does not exist in the database.')
      console.error('   Run the migration first:')
      console.error('   cd ../total-audio-platform && supabase db push')
      console.error('')
      console.error('   Or use --skip-db to generate keys without database storage.')
      process.exit(1)
    }
  }

  // Get the system user ID (or create a service account)
  // For now, we'll use a placeholder - you may want to use your actual user ID
  const SYSTEM_USER_ID = process.env.TAP_SYSTEM_USER_ID || '00000000-0000-0000-0000-000000000001'

  console.log('Generating API keys...\n')

  const generatedKeys: { envVar: string; key: string; keyHash: string }[] = []

  for (const config of API_KEYS_TO_CREATE) {
    // Check if key already exists (only if not skipping DB)
    if (supabase) {
      const { data: existing } = await supabase
        .from('api_keys')
        .select('id, key_prefix')
        .eq('name', config.name)
        .single()

      if (existing) {
        console.log(`⚠️  ${config.name}`)
        console.log(`   Key already exists (${existing.key_prefix}...)`)
        console.log(`   Delete it first if you want to regenerate.\n`)
        continue
      }
    }

    // Generate new key
    const { key, keyPrefix, keyHash } = generateApiKey('tap_ak')

    // Insert into database (only if not skipping DB)
    if (supabase) {
      const { error } = await supabase.from('api_keys').insert({
        user_id: SYSTEM_USER_ID,
        name: config.name,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        scopes: config.scopes,
        rate_limit_rpm: 120, // Higher limit for service-to-service
      })

      if (error) {
        console.error(`❌ Failed to create ${config.name}:`, error.message)
        continue
      }
    }

    console.log(`✅ ${config.name}`)
    console.log(`   Prefix: ${keyPrefix}...`)
    console.log(`   Scopes: ${config.scopes.join(', ')}`)
    console.log(`   Env var: ${config.envVar}\n`)

    generatedKeys.push({ envVar: config.envVar, key, keyHash })
  }

  if (generatedKeys.length === 0) {
    console.log('\nNo new keys generated. All keys already exist.')
    process.exit(0)
  }

  console.log('\n' + '='.repeat(60))
  console.log('⚠️  IMPORTANT: Copy these keys NOW! They cannot be shown again.')
  console.log('='.repeat(60) + '\n')

  console.log('Add these to your apps/aud-web/.env.local file:\n')
  console.log('# TAP API Keys (Generated ' + new Date().toISOString().split('T')[0] + ')')

  for (const { envVar, key } of generatedKeys) {
    console.log(`${envVar}=${key}`)
  }

  if (skipDb) {
    console.log('\n# Key hashes (for manual database insertion):')
    for (const { envVar, keyHash } of generatedKeys) {
      console.log(`# ${envVar}_HASH=${keyHash}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  if (skipDb) {
    console.log('✅ Done! Keys generated (NOT stored in database).')
    console.log('   For production, run the api_keys migration and re-run without --skip-db.')
  } else {
    console.log('✅ Done! Keys have been stored (hashed) in the database.')
  }
  console.log('   Update your .env.local file with the keys above.')
  console.log('='.repeat(60))
}

main().catch(console.error)
