/**
 * ICP Persona Definitions for Testing
 *
 * These personas represent realistic totalaud.io users at different
 * stages of their music career. Each includes:
 * - Demographics and context
 * - Realistic test data they would create
 * - Expected behaviours and pain points
 * - Success metrics for their journey
 */

import type { NewTimelineEvent, LaneType } from '../../src/types/timeline'

// =============================================================================
// PERSONA TYPES
// =============================================================================

export type PersonaId = 'maya' | 'marcus' | 'sarah-james' | 'dev' | 'chloe'

export type CareerStage = 'emerging' | 'growing' | 'established' | 'professional'
export type TechComfort = 'low' | 'medium' | 'high'
export type PricingTier = 'starter' | 'pro'

export interface Persona {
  id: PersonaId
  name: string
  displayName: string // For reports
  age: number
  location: string
  genre: string[]
  monthlyListeners: number
  careerStage: CareerStage
  techComfort: TechComfort
  expectedTier: PricingTier
  budget: { min: number; max: number } // GBP per month
  dayJob: string | null
  bio: string
  painPoints: string[]
  goals: string[]

  // Testing behaviour
  devicePreference: 'mobile' | 'desktop' | 'both'
  sessionLength: 'quick' | 'medium' | 'long' // <5min, 5-15min, >15min
  returnFrequency: 'daily' | 'weekly' | 'occasional'
}

// =============================================================================
// PERSONA DEFINITIONS
// =============================================================================

export const personas: Record<PersonaId, Persona> = {
  maya: {
    id: 'maya',
    name: 'Maya Chen',
    displayName: 'Maya (Lo-fi Producer)',
    age: 24,
    location: 'Bristol, UK',
    genre: ['lo-fi', 'ambient', 'electronic'],
    monthlyListeners: 2400,
    careerStage: 'growing',
    techComfort: 'medium',
    expectedTier: 'starter',
    budget: { min: 50, max: 100 },
    dayJob: 'Part-time barista, freelance graphic design',
    bio: 'Bedroom producer making hazy beats and ambient textures',
    painPoints: [
      'Notes app full of scattered ideas',
      'Tried Groover, got generic feedback',
      'Doesnt know which playlists accept submissions',
      'Writes terrible artist bios',
      'Releases with no plan',
    ],
    goals: [
      'Get organised',
      'Find relevant playlists',
      'Create a release plan',
      'Write a bio she likes',
    ],
    devicePreference: 'mobile',
    sessionLength: 'quick',
    returnFrequency: 'daily',
  },

  marcus: {
    id: 'marcus',
    name: 'Marcus Thompson',
    displayName: 'Marcus (UK Hip-Hop)',
    age: 28,
    location: 'Birmingham, UK',
    genre: ['uk-hip-hop', 'grime', 'rap'],
    monthlyListeners: 18000,
    careerStage: 'established',
    techComfort: 'medium',
    expectedTier: 'pro',
    budget: { min: 200, max: 400 },
    dayJob: null, // Full-time music
    bio: 'Birmingham voice with Radio 1Xtra plays and growing momentum',
    painPoints: [
      'Managing promo across WhatsApp, Voice memos, Instagram saves',
      'Cant tell real promoters from scams',
      'Cant afford £3k/month radio pluggers',
      'Team is just him and his mate',
      'Release strategy is drop and pray',
    ],
    goals: [
      'Consolidate scattered notes',
      'Find legit radio contacts',
      'Create album rollout plan',
      'Level up his bio',
    ],
    devicePreference: 'both',
    sessionLength: 'medium',
    returnFrequency: 'weekly',
  },

  'sarah-james': {
    id: 'sarah-james',
    name: 'Sarah & James',
    displayName: 'Sarah & James (Folk Duo)',
    age: 31,
    location: 'Edinburgh, UK',
    genre: ['indie-folk', 'acoustic', 'folk'],
    monthlyListeners: 8500,
    careerStage: 'growing',
    techComfort: 'low',
    expectedTier: 'starter',
    budget: { min: 50, max: 100 },
    dayJob: 'Teacher + Nurse (shift work)',
    bio: 'Edinburgh folk duo weaving close harmonies since 2018',
    painPoints: [
      'Coordinating between two peoples calendars',
      'Neither knows digital marketing',
      'Submitted to BBC Radio 2 and never heard back',
      'Their music suits sync but dont know how to approach it',
      'Last release plan was a shared Google Doc nobody updated',
    ],
    goals: [
      'Both add ideas independently',
      'Find sync opportunities',
      'Create shared release timeline',
      'Update their 3-year-old bio',
    ],
    devicePreference: 'desktop',
    sessionLength: 'long',
    returnFrequency: 'weekly',
  },

  dev: {
    id: 'dev',
    name: 'Dev Patel',
    displayName: 'Dev (House Producer)',
    age: 26,
    location: 'Manchester, UK',
    genre: ['house', 'tech-house', 'electronic'],
    monthlyListeners: 45000,
    careerStage: 'professional',
    techComfort: 'high',
    expectedTier: 'pro',
    budget: { min: 300, max: 500 },
    dayJob: null, // Just quit to go full-time
    bio: 'Tech house producer who traded coding for the studio',
    painPoints: [
      'Tracks on 8 different labels but no unified presence',
      'Lost in release and move on cycle',
      'No artist story beyond I make house music',
      'Doesnt understand Beatport editorial',
      'Compares himself to peers with PR teams',
    ],
    goals: [
      'Organise business ideas',
      'Understand dance music press landscape',
      'Create quarterly promo plans',
      'Develop authentic artist narrative',
    ],
    devicePreference: 'desktop',
    sessionLength: 'long',
    returnFrequency: 'daily',
  },

  chloe: {
    id: 'chloe',
    name: 'Chloe Williams',
    displayName: 'Chloe (Student Singer-Songwriter)',
    age: 19,
    location: 'Cardiff, UK',
    genre: ['singer-songwriter', 'pop', 'acoustic'],
    monthlyListeners: 400,
    careerStage: 'emerging',
    techComfort: 'medium',
    expectedTier: 'starter',
    budget: { min: 20, max: 30 },
    dayJob: 'First year music student',
    bio: 'Cardiff bedroom songwriter finding her voice',
    painPoints: [
      'Doesnt know what she doesnt know',
      'Every YouTube video says something different',
      'Spent £15 on a playlist placement scam',
      'Ideas everywhere - Notes, Notion, scraps of paper',
      'No idea how to write a bio',
    ],
    goals: [
      'Feel less overwhelmed',
      'Discover appropriate opportunities',
      'Create first release plan ever',
      'Get a bio shes proud of',
    ],
    devicePreference: 'mobile',
    sessionLength: 'quick',
    returnFrequency: 'occasional',
  },
}

