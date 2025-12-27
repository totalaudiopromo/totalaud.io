/**
 * Seed Opportunities Script
 *
 * Seeds the opportunities table with sample data for Scout Mode testing.
 * Run with: pnpm tsx scripts/seed-opportunities.ts
 *
 * Note: Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Sample opportunities data
const SAMPLE_OPPORTUNITIES = [
  // Radio opportunities
  {
    name: 'BBC Radio 1 New Music',
    type: 'radio',
    genres: ['Pop', 'Dance', 'Electronic'],
    vibes: ['Energetic', 'Mainstream'],
    audience_size: 'large',
    url: 'https://www.bbc.co.uk/radio1',
    contact_email: 'radio1.music@bbc.co.uk',
    contact_name: 'Jack Saunders',
    importance: 10,
    description:
      'BBC Radio 1 new music programming. Introduces new talent to mainstream audiences.',
    source: 'curated',
    is_active: true,
  },
  {
    name: 'NTS Radio',
    type: 'radio',
    genres: ['Electronic', 'Experimental', 'Hip-Hop'],
    vibes: ['Underground', 'Experimental'],
    audience_size: 'medium',
    url: 'https://www.nts.live',
    contact_email: 'submissions@nts.live',
    contact_name: null,
    importance: 8,
    description: 'Independent online radio station broadcasting from London and Manchester.',
    source: 'curated',
    is_active: true,
  },
  {
    name: 'Rinse FM',
    type: 'radio',
    genres: ['Dance', 'Electronic', 'Hip-Hop'],
    vibes: ['Energetic', 'Underground'],
    audience_size: 'medium',
    url: 'https://rinse.fm',
    contact_email: 'music@rinse.fm',
    contact_name: null,
    importance: 7,
    description: 'Pirate radio turned legal, championing underground dance music since 1994.',
    source: 'curated',
    is_active: true,
  },
  {
    name: 'Amazing Radio',
    type: 'radio',
    genres: ['Indie', 'Alternative', 'Folk'],
    vibes: ['Chill', 'Uplifting'],
    audience_size: 'small',
    url: 'https://amazingradio.com',
    contact_email: 'music@amazingradio.com',
    contact_name: 'Jim Gellatly',
    importance: 6,
    description: 'Dedicated to discovering and championing new music talent.',
    source: 'curated',
    is_active: true,
  },

  // Playlist opportunities
  {
    name: 'Spotify New Music Friday UK',
    type: 'playlist',
    genres: ['Pop', 'Hip-Hop', 'R&B'],
    vibes: ['Mainstream', 'Energetic'],
    audience_size: 'large',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX4W3aJJYCDfV',
    contact_email: null,
    contact_name: null,
    importance: 10,
    description: 'The biggest new releases every Friday. Massive exposure for featured tracks.',
    source: 'curated',
    is_active: true,
  },
  {
    name: 'Chill Vibes',
    type: 'playlist',
    genres: ['Ambient', 'Electronic', 'Jazz'],
    vibes: ['Chill', 'Emotional'],
    audience_size: 'medium',
    url: 'https://open.spotify.com/playlist/example',
    contact_email: 'submissions@chillvibes.com',
    contact_name: 'Alex Chen',
    importance: 6,
    description: 'Relaxing tracks for focus and meditation. 500K+ followers.',
    source: 'curated',
    is_active: true,
  },
  {
    name: 'Indie Unleashed',
    type: 'playlist',
    genres: ['Indie', 'Alternative', 'Rock'],
    vibes: ['Uplifting', 'Emotional'],
    audience_size: 'medium',
    url: 'https://open.spotify.com/playlist/example2',
    contact_email: 'music@indieunleashed.com',
    contact_name: 'Sarah Williams',
    importance: 5,
    description: 'Discovering the best in independent music. Artist-focused curation.',
    source: 'curated',
    is_active: true,
  },

  // Blog opportunities
  {
    name: 'Stereogum',
    type: 'blog',
    genres: ['Indie', 'Alternative', 'Rock'],
    vibes: ['Experimental', 'Underground'],
    audience_size: 'large',
    url: 'https://www.stereogum.com',
    contact_email: 'tips@stereogum.com',
    contact_name: null,
    importance: 9,
    description: 'Independent music blog covering new releases and emerging artists.',
    source: 'curated',
    is_active: true,
  },
  {
    name: 'The Line of Best Fit',
    type: 'blog',
    genres: ['Indie', 'Folk', 'Electronic'],
    vibes: ['Chill', 'Emotional'],
    audience_size: 'medium',
    url: 'https://www.thelineofbestfit.com',
    contact_email: 'editor@thelineofbestfit.com',
    contact_name: null,
    importance: 8,
    description: 'Award-winning music publication based in London.',
    source: 'curated',
    is_active: true,
  },
  {
    name: 'DIY Magazine',
    type: 'blog',
    genres: ['Indie', 'Rock', 'Pop'],
    vibes: ['Energetic', 'Uplifting'],
    audience_size: 'medium',
    url: 'https://diymag.com',
    contact_email: 'news@diymag.com',
    contact_name: null,
    importance: 7,
    description: 'Independent music magazine championing new bands.',
    source: 'curated',
    is_active: true,
  },

  // Curator opportunities
  {
    name: 'SubmitHub Featured',
    type: 'curator',
    genres: ['All'],
    vibes: ['Mainstream', 'Underground'],
    audience_size: 'medium',
    url: 'https://submithub.com',
    contact_email: null,
    contact_name: null,
    importance: 6,
    description: 'Platform connecting artists with playlist curators and bloggers.',
    source: 'curated',
    is_active: true,
  },
  {
    name: 'James Smith Music',
    type: 'curator',
    genres: ['Electronic', 'Dance', 'Ambient'],
    vibes: ['Chill', 'Experimental'],
    audience_size: 'small',
    url: 'https://twitter.com/jamessmithmusic',
    contact_email: 'james@example.com',
    contact_name: 'James Smith',
    importance: 4,
    description: 'Independent curator with 50K+ playlist followers across genres.',
    source: 'curated',
    is_active: true,
  },

  // Press opportunities
  {
    name: 'NME',
    type: 'press',
    genres: ['Rock', 'Indie', 'Alternative'],
    vibes: ['Energetic', 'Mainstream'],
    audience_size: 'large',
    url: 'https://www.nme.com',
    contact_email: 'news@nme.com',
    contact_name: null,
    importance: 9,
    description: 'Iconic British music publication covering rock and indie.',
    source: 'curated',
    is_active: true,
  },
  {
    name: 'Clash Magazine',
    type: 'press',
    genres: ['Pop', 'Hip-Hop', 'Electronic'],
    vibes: ['Mainstream', 'Uplifting'],
    audience_size: 'medium',
    url: 'https://www.clashmusic.com',
    contact_email: 'editor@clashmusic.com',
    contact_name: null,
    importance: 7,
    description: 'Multi-platform music publication with focus on pop culture.',
    source: 'curated',
    is_active: true,
  },
  {
    name: 'Gigwise',
    type: 'press',
    genres: ['Indie', 'Rock', 'Folk'],
    vibes: ['Underground', 'Emotional'],
    audience_size: 'small',
    url: 'https://gigwise.com',
    contact_email: 'tips@gigwise.com',
    contact_name: null,
    importance: 5,
    description: 'Music news and reviews site focused on live music.',
    source: 'curated',
    is_active: true,
  },
]

async function seedOpportunities() {
  console.log('🌱 Seeding opportunities...\n')

  // First, check if opportunities table exists and has data
  const { data: existing, error: checkError } = await supabase
    .from('opportunities')
    .select('id')
    .limit(1)

  if (checkError) {
    console.error('Error checking opportunities table:', checkError.message)
    console.error('\nMake sure the opportunities table exists with the correct schema.')
    process.exit(1)
  }

  if (existing && existing.length > 0) {
    console.log('⚠️  Opportunities table already has data.')
    console.log('   Delete existing data first if you want to re-seed.\n')

    const { count } = await supabase
      .from('opportunities')
      .select('*', { count: 'exact', head: true })

    console.log(`   Current count: ${count} opportunities`)
    process.exit(0)
  }

  // Insert sample opportunities
  const { data, error } = await supabase.from('opportunities').insert(SAMPLE_OPPORTUNITIES).select()

  if (error) {
    console.error('Error seeding opportunities:', error.message)
    console.error(error.details)
    process.exit(1)
  }

  console.log(`✅ Seeded ${data?.length || 0} opportunities:\n`)

  // Group by type for summary
  const byType: Record<string, number> = {}
  for (const opp of data || []) {
    byType[opp.type] = (byType[opp.type] || 0) + 1
  }

  for (const [type, count] of Object.entries(byType)) {
    console.log(`   ${type}: ${count}`)
  }

  console.log('\n🎉 Done!')
}

seedOpportunities().catch(console.error)
