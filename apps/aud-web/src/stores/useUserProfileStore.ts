/**
 * User Profile Store
 *
 * Stores artist profile data collected during onboarding:
 * - Artist name, genre, vibe
 * - Current project (single/EP/album)
 * - Release date (centre of gravity for Timeline)
 * - Primary goals
 *
 * Syncs to Supabase user_profiles table for authenticated users,
 * falls back to localStorage for guests.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

const log = logger.scope('User Profile')

export type ProjectType = 'single' | 'ep' | 'album' | 'none'
export type PrimaryGoal = 'discover' | 'plan' | 'pitch' | 'explore'

export interface UserProfile {
  // Identity
  artistName: string
  genre: string // Freeform, AI-categorised
  vibe: string // Additional descriptors

  // Current project
  projectType: ProjectType
  projectTitle: string // e.g., "Midnight Dreams"
  releaseDate: string | null // ISO date string, null if exploring

  // Goals
  primaryGoal: PrimaryGoal
  goals: string[] // Additional goals mentioned in chat

  // Onboarding
  onboardingCompleted: boolean
  onboardingCompletedAt: string | null

  // Metadata
  createdAt: string
  updatedAt: string
}

interface UserProfileState {
  profile: UserProfile | null
  isLoading: boolean
  syncError: string | null

  // Actions
  setProfile: (profile: Partial<UserProfile>) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  completeOnboarding: () => Promise<void>
  resetProfile: () => void

  // Sync
  loadFromSupabase: () => Promise<void>
  saveToSupabase: () => Promise<void>

  // Computed
  daysUntilRelease: () => number | null
  hasReleaseDate: () => boolean
}

const defaultProfile: UserProfile = {
  artistName: '',
  genre: '',
  vibe: '',
  projectType: 'none',
  projectTitle: '',
  releaseDate: null,
  primaryGoal: 'explore',
  goals: [],
  onboardingCompleted: false,
  onboardingCompletedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoading: false,
      syncError: null,

      setProfile: (profile) => {
        const now = new Date().toISOString()
        set({
          profile: {
            ...defaultProfile,
            ...profile,
            createdAt: now,
            updatedAt: now,
          },
        })
        // Trigger async save
        get().saveToSupabase()
      },

      updateProfile: (updates) => {
        const current = get().profile
        if (!current) return

        set({
          profile: {
            ...current,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        })
        // Trigger async save
        get().saveToSupabase()
      },

      completeOnboarding: async () => {
        const current = get().profile
        if (!current) {
          log.warn('completeOnboarding called but no profile exists')
          return
        }

        const now = new Date().toISOString()
        set({
          profile: {
            ...current,
            onboardingCompleted: true,
            onboardingCompletedAt: now,
            updatedAt: now,
          },
        })

        log.info('Completing onboarding, saving to Supabase...')
        await get().saveToSupabase()
        log.info('Onboarding completion saved')
      },

      resetProfile: () => {
        set({ profile: null, syncError: null })
      },

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

          // Note: user_profiles table has limited columns in totalaud.io
          // Extended profile fields are stored in localStorage only
          const { data, error } = await supabase
            .from('user_profiles')
            .select(
              `
              full_name,
              onboarding_completed,
              created_at,
              updated_at
            `
            )
            .eq('id', user.id)
            .single()

          if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows returned
            throw error
          }

          const now = new Date().toISOString()
          const existingProfile = get().profile

          if (data) {
            set({
              profile: {
                // Use database value for artist name, fall back to localStorage value
                artistName: data.full_name || existingProfile?.artistName || '',
                // These fields are stored in localStorage only (not in database)
                genre: existingProfile?.genre || '',
                vibe: existingProfile?.vibe || '',
                projectType: existingProfile?.projectType || 'none',
                projectTitle: existingProfile?.projectTitle || '',
                releaseDate: existingProfile?.releaseDate || null,
                primaryGoal: existingProfile?.primaryGoal || 'explore',
                goals: existingProfile?.goals || [],
                onboardingCompleted: data.onboarding_completed || false,
                onboardingCompletedAt: existingProfile?.onboardingCompletedAt || null,
                createdAt: data.created_at || now,
                updatedAt: data.updated_at || now,
              },
              isLoading: false,
            })
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          log.error('Failed to load profile from Supabase', error)
          set({
            syncError: error instanceof Error ? error.message : 'Failed to load profile',
            isLoading: false,
          })
        }
      },

      saveToSupabase: async () => {
        const profile = get().profile
        if (!profile) {
          log.debug('saveToSupabase: No profile to save')
          return
        }

        try {
          const supabase = createBrowserSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (!user) {
            log.debug('saveToSupabase: No authenticated user, localStorage only')
            return
          }

          log.debug('saveToSupabase: Upserting profile', {
            userId: user.id,
            email: user.email,
            onboardingCompleted: profile.onboardingCompleted,
          })

          // Note: Only saving columns that exist in totalaud.io user_profiles table
          // Extended profile fields (genre, vibe, projectType, etc.) are stored in localStorage only
          const { error } = await supabase.from('user_profiles').upsert(
            {
              id: user.id,
              email: user.email || '',
              full_name: profile.artistName,
              onboarding_completed: profile.onboardingCompleted,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          )

          if (error) {
            log.error('saveToSupabase: Upsert failed', error)
            throw error
          }

          log.debug('saveToSupabase: Profile saved successfully')
          set({ syncError: null })
        } catch (error) {
          log.error('Failed to save profile to Supabase', error)
          set({
            syncError: error instanceof Error ? error.message : 'Failed to save profile',
          })
        }
      },

      // Computed helpers
      daysUntilRelease: () => {
        const profile = get().profile
        if (!profile?.releaseDate) return null

        const release = new Date(profile.releaseDate)
        const today = new Date()
        const diffTime = release.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        return diffDays
      },

      hasReleaseDate: () => {
        const profile = get().profile
        return !!profile?.releaseDate
      },
    }),
    {
      name: 'totalaud-user-profile',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
)