// =============================================================================
// TEST DATA FACTORIES
// =============================================================================

type IdeaTag = 'content' | 'brand' | 'music' | 'promo'

interface IdeaInput {
  content: string
  tag: IdeaTag
}

/**
 * Generates realistic idea cards for each persona
 */
export function generateIdeasForPersona(personaId: PersonaId): IdeaInput[] {
  const ideasByPersona: Record<PersonaId, IdeaInput[]> = {
    maya: [
      { content: 'EP concept: sounds of my commute (field recordings + beats)', tag: 'music' },
      { content: 'Collab idea: reach out to that vocalist from Manchester', tag: 'music' },
      { content: 'Promo tactic: behind-the-scenes reels of production process', tag: 'promo' },
      { content: 'Visual aesthetic: 35mm film grain, muted colours', tag: 'brand' },
      { content: 'Title idea: "platform 3" for the train station track', tag: 'music' },
      { content: 'Sample source: old Japanese city pop vinyl', tag: 'music' },
      { content: 'Artwork: commission that illustrator from Instagram', tag: 'brand' },
      { content: 'Release timing: Sunday evening drops seem to work better', tag: 'promo' },
    ],
    marcus: [
      {
        content: 'Link up with that producer - his beats on the Headie track were cold',
        tag: 'music',
      },
      { content: 'Music video concept: one-take through the Bullring', tag: 'content' },
      { content: 'Freestyle series idea: 60 seconds every Sunday', tag: 'content' },
      { content: 'Merch drop with release - limited hoodies', tag: 'brand' },
      { content: 'Get on SBTV / GRM Daily - research who to contact', tag: 'promo' },
      { content: 'Feature wishlist: Knucks, Ghetts, Little Simz', tag: 'music' },
      { content: 'Album title ideas: "Second City" or "B-Town Stories"', tag: 'music' },
      { content: 'Sample clearance needed for that soul flip', tag: 'music' },
      { content: 'Studio session with Mike Skinner if budget allows', tag: 'music' },
      { content: 'Documentary style content for album rollout', tag: 'content' },
    ],
    'sarah-james': [
      { content: 'Song idea: harmonies based on that hymn from James nan funeral', tag: 'music' },
      { content: 'EP theme: songs about Scottish landscapes', tag: 'music' },
      { content: 'Gig opportunity: that new folk club in Leith', tag: 'promo' },
      { content: 'Sync angle: our music would suit period dramas', tag: 'promo' },
      { content: 'Collab idea: reach out to that fiddle player from the festival', tag: 'music' },
      { content: 'Cover idea: folk version of a modern song for TikTok', tag: 'content' },
      { content: 'Recording location: that church with amazing acoustics', tag: 'music' },
      { content: 'Photo shoot at Arthurs Seat for new press shots', tag: 'brand' },
    ],
    dev: [
      { content: 'Sample pack idea: South Asian percussion for house producers', tag: 'music' },
      { content: 'Mix series: monthly 1-hour mixes for SoundCloud', tag: 'content' },
      { content: 'Collab target list: 10 producers I respect', tag: 'music' },
      { content: 'Studio livestream setup - Twitch?', tag: 'content' },
      { content: 'Remix contest to build email list', tag: 'promo' },
      { content: 'Heritage angle: incorporate more tabla/Indian elements', tag: 'brand' },
      { content: 'DJ set at Warehouse Project - need promo plan', tag: 'promo' },
      { content: 'Label shopping: Defected, Toolroom, or stay independent?', tag: 'promo' },
      { content: 'Press photos at Printworks - that industrial look', tag: 'brand' },
      { content: 'Podcast appearances - which dance music ones matter?', tag: 'promo' },
      { content: 'Sample pack income stream while touring', tag: 'music' },
      { content: 'Ibiza residency - is it too early?', tag: 'promo' },
    ],
    chloe: [
      { content: 'Song idea: about that argument with my flatmate', tag: 'music' },
      { content: 'Cover idea: slowed down version of Olivia Rodrigo song', tag: 'content' },
      { content: 'Aesthetic: cottagecore but make it Welsh', tag: 'brand' },
      { content: 'Learn: how to use a compressor properly', tag: 'music' },
      { content: 'Uni module project: music video for my single', tag: 'content' },
      { content: 'Ask: that second-year who got playlist placement how they did it', tag: 'promo' },
      { content: 'Song title: "Missed Call" or "Read at 2am"', tag: 'music' },
      { content: 'Bedroom recording tips from YouTube', tag: 'music' },
    ],
  }

  return ideasByPersona[personaId] || []
}

