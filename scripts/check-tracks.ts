import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ucncbighzqudaszewjrv.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTracks() {
  const userId = 'c5c261a8-8b35-4e77-ae6d-e293e65d746d'

  // Try to find any audio assets for this user
  const { data: assets, error } = await supabase
    .from('artist_assets')
    .select('id, name')
    .eq('user_id', userId)
    .eq('kind', 'audio')
    .limit(5)

  if (error) {
    console.error('Error fetching assets:', error)
    return
  }

  console.log('Tracks found:', JSON.stringify(assets, null, 2))
}

checkTracks()
