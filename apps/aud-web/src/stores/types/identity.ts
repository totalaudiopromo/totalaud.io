/**
 * Identity Store Types
 *
 * Type definitions for the Artist Identity store.
 * Used by Pitch Mode for brand voice and EPK generation.
 */

// ============================================================================
// Domain Types
// ============================================================================

export interface ArtistIdentity {
  id: string
  userId: string

  // Brand Voice
  brandTone: string | null
  brandThemes: string[]
  brandStyle: string | null
  keyPhrases: string[]

  // Creative Profile
  primaryMotifs: string[]
  emotionalRange: string | null
  uniqueElements: string[]

  // EPK Fragments
  oneLiner: string | null
  pressAngle: string | null
  pitchHook: string | null
  comparisons: string[]

  // Auto-generated bios
  bioShort: string | null
  bioLong: string | null

  // Metadata
  lastGeneratedAt: string | null
  createdAt: string
  updatedAt: string
}

// ============================================================================
// State Interface (Pure Data)
// ============================================================================

export interface IdentityStateData {
  /** Current artist identity */
  identity: ArtistIdentity | null
}

// ============================================================================
// Sync State Interface
// ============================================================================

export interface IdentitySyncState {
  /** Whether data is loading */
  isLoading: boolean
  /** Whether identity is being generated */
  isGenerating: boolean
  /** Error message */
  error: string | null
}

// ============================================================================
// Actions Interface
// ============================================================================

export interface IdentityActions {
  /** Load identity from Supabase */
  loadIdentity: () => Promise<void>
  /** Generate or regenerate identity using AI */
  generateIdentity: () => Promise<void>
  /** Update specific fields */
  updateIdentity: (updates: Partial<ArtistIdentity>) => Promise<void>
  /** Clear identity */
  clearIdentity: () => void
}

// ============================================================================
// Complete Store Interface
// ============================================================================

export type IdentityState = IdentityStateData & IdentitySyncState & IdentityActions

// ============================================================================
// Initial State Factory
// ============================================================================

export const createInitialIdentityState = (): IdentityStateData & IdentitySyncState => ({
  identity: null,
  isLoading: false,
  isGenerating: false,
  error: null,
})
