import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ucncbighzqudaszewjrv.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const VERIFY_USER_ID = '62a086b1-411e-4d2b-894e-71dfd8cb5d4e'
const TRACK_ID = '00000000-0000-0000-0000-000000000001'

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedData() {
  console.log('Seeding data for user:', VERIFY_USER_ID)

  // 1. Create a mock audio asset (track anchor)
  const { error: assetError } = await supabase.from('artist_assets').upsert({
    id: TRACK_ID,
    user_id: VERIFY_USER_ID,
    kind: 'audio',
    title: 'Acoustic Journey',
    mime_type: 'audio/mpeg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (assetError) {
    console.error('Error seeding artist_assets:', assetError)
    // Check if table exists
    if (assetError.code === 'PGRST204' || assetError.code === '42P01') {
      console.log('Table artist_assets might be missing. Checking available tables...')
    }
  } else {
    console.log('Successfully seeded artist_assets')
  }

  // 2. Create track_memory base
  const { data: memory, error: memoryError } = await supabase
    .from('track_memory')
    .upsert({
      user_id: VERIFY_USER_ID,
      track_id: TRACK_ID,
      canonical_intent: 'A quiet, reflective release about transition and leaving things behind.',
      canonical_intent_updated_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (memoryError) {
    console.error('Error seeding track_memory:', memoryError)
  } else {
    console.log('Successfully seeded track_memory:', memory.id)

    // 3. Insert intent memory entry
    const { error: entryError } = await supabase.from('track_memory_entries').insert({
      track_memory_id: memory.id,
      user_id: VERIFY_USER_ID,
      entry_type: 'intent',
      payload: {
        intent: 'A quiet, reflective release about transition and leaving things behind.',
      },
      source_mode: 'ideas',
      created_at: new Date().toISOString(),
    })

    if (entryError) {
      console.error('Error seeding track_memory_entries:', entryError)
    } else {
      console.log('Successfully seeded track_memory_entries')
    }
  }
}

seedData().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})
