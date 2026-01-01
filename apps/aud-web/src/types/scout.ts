/**
 * Scout Mode Types
 *
 * Phase 3: MVP Pivot - Scout Mode
 *
 * Types for opportunities (radio contacts, playlists, blogs, curators, press).
 * Designed to work with Airtable import and Supabase persistence.
 */

// ============================================================================
// Opportunity Types
// ============================================================================

export type OpportunityType = 'radio' | 'playlist' | 'blog' | 'curator' | 'press'

export type AudienceSize = 'small' | 'medium' | 'large'

export type OpportunitySource = 'airtable' | 'manual' | 'discovery' | 'curated' | 'research'

/**
 * An opportunity is a potential outlet for music promotion.
 * Could be a radio station, playlist, blog, curator, or press contact.
 */
export interface Opportunity {
  id: string
  name: string
  type: OpportunityType
  genres: string[]
  vibes: string[]
  audienceSize: AudienceSize
  link?: string
  contactEmail?: string
  contactName?: string
  description?: string
  source: OpportunitySource
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Filter Types
// ============================================================================

export interface ScoutFilters {
  genres: string[]
  vibes: string[]
  type: OpportunityType | null
  audienceSize: AudienceSize | null
  searchQuery: string
}

export const DEFAULT_FILTERS: ScoutFilters = {
  genres: [],
  vibes: [],
  type: null,
  audienceSize: null,
  searchQuery: '',
}

// ============================================================================
// Display Constants
// ============================================================================

/**
 * Type icons - text-based symbols for each opportunity type.
 * Matches the existing tokens.ts pattern.
 */
export const TYPE_ICONS: Record<OpportunityType, string> = {
  radio: '◉',
  playlist: '♫',
  blog: '✎',
  curator: '★',
  press: '▣',
}

/**
 * Type labels - human-readable names.
 */
export const TYPE_LABELS: Record<OpportunityType, string> = {
  radio: 'Radio',
  playlist: 'Playlist',
  blog: 'Blog',
  curator: 'Curator',
  press: 'Press',
}

/**
 * Type colours - matches the calm, muted design system.
 * Consistent with tokens.ts accent palette.
 */
export const TYPE_COLOURS: Record<OpportunityType, { bg: string; border: string; text: string }> = {
  radio: {
    bg: 'rgba(58, 169, 190, 0.08)',
    border: 'rgba(58, 169, 190, 0.3)',
    text: '#3AA9BE',
  },
  playlist: {
    bg: 'rgba(73, 163, 108, 0.08)',
    border: 'rgba(73, 163, 108, 0.3)',
    text: '#49A36C',
  },
  blog: {
    bg: 'rgba(168, 85, 247, 0.08)',
    border: 'rgba(168, 85, 247, 0.3)',
    text: '#A855F7',
  },
  curator: {
    bg: 'rgba(196, 160, 82, 0.08)',
    border: 'rgba(196, 160, 82, 0.3)',
    text: '#C4A052',
  },
  press: {
    bg: 'rgba(249, 115, 22, 0.08)',
    border: 'rgba(249, 115, 22, 0.3)',
    text: '#F97316',
  },
}

/**
 * Audience size labels and colours.
 */
export const AUDIENCE_SIZE_LABELS: Record<AudienceSize, string> = {
  small: 'Indie',
  medium: 'Growing',
  large: 'Major',
}

export const AUDIENCE_SIZE_COLOURS: Record<AudienceSize, string> = {
  small: '#6B7280',
  medium: '#C4A052',
  large: '#49A36C',
}

// ============================================================================
// Genre & Vibe Options
// ============================================================================

/**
 * Common music genres for filtering.
 * Matches Airtable "Preferred Genres" field.
 */
export const GENRE_OPTIONS = [
  'Alternative',
  'Ambient',
  'Blues',
  'Classical',
  'Country',
  'Dance',
  'Electronic',
  'Folk',
  'Hip-Hop',
  'Indie',
  'Jazz',
  'Metal',
  'Pop',
  'R&B',
  'Reggae',
  'Rock',
  'Soul',
  'World',
] as const

export type Genre = (typeof GENRE_OPTIONS)[number]

/**
 * Vibe/mood tags for filtering.
 * Artist-friendly language.
 */
export const VIBE_OPTIONS = [
  'Chill',
  'Energetic',
  'Emotional',
  'Dark',
  'Uplifting',
  'Experimental',
  'Mainstream',
  'Underground',
] as const

export type Vibe = (typeof VIBE_OPTIONS)[number]

// ============================================================================
// TAP Intel Enrichment Types
// ============================================================================

/**
 * Contact enrichment confidence level from TAP Intel.
 */
export type EnrichmentConfidence = 'High' | 'Medium' | 'Low'

/**
 * Email validation classification from TAP Intel.
 */
export type EmailClassification = 'safe' | 'risky' | 'invalid'

/**
 * Enriched contact data returned from TAP Intel.
 */
export interface EnrichedContact {
  contactIntelligence?: string
  researchConfidence?: EnrichmentConfidence
  lastResearched?: string
  emailValidation?: {
    isValid: boolean
    confidence: number
    classification?: EmailClassification
  }
  errors?: string[]
}

/**
 * Enrichment status for tracking validation state.
 */
export type EnrichmentStatus = 'idle' | 'loading' | 'success' | 'error'

// ============================================================================
// Utility Types
// ============================================================================

/**
 * For creating new opportunities (without id and timestamps).
 */
export type NewOpportunity = Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>

/**
 * For updating opportunities (all fields optional except id).
 */
export type OpportunityUpdate = Partial<Omit<Opportunity, 'id' | 'createdAt'>>

// ============================================================================
// Smart Presets (DESSA Simplification)
// ============================================================================

/**
 * Smart presets for common opportunity searches.
 * Provides quick filtering without overwhelming the UI.
 */
export const SMART_PRESETS = [
  { label: 'All', filters: {} as Partial<ScoutFilters> },
  { label: 'Radio', filters: { type: 'radio' as OpportunityType } },
  { label: 'Playlists', filters: { type: 'playlist' as OpportunityType } },
  { label: 'Press', filters: { type: 'press' as OpportunityType } },
  { label: 'Blogs', filters: { type: 'blog' as OpportunityType } },
  { label: 'Curators', filters: { type: 'curator' as OpportunityType } },
] as const

export type SmartPreset = (typeof SMART_PRESETS)[number]
