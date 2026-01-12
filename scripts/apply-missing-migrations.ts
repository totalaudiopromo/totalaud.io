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
  let currentStatement = ''
  let inString = false
  let dollarQuoteTag: string | null = null
  let i = 0

  while (i < sql.length) {
    const char = sql[i]
    const nextChar = sql[i + 1]

    // Handle Dollar Quoting ($$ or $tag$)
    if (dollarQuoteTag) {
      currentStatement += char
      if (char === '$' && sql.startsWith(dollarQuoteTag, i)) {
        currentStatement += dollarQuoteTag.substring(1)
        i += dollarQuoteTag.length - 1
        dollarQuoteTag = null
      }
      i++
      continue
    }

    // Handle Single Quotes ('...')
    if (inString) {
      currentStatement += char
      if (char === "'") {
        if (nextChar === "'") {
          currentStatement += nextChar
          i += 2
        } else {
          inString = false
          i++
        }
      } else {
        i++
      }
      continue
    }

    // Handle Block Comments /* ... */
    if (char === '/' && nextChar === '*') {
      i += 2
      while (i < sql.length - 1 && !(sql[i] === '*' && sql[i + 1] === '/')) {
        i++
      }
      i += 2
      continue
    }

    // Handle Inline Comments --
    if (char === '-' && nextChar === '-') {
      while (i < sql.length && sql[i] !== '\n') {
        i++
      }
      continue
    }

    // Start of String or Dollar Quote
    if (char === "'") {
      inString = true
      currentStatement += char
      i++
      continue
    }

    if (char === '$') {
      const match = sql.slice(i).match(/^(\$[a-zA-Z0-9_]*\$)/)
      if (match) {
        dollarQuoteTag = match[0]
        currentStatement += dollarQuoteTag
        i += dollarQuoteTag.length
        continue
      }
    }

    // Statement Separator
    if (char === ';') {
      const trimmed = currentStatement.trim()
      if (trimmed) {
        statements.push(trimmed)
      }
      currentStatement = ''
      i++
      continue
    }

    currentStatement += char
    i++
  }

  // Final statement
  const lastTrimmed = currentStatement.trim()
  if (lastTrimmed) {
    statements.push(lastTrimmed)
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
