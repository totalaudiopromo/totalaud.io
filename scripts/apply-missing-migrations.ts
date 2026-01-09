import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = 'https://ucncbighzqudaszewjrv.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.')
  console.error('   Please ensure it is set in your .env.local file.')
  process.exit(1)
}

const serviceKey = SUPABASE_SERVICE_KEY as string

const MIGRATIONS = [
  path.join(process.cwd(), 'supabase', 'migrations', '20251117500000_create_assets.sql'),
  path.join(
    process.cwd(),
    'packages',
    'core-db',
    'supabase',
    'migrations',
    '20260108000001_track_memory_v0.sql'
  ),
]

async function main() {
  const supabase = createClient(SUPABASE_URL, serviceKey)

  for (const migrationPath of MIGRATIONS) {
    console.log(`\n📄 Reading migration: ${path.basename(migrationPath)}`)
    const sql = fs.readFileSync(migrationPath, 'utf8')

    // Split into statements
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'))

    console.log(`   Applying ${statements.length} statements...`)

    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
      if (error) {
        // If it's a "relation already exists" error, we might be okay
        if (error.message.includes('already exists')) {
          // Skip
        } else {
          console.error(`   ❌ Error executing statement:`, error.message)
          console.error(`   Statement: ${statement.substring(0, 50)}...`)
        }
      }
    }
  }

  console.log('\n✅ Migrations applied.')
}

main().catch(console.error)
