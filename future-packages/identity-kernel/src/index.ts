/**
 * Identity Kernel
 * Unified artist identity profile system
 */

import type { FusionContext } from '@total-audio/fusion-layer'

export interface IdentityInput {
  artistSlug: string
  context: FusionContext
}

export interface IdentityProfile {
  brandVoice: BrandVoice
  creativeProfile: CreativeProfile
  narrativeProfile: NarrativeProfile
  sceneIdentity: SceneIdentity
  microgenreMap: MicrogenreMap
  epkFragments: EPKFragments
  bioShort: string
  bioLong: string
}

export interface BrandVoice {
  tone: string
  themes: string[]
  style: string
  keyPhrases: string[]
}

export interface CreativeProfile {
  primaryMotifs: string[]
  emotionalRange: string
  structuralSignature: string
  uniqueElements: string[]
}

export interface NarrativeProfile {
  storyArcs: string[]
  keyThemes: string[]
  narrativeStyle: string
  evolution: string
}

export interface SceneIdentity {
  primaryScene: string
  secondaryScenes: string[]
  geographicRoots: string
  sceneInfluence: number
}

export interface MicrogenreMap {
  primary: string
  secondary: string[]
  influences: string[]
  positioning: string
}

export interface EPKFragments {
  oneLiner: string
  pressAngle: string
  pitchHook: string
  comparisons: string[]
}

export async function buildIdentityProfile(input: IdentityInput): Promise<IdentityProfile> {
  const { context } = input

  // Analyze brand voice from campaigns and pitches
  const brandVoice = analyzeBrandVoice(context)

  // Extract creative fingerprints from assets and community posts
  const creativeProfile = analyzeCreativeProfile(context)

  // Build narrative arc from campaign history
  const narrativeProfile = analyzeNarrativeProfile(context)

  // Cluster scene identity from tags and affiliations
  const sceneIdentity = analyzeSceneIdentity(context)

  // Map microgenres from intel and tags
  const microgenreMap = analyzeMicrogenres(context)

  // Generate EPK fragments
  const epkFragments = generateEPKFragments(
    brandVoice,
    creativeProfile,
    sceneIdentity,
    microgenreMap
  )

  // Generate bios
  const bioShort = generateShortBio(epkFragments, sceneIdentity)
  const bioLong = generateLongBio(
    brandVoice,
    creativeProfile,
    narrativeProfile,
    sceneIdentity,
    epkFragments
  )

  return {
    brandVoice,
    creativeProfile,
    narrativeProfile,
    sceneIdentity,
    microgenreMap,
    epkFragments,
    bioShort,
    bioLong,
  }
}

function analyzeBrandVoice(context: FusionContext): BrandVoice {
  // Analyze tone from email campaigns
  const emailTones = context.email.campaigns
    .filter((c) => c.subject_line)
    .map((c) => {
      const subject = c.subject_line!.toLowerCase()
      if (subject.includes('new') || subject.includes('out now')) return 'direct'
      if (subject.includes('?')) return 'conversational'
      if (subject.includes('!')) return 'energetic'
      return 'professional'
    })

  const dominantTone = emailTones[0] || 'authentic'

  // Extract themes from community posts
  const themes = context.community.posts
    .filter((p) => p.tags && p.tags.length > 0)
    .flatMap((p) => p.tags || [])
    .slice(0, 5)

  return {
    tone: `${dominantTone}, genuine`,
    themes: themes.length > 0 ? themes : ['independent music', 'artistic integrity'],
    style: 'Independent artist with focused creative vision',
    keyPhrases: ['authentic', 'independent', 'creative'],
  }
}

function analyzeCreativeProfile(context: FusionContext): CreativeProfile {
  // Extract motifs from asset tags
  const motifs = context.assets.drops
    .filter((d) => d.tags && d.tags.length > 0)
    .flatMap((d) => d.tags || [])
    .slice(0, 5)

  return {
    primaryMotifs: motifs.length > 0 ? motifs : ['atmospheric', 'introspective'],
    emotionalRange: 'Introspective to uplifting',
    structuralSignature: 'Evolving arrangements with dynamic builds',
    uniqueElements: ['Distinctive production', 'Lyrical depth'],
  }
}

