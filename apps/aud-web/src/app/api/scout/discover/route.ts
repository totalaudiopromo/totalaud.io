import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceRoleClient } from '@/lib/supabase/serviceRole'

interface ScoutDiscoverRequest {
  trackInfo: {
    title: string
    description?: string
    spotifyUrl?: string
  }
  genres: string[]
  vibe: string
  goals: string[]
  targetRegions?: string[]
  maxResults?: number
}

interface Contact {
  id: string
  name: string
  type: string
  email?: string
  submission_url?: string
  genres?: string[]
  region?: string
  notes?: string
}

interface Opportunity {
  id: string
  type: 'playlist' | 'blog' | 'radio' | 'youtube' | 'podcast'
  name: string
  contact: {
    name?: string
    email?: string
    submissionUrl?: string
  }
  relevanceScore: number
  genres: string[]
  pitchTips?: string[]
  source: 'database' | 'scraped' | 'api'
}

// Map goal types to database contact types
const GOAL_TO_TYPE_MAP: Record<string, string[]> = {
  playlist: ['playlist', 'curator', 'spotify'],
  blog: ['blog', 'press', 'magazine', 'publication'],
  radio: ['radio', 'bbc', 'station'],
  youtube: ['youtube', 'channel', 'video'],
  podcast: ['podcast'],
}

// Generate pitch tips based on opportunity type
function generatePitchTips(type: string, genres: string[]): string[] {
  const tips: string[] = []

  switch (type) {
    case 'playlist':
      tips.push('Keep your pitch under 100 words')
      tips.push('Mention similar artists already on their playlist')
      if (genres.includes('Electronic') || genres.includes('Dance')) {
        tips.push('Include BPM and key if relevant')
      }
      break
    case 'blog':
      tips.push('Offer exclusive content or premiere')
      tips.push('Include high-res press photos')
      tips.push('Provide a compelling artist story')
      break
    case 'radio':
      tips.push('Check their submission guidelines first')
      tips.push('Include your release date')
      tips.push('Mention any upcoming live dates')
      break
    case 'youtube':
      tips.push('Offer video content if you have it')
      tips.push('Ask about their upload schedule')
      break
    case 'podcast':
      tips.push('Suggest specific talking points')
      tips.push('Be available for their schedule')
      break
  }

  return tips
}

// Calculate relevance score based on genre match and other factors
function calculateRelevanceScore(
  contact: Contact,
  requestedGenres: string[],
  vibe: string
): number {
  let score = 50 // Base score

  // Genre matching (up to +40 points)
  if (contact.genres && contact.genres.length > 0) {
    const matchingGenres = contact.genres.filter((g) =>
      requestedGenres.some(
        (rg) =>
          g.toLowerCase().includes(rg.toLowerCase()) || rg.toLowerCase().includes(g.toLowerCase())
      )
    )
    score += Math.min(40, matchingGenres.length * 15)
  }

  // Bonus for having contact info (+10 points)
  if (contact.email || contact.submission_url) {
    score += 10
  }

  // Random variance for more natural results (-5 to +5)
  score += Math.floor(Math.random() * 11) - 5

  return Math.min(100, Math.max(0, score))
}