/**
 * Generates realistic scout filter preferences for each persona
 */
export function getScoutFiltersForPersona(personaId: PersonaId): {
  genres: string[]
  types: string[]
  audienceSize: string[]
} {
  const filtersByPersona: Record<
    PersonaId,
    { genres: string[]; types: string[]; audienceSize: string[] }
  > = {
    maya: {
      genres: ['electronic', 'ambient', 'lo-fi'],
      types: ['playlist', 'blog'],
      audienceSize: ['small', 'medium'], // Realistic for her level
    },
    marcus: {
      genres: ['hip-hop', 'grime', 'uk-rap'],
      types: ['radio', 'playlist', 'blog', 'press'],
      audienceSize: ['medium', 'large'], // Past small playlists now
    },
    'sarah-james': {
      genres: ['folk', 'acoustic', 'indie'],
      types: ['radio', 'playlist', 'blog'],
      audienceSize: ['small', 'medium', 'large'], // Any works for niche
    },
    dev: {
      genres: ['house', 'tech-house', 'electronic'],
      types: ['radio', 'playlist', 'blog', 'press'],
      audienceSize: ['medium', 'large'], // Professional level
    },
    chloe: {
      genres: ['pop', 'singer-songwriter', 'acoustic'],
      types: ['playlist', 'blog'],
      audienceSize: ['small'], // Just starting out
    },
  }

  return filtersByPersona[personaId] || { genres: [], types: [], audienceSize: [] }
}

/**
 * Generates realistic timeline events for each persona
 */
