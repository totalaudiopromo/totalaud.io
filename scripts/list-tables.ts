import { createAdminClient } from './config'

const supabase = createAdminClient()

interface TableMetadata {
  table_name: string
}

async function listTables() {
  console.log('🔍 Fetching tables via get_tables RPC...')
  const { data, error } = await supabase.rpc('get_tables')

  if (error) {
    console.warn('⚠️ get_tables RPC failed or not found. Falling back to table_metadata view...')
    // Fallback to a safe public view that returns table metadata
    const { data: tables, error: tableError } = await supabase
      .from('table_metadata')
      .select('table_name')

    if (tableError) {
      console.error(
        '❌ Error fetching tables via get_tables RPC or table_metadata view:',
        tableError.message
      )
      console.log(
        'Note: This script requires either the get_tables() RPC or the table_metadata view to be defined in Supabase.'
      )
      process.exit(1)
    }
    const typedTables = tables as TableMetadata[]
    console.log(
      '✅ Tables found via fallback:',
      typedTables.map((t: TableMetadata) => t.table_name).join(', ')
    )
  } else {
    console.log('✅ Tables:', data)
  }
}

listTables().catch(console.error)
