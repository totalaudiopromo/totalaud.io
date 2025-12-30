/**
 * Content Seeding Utilities
 *
 * Seeds the app with realistic test data for demos,
 * screenshots, and development testing.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import {
  PersonaId,
  allPersonaIds,
  getPersona,
  generateIdeasForPersona,
  generateTimelineForPersona,
  generatePitchContentForPersona,
} from './personas'

// =============================================================================
// TYPES
// =============================================================================

export interface SeedConfig {
  personaId: PersonaId
  modes: ('ideas' | 'timeline' | 'pitch')[]
  clearExisting?: boolean
}

export interface SeedResult {
  personaId: PersonaId
  ideasCreated: number
  timelineEventsCreated: number
  pitchDataCreated: boolean
  errors: string[]
}

// =============================================================================
// SUPABASE CLIENT
// =============================================================================

function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase credentials for seeding')
  }

  return createClient(url, key)
}

// =============================================================================
// SEEDING FUNCTIONS
// =============================================================================

/**
 * Seed ideas for a specific persona
 */
export async function seedIdeasForPersona(
  supabase: SupabaseClient,
  personaId: PersonaId,
  userId: string
): Promise<{ created: number; errors: string[] }> {
  const ideas = generateIdeasForPersona(personaId)
  const errors: string[] = []
  let created = 0

  for (let i = 0; i < ideas.length; i++) {
    const idea = ideas[i]

    // Generate canvas position (grid layout)
    const row = Math.floor(i / 3)
    const col = i % 3
    const position = {
      x: 50 + col * 320,
      y: 50 + row * 200,
    }

    const { error } = await supabase.from('ideas').insert({
      user_id: userId,
      content: idea.content,
      tag: idea.tag,
      position_x: position.x,
      position_y: position.y,
      created_at: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(), // Stagger creation times
    })

    if (error) {
      errors.push(`Failed to create idea: ${error.message}`)
    } else {
      created++
    }
  }

  return { created, errors }
}

/**
 * Seed timeline events for a specific persona
 */
export async function seedTimelineForPersona(
  supabase: SupabaseClient,
  personaId: PersonaId,
  userId: string
): Promise<{ created: number; errors: string[] }> {
  // Use a future release date for realistic planning
  const releaseDate = new Date()
  releaseDate.setMonth(releaseDate.getMonth() + 2)

  const events = generateTimelineForPersona(personaId, releaseDate)
  const errors: string[] = []
  let created = 0

  for (const event of events) {
    const { error } = await supabase.from('timeline_events').insert({
      user_id: userId,
      title: event.title,
      lane: event.lane,
      date: event.date,
      colour: event.colour,
      description: event.description,
      source: event.source,
      created_at: new Date().toISOString(),
    })

    if (error) {
      errors.push(`Failed to create timeline event: ${error.message}`)
    } else {
      created++
    }
  }

  return { created, errors }
}

/**
 * Seed pitch/identity data for a specific persona
 */
export async function seedPitchForPersona(
  supabase: SupabaseClient,
  personaId: PersonaId,
  userId: string
): Promise<{ created: boolean; errors: string[] }> {
  const pitchContent = generatePitchContentForPersona(personaId)
  const persona = getPersona(personaId)
  const errors: string[] = []

  const { error } = await supabase.from('artist_identity').upsert({
    user_id: userId,
    artist_name: persona.name,
    genres: persona.genre,
    bio: pitchContent.currentBio,
    desired_bio: pitchContent.desiredBio,
    monthly_listeners: persona.monthlyListeners,
    career_stage: persona.careerStage,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    errors.push(`Failed to create pitch data: ${error.message}`)
    return { created: false, errors }
  }

  return { created: true, errors }
}

// =============================================================================
// MAIN SEEDING FUNCTION
// =============================================================================

/**
 * Seed content for a persona
 */
export async function seedContentForPersona(config: SeedConfig): Promise<SeedResult> {
  const supabase = getSupabaseClient()
  const errors: string[] = []
  let ideasCreated = 0
  let timelineEventsCreated = 0
  let pitchDataCreated = false

  // Create a test user for this persona
  const persona = getPersona(config.personaId)
  const email = `${config.personaId}@totalaud.io`
  const password = `test-${config.personaId}-2025`

  // Check if user exists or create one
  let userId: string

  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    userId = existingUser.id

    // Clear existing data if requested
    if (config.clearExisting) {
      await supabase.from('ideas').delete().eq('user_id', userId)
      await supabase.from('timeline_events').delete().eq('user_id', userId)
    }
  } else {
    // Create new user
    const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: persona.name,
        persona_id: config.personaId,
      },
    })

    if (signUpError || !newUser.user) {
      errors.push(`Failed to create user: ${signUpError?.message || 'Unknown error'}`)
      return {
        personaId: config.personaId,
        ideasCreated: 0,
        timelineEventsCreated: 0,
        pitchDataCreated: false,
        errors,
      }
    }

    userId = newUser.user.id
  }

  // Seed each requested mode
  if (config.modes.includes('ideas')) {
    const result = await seedIdeasForPersona(supabase, config.personaId, userId)
    ideasCreated = result.created
    errors.push(...result.errors)
  }

  if (config.modes.includes('timeline')) {
    const result = await seedTimelineForPersona(supabase, config.personaId, userId)
    timelineEventsCreated = result.created
    errors.push(...result.errors)
  }

  if (config.modes.includes('pitch')) {
    const result = await seedPitchForPersona(supabase, config.personaId, userId)
    pitchDataCreated = result.created
    errors.push(...result.errors)
  }

  return {
    personaId: config.personaId,
    ideasCreated,
    timelineEventsCreated,
    pitchDataCreated,
    errors,
  }
}