export function generateTimelineForPersona(
  personaId: PersonaId,
  releaseDate: Date = new Date()
): NewTimelineEvent[] {
  const baseDate = new Date(releaseDate)

  function weeksFromRelease(weeks: number): string {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + weeks * 7)
    return date.toISOString()
  }

  const timelinesByPersona: Record<PersonaId, NewTimelineEvent[]> = {
    maya: [
      {
        lane: 'pre-release' as LaneType,
        title: 'Finish master',
        date: weeksFromRelease(-4),
        colour: '#3AA9BE',
        description: 'Final mix tweaks and master',
        source: 'manual',
      },
      {
        lane: 'pre-release' as LaneType,
        title: 'Submit to DistroKid',
        date: weeksFromRelease(-3),
        colour: '#3AA9BE',
        source: 'manual',
      },
      {
        lane: 'content' as LaneType,
        title: 'Teaser clip for Instagram',
        date: weeksFromRelease(-2),
        colour: '#8B5CF6',
        description: '15 second preview with visuals',
        source: 'manual',
      },
      {
        lane: 'promo' as LaneType,
        title: 'Submit to 5 playlists',
        date: weeksFromRelease(-2),
        colour: '#10B981',
        description: 'Lo-fi playlists from Scout',
        source: 'manual',
      },
      {
        lane: 'promo' as LaneType,
        title: 'Share pre-save link',
        date: weeksFromRelease(-1),
        colour: '#10B981',
        source: 'manual',
      },
      {
        lane: 'release' as LaneType,
        title: 'Release Day!',
        date: weeksFromRelease(0),
        colour: '#F59E0B',
        description: 'Stories, posts, everything',
        source: 'manual',
      },
      {
        lane: 'promo' as LaneType,
        title: 'Follow up with curators',
        date: weeksFromRelease(1),
        colour: '#10B981',
        source: 'manual',
      },
      {
        lane: 'content' as LaneType,
        title: 'Behind-the-scenes video',
        date: weeksFromRelease(2),
        colour: '#8B5CF6',
        source: 'manual',
      },
    ],
    marcus: [
      {
        lane: 'pre-release' as LaneType,
        title: 'Single 1 + video',
        date: weeksFromRelease(-12),
        colour: '#3AA9BE',
        description: 'First single from album',
        source: 'manual',
      },
      {
        lane: 'promo' as LaneType,
        title: 'Radio push begins',
        date: weeksFromRelease(-10),
        colour: '#10B981',
        description: '1Xtra, Capital Xtra targets',
        source: 'manual',
      },
      {
        lane: 'pre-release' as LaneType,
        title: 'Single 2 drop',
        date: weeksFromRelease(-8),
        colour: '#3AA9BE',
        source: 'manual',
      },
      {
        lane: 'pre-release' as LaneType,
        title: 'Album pre-order live',
        date: weeksFromRelease(-4),
        colour: '#3AA9BE',
        source: 'manual',
      },
      {
        lane: 'pre-release' as LaneType,
        title: 'Single 3 + visualiser',
        date: weeksFromRelease(-2),
        colour: '#3AA9BE',
        source: 'manual',
      },
      {
        lane: 'release' as LaneType,
        title: 'ALBUM DROP',
        date: weeksFromRelease(0),
        colour: '#F59E0B',
        description: 'The main event',
        source: 'manual',
      },
      {
        lane: 'promo' as LaneType,
        title: 'Launch party',
        date: weeksFromRelease(0),
        colour: '#10B981',
        description: 'Birmingham venue TBC',
        source: 'manual',
      },
      {
        lane: 'promo' as LaneType,
        title: 'Press run + interviews',
        date: weeksFromRelease(2),
        colour: '#10B981',
        source: 'manual',
      },
      {
        lane: 'content' as LaneType,
        title: 'Deluxe / remix pack',
        date: weeksFromRelease(6),
        colour: '#8B5CF6',
        description: 'Second wave content',
        source: 'manual',
      },
    ],
    'sarah-james': [
      {
        lane: 'pre-release' as LaneType,
        title: 'Finish recording',
        date: weeksFromRelease(-24),
        colour: '#3AA9BE',
        description: 'Weekend sessions',
        source: 'manual',
      },
      {
        lane: 'pre-release' as LaneType,
        title: 'Mixing / mastering',
        date: weeksFromRelease(-20),
        colour: '#3AA9BE',
        source: 'manual',
      },
      {
        lane: 'content' as LaneType,
        title: 'Photos + artwork',
        date: weeksFromRelease(-16),
        colour: '#8B5CF6',
        description: 'Arthurs Seat shoot',
        source: 'manual',
      },
      {
        lane: 'promo' as LaneType,
        title: 'Submit to folk radio',
        date: weeksFromRelease(-12),
        colour: '#10B981',
        description: 'Long lead times for folk shows',
        source: 'manual',
      },
      {
        lane: 'promo' as LaneType,
        title: 'Sync agency submissions',
        date: weeksFromRelease(-8),
        colour: '#10B981',
        source: 'manual',
      },
      {
        lane: 'promo' as LaneType,
        title: 'Press outreach',
        date: weeksFromRelease(-4),
        colour: '#10B981',
        source: 'manual',
      },
      {
        lane: 'release' as LaneType,
        title: 'EP Release',
        date: weeksFromRelease(0),
        colour: '#F59E0B',
        source: 'manual',
      },
      {
        lane: 'promo' as LaneType,
        title: 'Local gig tour',
        date: weeksFromRelease(4),
        colour: '#10B981',
        description: 'Edinburgh + Glasgow venues',
        source: 'manual',
      },
    ],
    dev: [
      {
        lane: 'pre-release' as LaneType,
        title: 'Finish EP',
        date: weeksFromRelease(-8),
        colour: '#3AA9BE',
        source: 'manual',
      },
      {
        lane: 'pre-release' as LaneType,
        title: 'Sign to label',
        date: weeksFromRelease(-6),
        colour: '#3AA9BE',
        description: 'Defected or Toolroom?',
        source: 'manual',
      },
      {
        lane: 'promo' as LaneType,
        title: 'Mixmag premiere',
        date: weeksFromRelease(-2),
        colour: '#10B981',
        description: 'Lead single exclusive',
        source: 'manual',
      },
      {
        lane: 'promo' as LaneType,
        title: 'Radio servicing',
        date: weeksFromRelease(-2),
        colour: '#10B981',
        description: 'Radio 1 Dance targets',
        source: 'manual',
      },
      {
        lane: 'release' as LaneType,
        title: 'EP Release',
        date: weeksFromRelease(0),
        colour: '#F59E0B',
        source: 'manual',
      },
      {
        lane: 'promo' as LaneType,
        title: 'Club tour dates',
        date: weeksFromRelease(2),
        colour: '#10B981',
        description: 'Manchester, London, Bristol',
        source: 'manual',
      },
      {
        lane: 'promo' as LaneType,
        title: 'DJ Mag review',
        date: weeksFromRelease(4),
        colour: '#10B981',
        source: 'manual',
      },
      {
        lane: 'promo' as LaneType,
        title: 'Festival submissions',
        date: weeksFromRelease(6),
        colour: '#10B981',
        description: 'Parklife, Warehouse Project',
        source: 'manual',
      },
    ],
    chloe: [
      {
        lane: 'pre-release' as LaneType,
        title: 'Finish song',
        date: weeksFromRelease(-3),
        colour: '#3AA9BE',
        description: 'Get feedback from tutor',
        source: 'manual',
      },
      {
        lane: 'pre-release' as LaneType,
        title: 'Record final version',
        date: weeksFromRelease(-2),
        colour: '#3AA9BE',
        source: 'manual',
      },
      {
        lane: 'pre-release' as LaneType,
        title: 'Upload to DistroKid',
        date: weeksFromRelease(-1),
        colour: '#3AA9BE',
        description: 'Create artwork too',
        source: 'manual',
      },
      {
        lane: 'release' as LaneType,
        title: 'Release day!',
        date: weeksFromRelease(0),
        colour: '#F59E0B',
        description: 'Post everywhere',
        source: 'manual',
      },
      {
        lane: 'content' as LaneType,
        title: 'Behind the scenes',
        date: weeksFromRelease(1),
        colour: '#8B5CF6',
        description: 'Thank everyone who listened',
        source: 'manual',
      },
    ],
  }

  return timelinesByPersona[personaId] || []
}

