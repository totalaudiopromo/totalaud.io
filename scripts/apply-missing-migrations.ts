import { createAdminClient } from './config'
import fs from 'fs'
import path from 'path'

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
  let inBlockComment = false
  let dollarQuoteTag: string | null = null

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i]

    // Handle Block Comments (/* ... */)
    if (inBlockComment) {
      if (char === '*' && sql[i + 1] === '/') {
        inBlockComment = false
        i++ // skip the '/'
      }
      continue
    }

    // Handle Dollar Quoting ($$ or $tag$)
    if (dollarQuoteTag) {
      currentStatement += char
      if (char === '$' && sql.startsWith(dollarQuoteTag, i)) {
        i += dollarQuoteTag.length - 1
        // Add the rest of the tag
        currentStatement += dollarQuoteTag.substring(1)
        dollarQuoteTag = null
      }
      continue
    }

    // Handle Single Quotes ('...')
    if (inString) {
      currentStatement += char
      if (char === "'") {
        // Check for escaped single quote ('')
        if (sql[i + 1] === "'") {
          currentStatement += "'"
          i++ // skip next quote
        } else {
          inString = false
        }
      }
      continue
    }

    // Handle Single-line Comments (--)
    if (char === '-' && sql[i + 1] === '-') {
      // Skip until end of line
      while (i < sql.length && sql[i] !== '\n') {
        i++
      }
      // Preserve newline to maintain statement structure
      if (i < sql.length) {
        currentStatement += '\n'
      }
      continue
    }

    // Start of String, Dollar Quote, or Block Comment
    if (char === "'") {
      inString = true
      currentStatement += char
      continue
    }

    if (char === '/' && sql[i + 1] === '*') {
      inBlockComment = true
      i++ // skip the '*'
      continue
    }

    if (char === '$') {
      const match = sql.slice(i).match(/^(\$[a-zA-Z0-9_]*\$)/)
      if (match) {
        dollarQuoteTag = match[0]
        currentStatement += dollarQuoteTag
        i += dollarQuoteTag.length - 1
        continue
      }
    }

    // Handle Statement Separator (Outside of any quotes/comments)
    if (!inString && !dollarQuoteTag && !inBlockComment) {
      if (char === ';') {
        const statement = currentStatement.trim()
        if (statement) {
          statements.push(statement)
        }
        currentStatement = ''
        continue
      }
    }

    // Build current statement
    currentStatement += char
  }

  // Final statement
  const lastStatement = currentStatement.trim()
  if (lastStatement) {
    statements.push(lastStatement)
  }

  return statements
}

async function main() {
  const supabase = createAdminClient()
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
