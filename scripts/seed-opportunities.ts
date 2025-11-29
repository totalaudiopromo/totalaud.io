#!/usr/bin/env npx tsx
/**
 * Seed Opportunities Script
 *
 * Sources:
 * 1. Airtable "Radio Contacts" table (primary source)
 * 2. Curated manual entries for playlists/blogs
 * 3. Optional: Perplexity research for additional opportunities
 *
 * GDPR Compliance:
 * - Only imports corporate email addresses
 * - Tracks source URL for each record
 * - Sets verification timestamp
 *
 * Usage:
 *   pnpm tsx scripts/seed-opportunities.ts
 *   pnpm tsx scripts/seed-opportunities.ts --dry-run
 */

import { createClient } from '@supabase/supabase-js'

// ============================================
// Configuration
// ============================================

const SUPABASE_URL = 'https://ucncbighzqudaszewjrv.supabase.co'
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbmNiaWdoenF1ZGFzemV3anJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkxNTYyMSwiZXhwIjoyMDc0NDkxNjIxfQ.jNbVTjvh7uOGINRPXJ6TFQJuNEbOLuOccVm8nqnlgPE'

const AIRTABLE_API_KEY =
  'patH8DF1YEieVCSvo.67dba69700daaf313291239b9a27544aca935e4efb915153fab27c35927dfe1a'
const AIRTABLE_BASE_ID = 'appx7uTQWRH8cIC20'
const AIRTABLE_TABLE_ID = 'tblcZnUsB4Swyjcip' // Radio Contacts

// ============================================
// Types
// ============================================

interface AirtableRecord {
  id: string
  fields: {
    Email?: string
    'First Name'?: string
    'Last Name'?: string
    Station?: string
    Genres?: string[] | string
    'Region / Country'?: string
    'Station Tier'?: string
    'Enrichment Quality'?: string
    'Enrichment Notes'?: string
    Show?: string
    Status?: string
  }
}

interface Opportunity {
  name: string
  type: 'radio' | 'playlist' | 'blog' | 'curator' | 'press'
  genres: string[]
  vibes: string[]
  url?: string
  contact_email?: string
  contact_name?: string
  audience_size: 'small' | 'medium' | 'large'
  importance: number
  description?: string
  source: 'curated' | 'airtable' | 'manual' | 'research'
  source_url?: string
  last_verified_at: string
  is_active: boolean
}

// ============================================
// Utility Functions
// ============================================

/**
 * Check if email is a corporate/business email (not personal)
 */
function isCorporateEmail(email: string): boolean {
  if (!email) return false

  const personalDomains = [
    'gmail.com',
    'googlemail.com',
    'hotmail.com',
    'hotmail.co.uk',
    'outlook.com',
    'live.com',
    'yahoo.com',
    'yahoo.co.uk',
    'icloud.com',
    'me.com',
    'aol.com',
    'protonmail.com',
    'proton.me',
    'mail.com',
    'gmx.com',
    'ymail.com',
  ]

  const domain = email.split('@')[1]?.toLowerCase()
  return domain ? !personalDomains.includes(domain) : false
}

/**
 * Map Airtable station tier to audience size
 */
function mapAudienceSize(tier?: string): 'small' | 'medium' | 'large' {
  if (!tier) return 'medium'

  const tierLower = tier.toLowerCase()
  if (tierLower.includes('national') || tierLower.includes('premium')) return 'large'
  if (tierLower.includes('regional')) return 'medium'
  if (tierLower.includes('community') || tierLower.includes('local')) return 'small'

  return 'medium'
}

/**
 * Parse genres from Airtable (can be array or comma-separated string)
 */
function parseGenres(genres?: string[] | string): string[] {
  if (!genres) return []
  if (Array.isArray(genres)) return genres.map((g) => g.trim())
  return genres.split(',').map((g) => g.trim())
}

/**
 * Infer vibes from genre and enrichment notes
 */