/**
 * Generates realistic pitch/bio content for each persona
 */
export function generatePitchContentForPersona(personaId: PersonaId): {
  currentBio: string
  desiredBio: string
  pitchRequests: string[]
} {
  const pitchByPersona: Record<
    PersonaId,
    { currentBio: string; desiredBio: string; pitchRequests: string[] }
  > = {
    maya: {
      currentBio: 'I make music that sounds like feelings',
      desiredBio: `Maya Chen crafts intimate electronic soundscapes from her Bristol bedroom — blending field recordings, hazy synths, and beats that feel like 3am train journeys. Her music sits somewhere between Tycho and Burial, made for headphones and late nights.`,
      pitchRequests: [
        'Write a bio that doesnt sound cringe',
        'Describe my sound for a playlist pitch',
        'Help me write a submission email',
      ],
    },
    marcus: {
      currentBio: 'Hungry artist on the come up from Birmingham',
      desiredBio: `Marcus Thompson is the Birmingham voice that won't be ignored. From council estates to Radio 1Xtra airplay, his bars cut through with raw honesty and production that bridges grime's aggression with soulful UK hip-hop. Two mixtapes deep with momentum building, he's creating something that matters.`,
      pitchRequests: [
        'Rewrite my bio - Ive levelled up since the old one',
        'Write a press release template for my album',
        'Help me describe my sound without saying authentic UK hip-hop',
      ],
    },
    'sarah-james': {
      currentBio: 'Edinburgh-based folk duo making acoustic music',
      desiredBio: `Sarah & James have been weaving close harmonies and gentle guitar since 2018 — their sound echoes the Scottish landscape they call home. With an album praised by Folk Radio UK and live performances that sell out Edinburgh's intimate venues, they craft songs for Sunday mornings and long drives north.`,
      pitchRequests: [
        'Update our bio - were not emerging anymore',
        'Write a folk radio submission that mentions our Scottish connection',
        'Help us pitch to sync agencies',
      ],
    },
    dev: {
      currentBio: 'House and tech house producer from Manchester',
      desiredBio: `Dev Patel brings Manchester's warehouse energy and South Asian rhythmic DNA to the dancefloor. A coder-turned-producer who traded startup life for studio sessions, his tech house cuts have found homes on respected labels and sound systems from Printworks to Ibiza. Now full-time in the game, he's building something that merges heritage with four-to-the-floor.`,
      pitchRequests: [
        'Write a bio that mentions my South Asian background authentically',
        'Help me pitch to Mixmag for a premiere',
        'Write a festival submission that stands out',
      ],
    },
    chloe: {
      currentBio: '',
      desiredBio: `Chloe Williams writes songs in her Cardiff bedroom about the small stuff that feels massive at 19 — flatmate drama, missed calls, and learning who you're becoming. Her acoustic pop sits somewhere between Phoebe Bridgers and Holly Humberstone, honest and unhurried.`,
      pitchRequests: [
        'Help me write my first ever bio',
        'How do I describe my sound when I dont know what it is yet?',
        'Write something for my Instagram bio',
      ],
    },
  }

  return pitchByPersona[personaId] || { currentBio: '', desiredBio: '', pitchRequests: [] }
}