function analyzeNarrativeProfile(context: FusionContext): NarrativeProfile {
  // Analyze campaign narrative from tracker
  const campaignThemes = context.tracker.campaigns
    .filter((c) => c.description)
    .map((c) => {
      const desc = c.description!.toLowerCase()
      if (desc.includes('debut') || desc.includes('first')) return 'emergence'
      if (desc.includes('follow up') || desc.includes('next')) return 'evolution'
      if (desc.includes('break')) return 'breakthrough'
      return 'growth'
    })

  return {
    storyArcs: campaignThemes.length > 0 ? campaignThemes : ['independent journey'],
    keyThemes: ['artistic development', 'scene building', 'audience connection'],
    narrativeStyle: 'Progressive and authentic',
    evolution: 'Steady growth with strategic milestone building',
  }
}

function analyzeSceneIdentity(context: FusionContext): SceneIdentity {
  // Analyze scene from community posts and tags
  const sceneTags = context.community.posts
    .filter((p) => p.tags && p.tags.length > 0)
    .flatMap((p) => p.tags || [])
    .filter((tag) => tag.includes('scene') || tag.includes('community'))

  const primaryScene = sceneTags[0] || 'independent music'

  return {
    primaryScene,
    secondaryScenes: sceneTags.slice(1, 3),
    geographicRoots: 'UK independent scene',
    sceneInfluence: 0.7,
  }
}

function analyzeMicrogenres(context: FusionContext): MicrogenreMap {
  // Extract genres from intel contacts
  const genres = context.intel.contacts
    .filter((c) => c.genres && c.genres.length > 0)
    .flatMap((c) => c.genres || [])
    .reduce(
      (acc, genre) => {
        acc[genre] = (acc[genre] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

  const sortedGenres = Object.entries(genres)
    .sort(([, a], [, b]) => b - a)
    .map(([genre]) => genre)

  return {
    primary: sortedGenres[0] || 'indie',
    secondary: sortedGenres.slice(1, 4),
    influences: ['alternative', 'electronic', 'experimental'],
    positioning: 'Independent artist with cross-genre appeal',
  }
}

function generateEPKFragments(
  brandVoice: BrandVoice,
  creativeProfile: CreativeProfile,
  sceneIdentity: SceneIdentity,
  microgenres: MicrogenreMap
): EPKFragments {
  const oneLiner = `${microgenres.primary} artist exploring ${creativeProfile.primaryMotifs[0] || 'unique sonic landscapes'}`

  const pressAngle = `${brandVoice.tone} ${microgenres.primary} with ${creativeProfile.emotionalRange.toLowerCase()}`

  const pitchHook = `${sceneIdentity.primaryScene} artist ${
    creativeProfile.primaryMotifs.length > 0
      ? `known for ${creativeProfile.primaryMotifs[0]}`
      : 'building authentic connections'
  }`

  const comparisons = microgenres.influences.slice(0, 3)

  return {
    oneLiner,
    pressAngle,
    pitchHook,
    comparisons,
  }
}

function generateShortBio(epkFragments: EPKFragments, sceneIdentity: SceneIdentity): string {
  return `${epkFragments.oneLiner}. Rooted in ${sceneIdentity.geographicRoots}, creating ${epkFragments.pressAngle.toLowerCase()}.`
}

function generateLongBio(
  brandVoice: BrandVoice,
  creativeProfile: CreativeProfile,
  narrativeProfile: NarrativeProfile,
  sceneIdentity: SceneIdentity,
  epkFragments: EPKFragments
): string {
  return `${epkFragments.oneLiner}. ${epkFragments.pitchHook}.

Emerging from ${sceneIdentity.geographicRoots}, this ${brandVoice.style.toLowerCase()} has been ${narrativeProfile.evolution.toLowerCase()}. Known for ${creativeProfile.structuralSignature.toLowerCase()}, their work explores ${brandVoice.themes.join(', ')}.

${narrativeProfile.narrativeStyle} in approach, they've built a presence across ${sceneIdentity.primaryScene} and beyond. ${creativeProfile.uniqueElements.join(' and ')} define their sound.`
}
