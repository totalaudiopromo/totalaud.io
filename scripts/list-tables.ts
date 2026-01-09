import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ucncbighzqudaszewjrv.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is missing.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY as string)

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables')
  if (error) {
    // Fallback to a safe public view that returns table metadata
    const { data: tables, error: tableError } = await supabase
      .from('table_metadata')
      .select('table_name')

    if (tableError) {
      console.error(
        '❌ Error fetching tables via get_tables RPC or table_metadata view:',
        tableError.message
      )
      console.log('Note: Ensure either get_tables() RPC or table_metadata view is defined.')
      return
    }
    console.log('Tables:', tables.map((t) => t.table_name).join(', '))
  } else {
    console.log('Tables:', data)
  }
}

listTables()
