/**
 * Identity Store
 *
 * Zustand store for artist identity management with:
 * - Supabase sync for authenticated users
 * - localStorage fallback for unauthenticated users
 * - AI-powered identity generation from pitch history
 * - Auto-generated bios from brand voice
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

const log = logger.scope('Identity Store')

// ============ Types ============

export interface BrandVoice {
  tone: string | null
  themes: string[]
  style: string | null
  keyPhrases: string[]
}

export interface CreativeProfile {
  primaryMotifs: string[]
  emotionalRange: string | null
  uniqueElements: string[]
}

export interface EPKFragments {
  oneLiner: string | null
  pressAngle: string | null
  pitchHook: string | null
  comparisons: string[]
}

export interface GeneratedBios {
  short: string | null
  long: string | null
}

export interface ArtistIdentity {
  id: string
  userId: string

  // Brand Voice
  brandVoice: BrandVoice

  // Creative Profile
  creativeProfile: CreativeProfile

  // EPK Fragments
  epkFragments: EPKFragments

  // Auto-generated bios
  bios: GeneratedBios

  // Metadata
  lastGeneratedAt: string | null
  createdAt: string
  updatedAt: string
}

// ============ Database Types ============

interface DatabaseArtistIdentity {
  id: string
  user_id: string
  brand_tone: string | null
  brand_themes: string[] | null
  brand_style: string | null
  key_phrases: string[] | null
  primary_motifs: string[] | null
  emotional_range: string | null
  unique_elements: string[] | null
  one_liner: string | null
  press_angle: string | null
  pitch_hook: string | null
  comparisons: string[] | null
  bio_short: string | null
  bio_long: string | null
  last_generated_at: string | null
  created_at: string
  updated_at: string
}

// ============ Helper Functions ============

function fromSupabaseIdentity(data: DatabaseArtistIdentity): ArtistIdentity {
  return {
    id: data.id,
    userId: data.user_id,
    brandVoice: {
      tone: data.brand_tone,
      themes: data.brand_themes || [],
      style: data.brand_style,
      keyPhrases: data.key_phrases || [],
    },
    creativeProfile: {
      primaryMotifs: data.primary_motifs || [],
      emotionalRange: data.emotional_range,
      uniqueElements: data.unique_elements || [],
    },
    epkFragments: {
      oneLiner: data.one_liner,
      pressAngle: data.press_angle,
      pitchHook: data.pitch_hook,
      comparisons: data.comparisons || [],
    },
    bios: {
      short: data.bio_short,
      long: data.bio_long,
    },
    lastGeneratedAt: data.last_generated_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function toSupabaseIdentity(identity: ArtistIdentity): Omit<DatabaseArtistIdentity, 'created_at'> {
  return {
    id: identity.id,
    user_id: identity.userId,
    brand_tone: identity.brandVoice.tone,
    brand_themes: identity.brandVoice.themes,
    brand_style: identity.brandVoice.style,
    key_phrases: identity.brandVoice.keyPhrases,
    primary_motifs: identity.creativeProfile.primaryMotifs,
    emotional_range: identity.creativeProfile.emotionalRange,
    unique_elements: identity.creativeProfile.uniqueElements,
    one_liner: identity.epkFragments.oneLiner,
    press_angle: identity.epkFragments.pressAngle,
    pitch_hook: identity.epkFragments.pitchHook,
    comparisons: identity.epkFragments.comparisons,
    bio_short: identity.bios.short,
    bio_long: identity.bios.long,
    last_generated_at: identity.lastGeneratedAt,
    updated_at: identity.updatedAt,
  }
}

function createEmptyIdentity(userId: string): ArtistIdentity {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    userId,
    brandVoice: {
      tone: null,
      themes: [],
      style: null,
      keyPhrases: [],
    },
    creativeProfile: {
      primaryMotifs: [],
      emotionalRange: null,
      uniqueElements: [],
    },
    epkFragments: {
      oneLiner: null,
      pressAngle: null,
      pitchHook: null,
      comparisons: [],
    },
    bios: {
      short: null,
      long: null,
    },
    lastGeneratedAt: null,
    createdAt: now,
    updatedAt: now,
  }
}

// ============ Store Interface ============

interface IdentityState {
  // Data
  identity: ArtistIdentity | null

  // Loading states
  isLoading: boolean
  isGenerating: boolean
  isSyncing: boolean

  // Error state
  syncError: string | null

  // Actions - Data Management
  loadFromSupabase: () => Promise<void>
  saveToSupabase: () => Promise<void>

  // Actions - Identity Generation
  generateIdentity: () => Promise<void>
  generateBios: (tone?: 'casual' | 'professional' | 'enthusiastic') => Promise<void>

  // Actions - Manual Updates
  updateBrandVoice: (partial: Partial<BrandVoice>) => void
  updateCreativeProfile: (partial: Partial<CreativeProfile>) => void
  updateEPKFragments: (partial: Partial<EPKFragments>) => void

  // Actions - Reset
  resetIdentity: () => void
}

// ============ Store Implementation ============

export const useIdentityStore = create<IdentityState>()(
  persist(
    (set, get) => ({
      // Initial state
      identity: null,
      isLoading: false,
      isGenerating: false,
      isSyncing: false,
      syncError: null,

      // ========== Data Management ==========

      loadFromSupabase: async () => {
        set({ isLoading: true, syncError: null })

        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (!user) {
            set({ isLoading: false })
            return
          }

          // Note: Type assertion needed until Supabase types are regenerated
          const { data, error } = await (supabase as any)
            .from('artist_identities')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows found, which is fine
            log.error('Load identity error', error)
            set({ isLoading: false, syncError: error.message })
            return
          }

          if (data) {
            set({
              identity: fromSupabaseIdentity(data as DatabaseArtistIdentity),
              isLoading: false,
            })
          } else {
            // No identity yet - create empty one
            set({
              identity: createEmptyIdentity(user.id),
              isLoading: false,
            })
          }
        } catch (error) {
          log.error('Load identity error', error)
          set({
            isLoading: false,
            syncError: error instanceof Error ? error.message : 'Failed to load identity',
          })
        }
      },

      saveToSupabase: async () => {
        const state = get()
        if (!state.identity || state.isSyncing) return

        set({ isSyncing: true, syncError: null })

        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (!user) {
            set({ isSyncing: false })
            return
          }

          const updatedIdentity = {
            ...state.identity,
            updatedAt: new Date().toISOString(),
          }

          // Note: Type assertion needed until Supabase types are regenerated
          const { error } = await (supabase as any)
            .from('artist_identities')
            .upsert(toSupabaseIdentity(updatedIdentity), { onConflict: 'user_id' })

          if (error) {
            log.error('Save identity error', error)
            set({ isSyncing: false, syncError: error.message })
            return
          }

          set({
            identity: updatedIdentity,
            isSyncing: false,
          })
        } catch (error) {
          log.error('Save identity error', error)
          set({
            isSyncing: false,
            syncError: error instanceof Error ? error.message : 'Failed to save identity',
          })
        }
      },

      // ========== Identity Generation ==========

      generateIdentity: async () => {
        const state = get()
        set({ isGenerating: true, syncError: null })

        try {
          const response = await fetch('/api/identity/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })

          const data = await response.json()

          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to generate identity')
          }

          const now = new Date().toISOString()
          const generated = data.data

          set({
            identity: {
              id: state.identity?.id || crypto.randomUUID(),
              userId: state.identity?.userId || '',
              brandVoice: {
                tone: generated.brandVoice?.tone || null,
                themes: generated.brandVoice?.themes || [],
                style: generated.brandVoice?.style || null,
                keyPhrases: generated.brandVoice?.keyPhrases || [],
              },
              creativeProfile: {
                primaryMotifs: generated.creativeProfile?.primaryMotifs || [],
                emotionalRange: generated.creativeProfile?.emotionalRange || null,
                uniqueElements: generated.creativeProfile?.uniqueElements || [],
              },
              epkFragments: {
                oneLiner: generated.epkFragments?.oneLiner || null,
                pressAngle: generated.epkFragments?.pressAngle || null,
                pitchHook: generated.epkFragments?.pitchHook || null,
                comparisons: generated.epkFragments?.comparisons || [],
              },
              bios: {
                short: generated.bios?.short || null,
                long: generated.bios?.long || null,
              },
              lastGeneratedAt: now,
              createdAt: state.identity?.createdAt || now,
              updatedAt: now,
            },
            isGenerating: false,
          })

          // Auto-save to Supabase
          await get().saveToSupabase()
        } catch (error) {
          log.error('Generate identity error', error)
          set({
            isGenerating: false,
            syncError: error instanceof Error ? error.message : 'Failed to generate identity',
          })
        }
      },

      generateBios: async (tone = 'professional') => {
        const state = get()
        if (!state.identity) return

        set({ isGenerating: true, syncError: null })

        try {
          const response = await fetch('/api/identity/bios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tone,
              identity: {
                brandVoice: state.identity.brandVoice,
                creativeProfile: state.identity.creativeProfile,
                epkFragments: state.identity.epkFragments,
              },
            }),
          })

          const data = await response.json()

          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to generate bios')
          }

          const now = new Date().toISOString()

          set((s) => ({
            identity: s.identity
              ? {
                  ...s.identity,
                  bios: {
                    short: data.data.short || s.identity.bios.short,
                    long: data.data.long || s.identity.bios.long,
                  },
                  lastGeneratedAt: now,
                  updatedAt: now,
                }
              : null,
            isGenerating: false,
          }))

          // Auto-save to Supabase
          await get().saveToSupabase()
        } catch (error) {
          log.error('Generate bios error', error)
          set({
            isGenerating: false,
            syncError: error instanceof Error ? error.message : 'Failed to generate bios',
          })
        }
      },

      // ========== Manual Updates ==========

      updateBrandVoice: (partial) => {
        set((state) => ({
          identity: state.identity
            ? {
                ...state.identity,
                brandVoice: { ...state.identity.brandVoice, ...partial },
                updatedAt: new Date().toISOString(),
              }
            : null,
        }))
      },

      updateCreativeProfile: (partial) => {
        set((state) => ({
          identity: state.identity
            ? {
                ...state.identity,
                creativeProfile: { ...state.identity.creativeProfile, ...partial },
                updatedAt: new Date().toISOString(),
              }
            : null,
        }))
      },

      updateEPKFragments: (partial) => {
        set((state) => ({
          identity: state.identity
            ? {
                ...state.identity,
                epkFragments: { ...state.identity.epkFragments, ...partial },
                updatedAt: new Date().toISOString(),
              }
            : null,
        }))
      },

      // ========== Reset ==========

      resetIdentity: () => {
        set({
          identity: null,
          isLoading: false,
          isGenerating: false,
          isSyncing: false,
          syncError: null,
        })
      },
    }),
    {
      name: 'totalaud-identity-store',
      version: 1,
    }
  )
)

// ============ Selectors ============

export const selectHasIdentity = (state: IdentityState): boolean => {
  return state.identity !== null && state.identity.lastGeneratedAt !== null
}

export const selectOneLiner = (state: IdentityState): string | null => {
  return state.identity?.epkFragments.oneLiner || null
}

export const selectShortBio = (state: IdentityState): string | null => {
  return state.identity?.bios.short || null
}

export const selectLongBio = (state: IdentityState): string | null => {
  return state.identity?.bios.long || null
}

export const selectBrandTone = (state: IdentityState): string | null => {
  return state.identity?.brandVoice.tone || null
}

export const selectComparisons = (state: IdentityState): string[] => {
  return state.identity?.epkFragments.comparisons || []
}

export const selectIdentityStatus = (state: IdentityState) => ({
  isLoading: state.isLoading,
  isGenerating: state.isGenerating,
  isSyncing: state.isSyncing,
  error: state.syncError,
  hasIdentity: selectHasIdentity(state),
})