function inferVibes(genres: string[], enrichmentNotes?: string): string[] {
  const vibes: string[] = []

  const genreStr = genres.join(' ').toLowerCase()
  const notes = (enrichmentNotes || '').toLowerCase()

  if (genreStr.includes('ambient') || genreStr.includes('chill') || notes.includes('relaxed')) {
    vibes.push('Chill')
  }
  if (genreStr.includes('punk') || genreStr.includes('rock') || genreStr.includes('metal')) {
    vibes.push('Energetic')
  }
  if (genreStr.includes('electronic') || genreStr.includes('dance') || genreStr.includes('house')) {
    vibes.push('Upbeat')
  }
  if (genreStr.includes('folk') || genreStr.includes('acoustic') || genreStr.includes('singer')) {
    vibes.push('Emotional')
  }
  if (genreStr.includes('experimental') || notes.includes('experimental')) {
    vibes.push('Experimental')
  }
  if (notes.includes('underground') || notes.includes('indie')) {
    vibes.push('Underground')
  }

  return vibes.length > 0 ? vibes : ['Varied']
}

/**
 * Calculate importance based on enrichment quality and tier
 */
function calculateImportance(quality?: string, tier?: string): number {
  let importance = 2 // Default medium

  if (quality === 'High') importance += 2
  else if (quality === 'Medium') importance += 1

  if (tier?.toLowerCase().includes('national')) importance += 1
  if (tier?.toLowerCase().includes('premium')) importance += 1

  return Math.min(importance, 5) // Cap at 5
}

// ============================================
// Airtable Fetching
// ============================================

async function fetchAirtableContacts(): Promise<AirtableRecord[]> {
  console.log('📥 Fetching contacts from Airtable...\n')

  const allRecords: AirtableRecord[] = []
  let offset: string | undefined

  do {
    const url = offset
      ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?offset=${offset}`
      : `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    })

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    allRecords.push(...data.records)
    offset = data.offset
  } while (offset)

  console.log(`✅ Fetched ${allRecords.length} total contacts from Airtable\n`)
  return allRecords
}

/**
 * Filter and transform Airtable records to opportunities
 */
function processAirtableRecords(records: AirtableRecord[]): Opportunity[] {
  console.log('🔍 Filtering for high-quality opportunities with corporate emails...\n')

  const opportunities: Opportunity[] = []
  const seen = new Set<string>()

  for (const record of records) {
    const { fields } = record
    const email = fields.Email?.trim()
    const station = fields.Station?.trim()
    const quality = fields['Enrichment Quality']

    // Skip if no email, no station name, or personal email
    if (!email || email === 'no-email' || !station) continue
    if (!isCorporateEmail(email)) continue

    // Skip duplicates by email
    if (seen.has(email.toLowerCase())) continue
    seen.add(email.toLowerCase())

    // Only include High or Medium quality
    if (quality !== 'High' && quality !== 'Medium') continue

    const genres = parseGenres(fields.Genres)
    const contactName = [fields['First Name'], fields['Last Name']].filter(Boolean).join(' ').trim()

    const opportunity: Opportunity = {
      name: station,
      type: 'radio',
      genres,
      vibes: inferVibes(genres, fields['Enrichment Notes']),
      contact_email: email,
      contact_name: contactName || undefined,
      audience_size: mapAudienceSize(fields['Station Tier']),
      importance: calculateImportance(quality, fields['Station Tier']),
      description:
        fields['Enrichment Notes']?.slice(0, 500) ||
        `${station} - ${fields['Region / Country'] || 'UK'} radio station`,
      source: 'airtable',
      source_url: 'https://airtable.com/appx7uTQWRH8cIC20',
      last_verified_at: new Date().toISOString(),
      is_active: true,
    }

    opportunities.push(opportunity)
  }

  console.log(`✅ Filtered to ${opportunities.length} high-quality radio opportunities\n`)
  return opportunities
}

// ============================================
// Curated Opportunities (Playlists, Blogs, Press)
// ============================================