/**
 * Get viewport settings for persona's device preference
 */
export function getViewportForPersona(personaId: PersonaId): { width: number; height: number } {
  const persona = personas[personaId]

  if (persona.devicePreference === 'mobile') {
    return { width: 375, height: 667 } // iPhone SE
  }

  return { width: 1280, height: 800 } // Desktop
}

/**
 * Get expected session behaviour for persona
 */
export function getSessionBehaviourForPersona(personaId: PersonaId): {
  maxDurationMs: number
  expectedActions: number
  patienceLevel: 'low' | 'medium' | 'high'
} {
  const persona = personas[personaId]

  const durationMap = {
    quick: 5 * 60 * 1000, // 5 minutes
    medium: 15 * 60 * 1000, // 15 minutes
    long: 30 * 60 * 1000, // 30 minutes
  }

  const actionsMap = {
    quick: 5,
    medium: 15,
    long: 30,
  }

  const patienceMap: Record<TechComfort, 'low' | 'medium' | 'high'> = {
    low: 'low',
    medium: 'medium',
    high: 'high',
  }

  return {
    maxDurationMs: durationMap[persona.sessionLength],
    expectedActions: actionsMap[persona.sessionLength],
    patienceLevel: patienceMap[persona.techComfort],
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const allPersonaIds = Object.keys(personas) as PersonaId[]

export function getPersona(id: PersonaId): Persona {
  return personas[id]
}

export function getPersonasByTier(tier: PricingTier): Persona[] {
  return Object.values(personas).filter((p) => p.expectedTier === tier)
}

export function getPersonasByCareerStage(stage: CareerStage): Persona[] {
  return Object.values(personas).filter((p) => p.careerStage === stage)
}