/**
 * Seed content for all personas
 */
export async function seedAllPersonas(
  modes: ('ideas' | 'timeline' | 'pitch')[] = ['ideas', 'timeline', 'pitch'],
  clearExisting: boolean = false
): Promise<SeedResult[]> {
  const results: SeedResult[] = []

  for (const personaId of allPersonaIds) {
    const result = await seedContentForPersona({
      personaId,
      modes,
      clearExisting,
    })
    results.push(result)
  }

  return results
}

// =============================================================================
// LOCAL STORAGE SEEDING (for development without Supabase)
// =============================================================================

/**
 * Generate localStorage-compatible seed data
 * Use this for local development without Supabase
 */
export function generateLocalStorageSeedData(personaId: PersonaId): {
  ideas: object[]
  timeline: object[]
  identity: object
} {
  const ideas = generateIdeasForPersona(personaId).map((idea, i) => ({
    id: `seed-idea-${personaId}-${i}`,
    content: idea.content,
    tag: idea.tag,
    position: {
      x: 50 + (i % 3) * 320,
      y: 50 + Math.floor(i / 3) * 200,
    },
    createdAt: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
  }))

  const releaseDate = new Date()
  releaseDate.setMonth(releaseDate.getMonth() + 2)

  const timeline = generateTimelineForPersona(personaId, releaseDate).map((event, i) => ({
    id: `seed-event-${personaId}-${i}`,
    ...event,
    createdAt: new Date().toISOString(),
  }))

  const pitchContent = generatePitchContentForPersona(personaId)
  const persona = getPersona(personaId)

  const identity = {
    artistName: persona.name,
    genres: persona.genre,
    bio: pitchContent.currentBio,
    monthlyListeners: persona.monthlyListeners,
    careerStage: persona.careerStage,
  }

  return { ideas, timeline, identity }
}

/**
 * Inject seed data into browser localStorage
 * Call this from browser console or Playwright
 */
export function getLocalStorageInjectionScript(personaId: PersonaId): string {
  const data = generateLocalStorageSeedData(personaId)

  return `
    // Seed data for persona: ${personaId}
    const seedData = ${JSON.stringify(data, null, 2)};

    // Ideas store
    const ideasState = {
      cards: seedData.ideas,
      filter: null,
      searchQuery: '',
      sortMode: 'newest',
      viewMode: 'canvas',
    };
    localStorage.setItem('ideas-store', JSON.stringify({ state: ideasState, version: 0 }));

    // Timeline store
    const timelineState = {
      events: seedData.timeline,
      selectedEventId: null,
      viewScale: 'weeks',
    };
    localStorage.setItem('timeline-store', JSON.stringify({ state: timelineState, version: 0 }));

    // Identity store
    const identityState = seedData.identity;
    localStorage.setItem('identity-store', JSON.stringify({ state: identityState, version: 0 }));

    console.log('✅ Seeded localStorage for persona: ${personaId}');
    console.log('  - Ideas:', seedData.ideas.length);
    console.log('  - Timeline events:', seedData.timeline.length);
    console.log('  - Identity: ✓');
  `
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

/**
 * Run from command line:
 * npx ts-node tests/personas/seed-content.ts maya
 * npx ts-node tests/personas/seed-content.ts --all
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log(`
Usage:
  npx ts-node tests/personas/seed-content.ts <persona>
  npx ts-node tests/personas/seed-content.ts --all
  npx ts-node tests/personas/seed-content.ts --local <persona>

Personas: ${allPersonaIds.join(', ')}

Options:
  --all          Seed all personas
  --local        Output localStorage injection script (no Supabase needed)
  --clear        Clear existing data before seeding
`)
    process.exit(0)
  }

  const isLocal = args.includes('--local')
  const isAll = args.includes('--all')
  const clearExisting = args.includes('--clear')
  const personaArg = args.find((a) => !a.startsWith('--'))

  if (isLocal && personaArg) {
    const personaId = personaArg as PersonaId
    if (!allPersonaIds.includes(personaId)) {
      console.error(`Unknown persona: ${personaArg}`)
      process.exit(1)
    }

    const script = getLocalStorageInjectionScript(personaId)
    console.log(script)
    process.exit(0)
  }

  if (isAll) {
    console.log('Seeding all personas...')
    const results = await seedAllPersonas(['ideas', 'timeline', 'pitch'], clearExisting)

    for (const result of results) {
      const persona = getPersona(result.personaId)
      console.log(`\n${persona.displayName}:`)
      console.log(`  Ideas: ${result.ideasCreated}`)
      console.log(`  Timeline: ${result.timelineEventsCreated}`)
      console.log(`  Pitch: ${result.pitchDataCreated ? '✓' : '✗'}`)
      if (result.errors.length > 0) {
        console.log(`  Errors: ${result.errors.join(', ')}`)
      }
    }
  } else if (personaArg) {
    const personaId = personaArg as PersonaId
    if (!allPersonaIds.includes(personaId)) {
      console.error(`Unknown persona: ${personaArg}`)
      process.exit(1)
    }

    console.log(`Seeding persona: ${personaId}...`)
    const result = await seedContentForPersona({
      personaId,
      modes: ['ideas', 'timeline', 'pitch'],
      clearExisting,
    })

    const persona = getPersona(result.personaId)
    console.log(`\n${persona.displayName}:`)
    console.log(`  Ideas: ${result.ideasCreated}`)
    console.log(`  Timeline: ${result.timelineEventsCreated}`)
    console.log(`  Pitch: ${result.pitchDataCreated ? '✓' : '✗'}`)
    if (result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.join(', ')}`)
    }
  }
}

// Only run if executed directly
if (require.main === module) {
  main().catch(console.error)
}