const CURATED_OPPORTUNITIES: Opportunity[] = [
  // UK Radio - Major
  {
    name: 'BBC Radio 6 Music',
    type: 'radio',
    genres: ['Alternative', 'Indie', 'Electronic', 'Experimental'],
    vibes: ['Eclectic', 'Underground'],
    url: 'https://www.bbc.co.uk/6music',
    audience_size: 'large',
    importance: 5,
    description:
      "BBC's alternative music station. Key shows include Lauren Laverne, Mary Anne Hobbs, and Gilles Peterson.",
    source: 'curated',
    source_url: 'https://www.bbc.co.uk/6music',
    last_verified_at: new Date().toISOString(),
    is_active: true,
  },
  {
    name: 'BBC Introducing',
    type: 'radio',
    genres: ['All Genres'],
    vibes: ['Emerging', 'Fresh'],
    url: 'https://www.bbc.co.uk/introducing',
    audience_size: 'large',
    importance: 5,
    description:
      "BBC's platform for unsigned and emerging artists. Submit via the Uploader for consideration across all BBC stations.",
    source: 'curated',
    source_url: 'https://www.bbc.co.uk/introducing',
    last_verified_at: new Date().toISOString(),
    is_active: true,
  },

  // UK Radio - Independent
  {
    name: 'NTS Radio',
    type: 'radio',
    genres: ['Electronic', 'Experimental', 'World', 'Jazz'],
    vibes: ['Underground', 'Eclectic', 'Cutting Edge'],
    url: 'https://www.nts.live',
    audience_size: 'medium',
    importance: 4,
    description:
      'Independent online radio station broadcasting from London and Manchester. Known for eclectic programming and tastemaker DJs.',
    source: 'curated',
    source_url: 'https://www.nts.live',
    last_verified_at: new Date().toISOString(),
    is_active: true,
  },
  {
    name: 'Soho Radio',
    type: 'radio',
    genres: ['Indie', 'Soul', 'Jazz', 'Electronic'],
    vibes: ['Urban', 'Eclectic'],
    url: 'https://www.sohoradio.co.uk',
    audience_size: 'small',
    importance: 3,
    description:
      'London-based community radio station broadcasting from Soho. Strong local following and music industry listeners.',
    source: 'curated',
    source_url: 'https://www.sohoradio.co.uk',
    last_verified_at: new Date().toISOString(),
    is_active: true,
  },
  {
    name: 'Amazing Radio',
    type: 'radio',
    genres: ['Indie', 'Alternative', 'Pop'],
    vibes: ['Fresh', 'Emerging'],
    url: 'https://amazingradio.com',
    contact_email: 'music@amazingradio.com',
    audience_size: 'medium',
    importance: 4,
    description:
      'UK/US radio station dedicated to new and emerging artists. Known for breaking new acts.',
    source: 'curated',
    source_url: 'https://amazingradio.com',
    last_verified_at: new Date().toISOString(),
    is_active: true,
  },

  // US Radio
  {
    name: 'KEXP',
    type: 'radio',
    genres: ['Indie', 'Alternative', 'World', 'Electronic'],
    vibes: ['Eclectic', 'Tastemaker'],
    url: 'https://www.kexp.org',
    audience_size: 'large',
    importance: 5,
    description:
      'Seattle-based non-profit radio station. Globally influential tastemaker with live sessions and album premieres.',
    source: 'curated',
    source_url: 'https://www.kexp.org',
    last_verified_at: new Date().toISOString(),
    is_active: true,
  },
  {
    name: 'KCRW',
    type: 'radio',
    genres: ['Indie', 'Electronic', 'World'],
    vibes: ['Sophisticated', 'Tastemaker'],
    url: 'https://www.kcrw.com',
    audience_size: 'large',
    importance: 5,
    description:
      'Los Angeles public radio station. Morning Becomes Eclectic is one of the most influential music shows in the US.',
    source: 'curated',
    source_url: 'https://www.kcrw.com',
    last_verified_at: new Date().toISOString(),
    is_active: true,
  },

  // Music Blogs
  {
    name: 'The Line of Best Fit',
    type: 'blog',
    genres: ['Indie', 'Alternative', 'Electronic', 'Pop'],
    vibes: ['Tastemaker', 'Underground'],
    url: 'https://www.thelineofbestfit.com',
    contact_email: 'music@thelineofbestfit.com',
    audience_size: 'large',
    importance: 5,
    description:
      'Leading UK music blog covering indie, alternative, and electronic music. Strong industry influence.',
    source: 'curated',
    source_url: 'https://www.thelineofbestfit.com',
    last_verified_at: new Date().toISOString(),
    is_active: true,
  },
  {
    name: 'DIY Magazine',
    type: 'blog',
    genres: ['Indie', 'Rock', 'Alternative'],
    vibes: ['Emerging', 'Underground'],
    url: 'https://diymag.com',
    contact_email: 'music@diymag.com',
    audience_size: 'medium',
    importance: 4,
    description:
      'UK music magazine and website focused on indie and alternative music. Known for breaking new acts.',
    source: 'curated',
    source_url: 'https://diymag.com',
    last_verified_at: new Date().toISOString(),
    is_active: true,
  },
  {
    name: 'Clash Magazine',
    type: 'blog',
    genres: ['Indie', 'Pop', 'Electronic', 'Hip-Hop'],
    vibes: ['Mainstream', 'Eclectic'],
    url: 'https://www.clashmusic.com',
    audience_size: 'medium',
    importance: 4,
    description: 'UK music and culture magazine with broad coverage across genres.',
    source: 'curated',
    source_url: 'https://www.clashmusic.com',
    last_verified_at: new Date().toISOString(),
    is_active: true,
  },
  {
    name: 'The Quietus',
    type: 'blog',
    genres: ['Experimental', 'Indie', 'Electronic', 'Metal'],
    vibes: ['Experimental', 'Underground', 'Eclectic'],
    url: 'https://thequietus.com',
    audience_size: 'medium',
    importance: 4,
    description:
      'Independent UK music and culture website known for in-depth coverage of experimental and underground music.',
    source: 'curated',
    source_url: 'https://thequietus.com',
    last_verified_at: new Date().toISOString(),
    is_active: true,
  },
  {
    name: 'Stereogum',
    type: 'blog',
    genres: ['Indie', 'Alternative', 'Rock'],
    vibes: ['Tastemaker', 'Indie'],
    url: 'https://www.stereogum.com',
    audience_size: 'large',
    importance: 5,
    description:
      'Major US indie music blog with significant influence in the alternative music scene.',
    source: 'curated',
    source_url: 'https://www.stereogum.com',
    last_verified_at: new Date().toISOString(),
    is_active: true,
  },
  {
    name: 'Pitchfork',
    type: 'press',
    genres: ['Indie', 'Electronic', 'Hip-Hop', 'Pop'],
    vibes: ['Tastemaker', 'Critical'],
    url: 'https://pitchfork.com',
    audience_size: 'large',
    importance: 5,
    description:
      'The most influential music publication. A positive review here can launch careers.',
    source: 'curated',
    source_url: 'https://pitchfork.com',
    last_verified_at: new Date().toISOString(),
    is_active: true,
  },

  // Playlist Curators
  {
    name: 'Spotify Fresh Finds',
    type: 'playlist',
    genres: ['Indie', 'Pop', 'Alternative'],
    vibes: ['Fresh', 'Emerging'],
    url: 'https://open.spotify.com/playlist/37i9dQZF1DWWjGdmeTyeJ6',
    audience_size: 'large',
    importance: 5,
    description:
      "Spotify's editorial playlist for emerging artists. Algorithmic + editorial selection.",
    source: 'curated',
    source_url: 'https://artists.spotify.com',
    last_verified_at: new Date().toISOString(),
    is_active: true,
  },
  {
    name: 'Spotify POLLEN',
    type: 'playlist',
    genres: ['Electronic', 'Indie', 'Alternative'],
    vibes: ['Experimental', 'Cutting Edge'],
    url: 'https://open.spotify.com/playlist/37i9dQZF1DWWBHeXOYZf74',
    audience_size: 'large',
    importance: 5,
    description: "Spotify's genre-fluid playlist for boundary-pushing artists.",
    source: 'curated',
    source_url: 'https://artists.spotify.com',
    last_verified_at: new Date().toISOString(),
    is_active: true,
  },
  {
    name: 'Apple Music New Music Daily',
    type: 'playlist',
    genres: ['Pop', 'Hip-Hop', 'R&B', 'Indie'],
    vibes: ['Fresh', 'Mainstream'],
    url: 'https://music.apple.com/playlist/new-music-daily/pl.2b0e6e332fdf4b7a91164da3162127b5',
    audience_size: 'large',
    importance: 5,
    description: "Apple Music's flagship daily new releases playlist.",
    source: 'curated',
    source_url: 'https://artists.apple.com',
    last_verified_at: new Date().toISOString(),
    is_active: true,
  },

  // Independent Curators
  {
    name: 'Indie Shuffle',
    type: 'curator',
    genres: ['Indie', 'Electronic', 'Folk'],
    vibes: ['Indie', 'Eclectic'],
    url: 'https://www.indieshuffle.com',
    contact_email: 'music@indieshuffle.com',
    audience_size: 'medium',
    importance: 3,
    description: 'Music blog and playlist curator with a focus on indie and electronic music.',
    source: 'curated',
    source_url: 'https://www.indieshuffle.com',
    last_verified_at: new Date().toISOString(),
    is_active: true,
  },
  {
    name: 'Hype Machine',
    type: 'curator',
    genres: ['Indie', 'Electronic', 'Alternative'],
    vibes: ['Tastemaker', 'Blog Aggregate'],
    url: 'https://hypem.com',
    audience_size: 'medium',
    importance: 4,
    description: 'Music blog aggregator that tracks what music blogs are posting.',
    source: 'curated',
    source_url: 'https://hypem.com',
    last_verified_at: new Date().toISOString(),
    is_active: true,
  },
]