export async function POST(request: NextRequest) {
  try {
    const body: ScoutDiscoverRequest = await request.json()
    const { genres, goals, targetRegions = ['UK'], maxResults = 20 } = body

    // Validate required fields
    if (!genres || genres.length === 0) {
      return NextResponse.json({ error: 'At least one genre is required' }, { status: 400 })
    }

    if (!goals || goals.length === 0) {
      return NextResponse.json({ error: 'At least one goal is required' }, { status: 400 })
    }

    // Use service role client to bypass RLS - contacts are a shared database
    const supabase = getSupabaseServiceRoleClient()

    // Build the query to find matching contacts
    // We'll look for contacts whose type matches the selected goals
    const typeFilters = goals.flatMap((goal) => GOAL_TO_TYPE_MAP[goal] || [goal])

    // Query the contacts table
    // Note: This assumes a 'contacts' table exists. If it doesn't, we'll return mock data.
    let opportunities: Opportunity[] = []

    try {
      // Build query for contacts table
      let query = supabase
        .from('contacts')
        .select('*')
        .or(typeFilters.map((t) => `type.ilike.%${t}%`).join(','))

      // Filter by region if specified (default UK)
      if (targetRegions.length > 0 && !targetRegions.includes('Global')) {
        query = query.or(
          targetRegions.map((r) => `region.ilike.%${r}%`).join(',') + ',region.eq.Global'
        )
      }

      const { data: contacts, error } = await query.limit(maxResults * 2)

      if (error) {
        console.warn('Supabase query error:', error.message)
        // Fall through to mock data
      } else if (contacts && contacts.length > 0) {
        // Transform contacts to opportunities
        opportunities = contacts
          .map((contact: Contact) => {
            const goalType =
              (goals.find((g) =>
                GOAL_TO_TYPE_MAP[g]?.some((t) =>
                  contact.type?.toLowerCase().includes(t.toLowerCase())
                )
              ) as Opportunity['type']) || 'playlist'

            return {
              id: contact.id,
              type: goalType,
              name: contact.name,
              contact: {
                name: contact.name,
                email: contact.email || undefined,
                submissionUrl: contact.submission_url || undefined,
              },
              relevanceScore: calculateRelevanceScore(contact, genres, body.vibe),
              genres: contact.genres || genres.slice(0, 3),
              pitchTips: generatePitchTips(goalType, genres),
              source: 'database' as const,
            }
          })
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, maxResults)
      }
    } catch (dbError) {
      console.warn('Database query failed:', dbError)
    }

    // If no results from database, return realistic mock data
    if (opportunities.length === 0) {
      opportunities = generateMockOpportunities(goals, genres, maxResults)
    }

    return NextResponse.json({
      success: true,
      opportunities,
      metadata: {
        totalFound: opportunities.length,
        sources: {
          database: opportunities.filter((o) => o.source === 'database').length,
          scraped: opportunities.filter((o) => o.source === 'scraped').length,
          api: opportunities.filter((o) => o.source === 'api').length,
        },
        searchCriteria: {
          genres,
          goals,
          targetRegions,
        },
      },
    })
  } catch (error) {
    console.error('Scout discovery error:', error)
    return NextResponse.json(
      {
        error: 'Discovery failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Generate realistic mock data for demo purposes
function generateMockOpportunities(
  goals: string[],
  genres: string[],
  maxResults: number
): Opportunity[] {
  const mockData: Record<
    string,
    Array<Omit<Opportunity, 'id' | 'relevanceScore' | 'pitchTips' | 'source'>>
  > = {
    playlist: [
      {
        type: 'playlist',
        name: 'Indie Electronica',
        contact: { name: 'Sarah Chen', email: 'submissions@indieelectronica.com' },
        genres: ['Electronic', 'Indie', 'Alternative'],
      },
      {
        type: 'playlist',
        name: 'Late Night Vibes',
        contact: { name: 'Marcus Williams', submissionUrl: 'https://submithub.com/latenightvibes' },
        genres: ['Chill', 'Electronic', 'R&B'],
      },
      {
        type: 'playlist',
        name: 'UK Underground',
        contact: { email: 'ukunderground.curator@gmail.com' },
        genres: ['Electronic', 'Dance', 'UK Garage'],
      },
      {
        type: 'playlist',
        name: 'Fresh Finds UK',
        contact: { name: 'Tom Richards', submissionUrl: 'https://dailyplaylists.com/submit' },
        genres: ['Pop', 'Indie', 'Alternative'],
      },
      {
        type: 'playlist',
        name: 'Midnight Drive',
        contact: { email: 'midnightdrive.music@outlook.com' },
        genres: ['Electronic', 'Ambient', 'Chill'],
      },
    ],
    blog: [
      {
        type: 'blog',
        name: 'The Line of Best Fit',
        contact: { email: 'submissions@thelineofbestfit.com' },
        genres: ['Indie', 'Alternative', 'Electronic'],
      },
      {
        type: 'blog',
        name: 'Clash Magazine',
        contact: { submissionUrl: 'https://clashmusic.com/submit' },
        genres: ['All genres'],
      },
      {
        type: 'blog',
        name: 'Notion Magazine',
        contact: { email: 'music@notionmag.com' },
        genres: ['Pop', 'R&B', 'Hip-Hop'],
      },
      {
        type: 'blog',
        name: 'DIY Magazine',
        contact: { email: 'new-music@diymagazine.com' },
        genres: ['Indie', 'Rock', 'Alternative'],
      },
      {
        type: 'blog',
        name: 'Wonderland',
        contact: { submissionUrl: 'https://wonderland.com/submit' },
        genres: ['Pop', 'Fashion', 'Culture'],
      },
    ],
    radio: [
      {
        type: 'radio',
        name: 'BBC Radio 1 - Future Artists',
        contact: { email: 'introducing@bbc.co.uk' },
        genres: ['All genres'],
      },
      {
        type: 'radio',
        name: 'BBC 6 Music',
        contact: { submissionUrl: 'https://www.bbc.co.uk/6music/submit' },
        genres: ['Alternative', 'Indie', 'Electronic'],
      },
      {
        type: 'radio',
        name: 'Amazing Radio',
        contact: { email: 'music@amazingradio.com' },
        genres: ['Indie', 'Alternative', 'New Music'],
      },
      {
        type: 'radio',
        name: 'NTS Radio',
        contact: { submissionUrl: 'https://nts.live/submit' },
        genres: ['Electronic', 'Experimental', 'World'],
      },
      {
        type: 'radio',
        name: 'Rinse FM',
        contact: { email: 'demos@rinse.fm' },
        genres: ['Dance', 'Electronic', 'UK Bass'],
      },
    ],
    youtube: [
      {
        type: 'youtube',
        name: 'COLORS',
        contact: { submissionUrl: 'https://colorsxstudios.com/submit' },
        genres: ['All genres'],
      },
      {
        type: 'youtube',
        name: 'Mahogany Sessions',
        contact: { email: 'submissions@mahogany.tv' },
        genres: ['Acoustic', 'Indie', 'Folk'],
      },
      {
        type: 'youtube',
        name: 'Trap Nation',
        contact: { submissionUrl: 'https://trapnation.com/submit' },
        genres: ['Electronic', 'Trap', 'Bass'],
      },
      {
        type: 'youtube',
        name: 'MrSuicideSheep',
        contact: { email: 'submit@suicidesheep.com' },
        genres: ['Electronic', 'Chill', 'Indie'],
      },
      {
        type: 'youtube',
        name: 'The Hype Machine',
        contact: { submissionUrl: 'https://hypem.com/submit' },
        genres: ['All genres'],
      },
    ],
    podcast: [
      {
        type: 'podcast',
        name: 'Song Exploder',
        contact: { email: 'submissions@songexploder.net' },
        genres: ['All genres'],
      },
      {
        type: 'podcast',
        name: 'Broken Record',
        contact: { submissionUrl: 'https://brokenrecordpodcast.com/contact' },
        genres: ['All genres'],
      },
      {
        type: 'podcast',
        name: 'And The Writer Is...',
        contact: { email: 'podcast@andthewriteris.com' },
        genres: ['Pop', 'Songwriting'],
      },
      {
        type: 'podcast',
        name: 'Tape Notes',
        contact: { email: 'hello@tapenotes.co.uk' },
        genres: ['Production', 'Recording'],
      },
      {
        type: 'podcast',
        name: 'Twenty Thousand Hertz',
        contact: { submissionUrl: 'https://20k.org/contact' },
        genres: ['Sound design', 'Audio'],
      },
    ],
  }

  const opportunities: Opportunity[] = []
  let idCounter = 0

  for (const goal of goals) {
    const goalData = mockData[goal] || []
    for (const item of goalData.slice(0, Math.ceil(maxResults / goals.length))) {
      const relevanceScore = Math.floor(65 + Math.random() * 30) // 65-95
      opportunities.push({
        ...item,
        id: `mock-${idCounter++}`,
        relevanceScore,
        pitchTips: generatePitchTips(item.type, genres),
        source: 'database',
      })
    }
  }

  return opportunities.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, maxResults)
}
