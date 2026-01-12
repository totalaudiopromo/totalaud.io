import { createAdminClient } from './config'
import fs from 'fs'
import path from 'path'

const supabase = createAdminClient()

/**
 * Migration directories to search for .sql files
 */
const MIGRATION_DIRS = [
  path.join(process.cwd(), 'supabase', 'migrations'),
  path.join(process.cwd(), 'packages', 'core-db', 'supabase', 'migrations'),
]

/**
 * Robust SQL splitter that understands basic PostgreSQL syntax
 * It respects:
 * 1. Single-quoted strings ('...')
 * 2. Dollar-quoted strings ($$ ... $$ or $tag$ ... $tag$)
 * 3. Escaped single quotes ('')
 */
function splitSqlStatements(sql: string): string[] {
  const statements: string[] = []
  let currentPosition = 0
  let inString = false
  let dollarQuoteTag: string | null = null

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i]

    // Handle Dollar Quoting ($$ or $tag$)
    if (dollarQuoteTag) {
      if (char === '$' && sql.startsWith(dollarQuoteTag, i)) {
        i += dollarQuoteTag.length - 1
        dollarQuoteTag = null
      }
      continue
    }

    // Handle Single Quotes ('...')
    if (inString) {
      if (char === "'") {
        // Check for escaped single quote ('')
        if (sql[i + 1] === "'") {
          i++ // skip next quote
        } else {
          inString = false
        }
      }
      continue
    }

    // Start of String or Dollar Quote
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

    // Statement Separator
    if (char === ';') {
      const statement = sql.substring(currentPosition, i).trim()
      if (statement && !statement.startsWith('--')) {
        statements.push(statement)
      }
      currentPosition = i + 1
    }
  }

  // Final statement
  const lastStatement = sql.substring(currentPosition).trim()
  if (lastStatement && !lastStatement.startsWith('--')) {
    statements.push(lastStatement)
  }

  return statements
}

async function main() {
  const migrations: string[] = []

  for (const dir of MIGRATION_DIRS) {
    if (fs.existsSync(dir)) {
      const files = fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.sql'))
        .map((f) => path.join(dir, f))
      migrations.push(...files)
    }
  }

  // Sort migrations by filename to ensure correct order
  migrations.sort((a, b) => path.basename(a).localeCompare(path.basename(b)))

  console.log(`🚀 Found ${migrations.length} migration files.`)

  for (const migrationPath of migrations) {
    console.log(`\n📄 Applying migration: ${path.basename(migrationPath)}`)
    const sql = fs.readFileSync(migrationPath, 'utf8')

    const statements = splitSqlStatements(sql)
    console.log(`   Applying ${statements.length} statements...`)

    for (const statement of statements) {
      // Re-add the semicolon for execution
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
      if (error) {
        if (error.message.includes('already exists')) {
          // Ignore "already exists" errors for idempotency
          continue
        } else {
          console.error(`   ❌ Error executing statement:`, error.message)
          console.error(`   Statement: ${statement.substring(0, 50)}...`)
        }
      }
    }
  }

  console.log('\n✅ All migrations applied.')
}

main().catch((err) => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