// ============================================
// Supabase Seeding
// ============================================

async function seedToSupabase(opportunities: Opportunity[], dryRun: boolean): Promise<void> {
  if (dryRun) {
    console.log('🧪 DRY RUN - Would insert the following opportunities:\n')
    opportunities.slice(0, 10).forEach((opp, i) => {
      console.log(`${i + 1}. [${opp.type}] ${opp.name} (${opp.audience_size})`)
      console.log(`   Genres: ${opp.genres.join(', ')}`)
      console.log(`   Email: ${opp.contact_email || 'N/A'}`)
      console.log('')
    })
    if (opportunities.length > 10) {
      console.log(`... and ${opportunities.length - 10} more\n`)
    }
    console.log(`Total: ${opportunities.length} opportunities would be inserted\n`)
    return
  }

  console.log('📤 Seeding opportunities to Supabase...\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // First, clear existing opportunities (for clean reseed)
  console.log('🗑️  Clearing existing opportunities...')
  const { error: deleteError } = await supabase
    .from('opportunities')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (deleteError) {
    console.error('Error clearing opportunities:', deleteError)
    // Continue anyway - table might be empty
  }

  // Insert in batches of 50
  const batchSize = 50
  let inserted = 0

  for (let i = 0; i < opportunities.length; i += batchSize) {
    const batch = opportunities.slice(i, i + batchSize)

    const { data, error } = await supabase.from('opportunities').insert(batch).select('id')

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
      continue
    }

    inserted += data?.length || 0
    console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${data?.length} records`)
  }

  console.log(`\n🎉 Successfully seeded ${inserted} opportunities!\n`)
}

// ============================================
// Main
// ============================================

async function main(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('          SCOUT MODE - OPPORTUNITY SEEDER')
  console.log('═══════════════════════════════════════════════════════════\n')

  const dryRun = process.argv.includes('--dry-run')
  if (dryRun) {
    console.log('🧪 Running in DRY RUN mode - no data will be inserted\n')
  }

  try {
    // 1. Fetch and process Airtable contacts
    const airtableRecords = await fetchAirtableContacts()
    const airtableOpportunities = processAirtableRecords(airtableRecords)

    // 2. Combine with curated opportunities
    const allOpportunities = [...CURATED_OPPORTUNITIES, ...airtableOpportunities]

    // 3. Sort by importance (highest first)
    allOpportunities.sort((a, b) => b.importance - a.importance)

    // 4. Limit to top 100 for MVP
    const finalOpportunities = allOpportunities.slice(0, 100)

    console.log('📊 SUMMARY')
    console.log('═══════════════════════════════════════════════════════════')
    console.log(`Curated opportunities: ${CURATED_OPPORTUNITIES.length}`)
    console.log(`Airtable opportunities: ${airtableOpportunities.length}`)
    console.log(`Total combined: ${allOpportunities.length}`)
    console.log(`Final selection (top 100): ${finalOpportunities.length}`)
    console.log('')

    // 5. Show type distribution
    const byType: Record<string, number> = {}
    finalOpportunities.forEach((opp) => {
      byType[opp.type] = (byType[opp.type] || 0) + 1
    })
    console.log('By type:')
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`)
    })
    console.log('')

    // 6. Seed to Supabase
    await seedToSupabase(finalOpportunities, dryRun)

    console.log('✅ Seeding complete!\n')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
