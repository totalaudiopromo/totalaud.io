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
  setProfile: (profile: Partial<UserProfile>, skipSync?: boolean) => void
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

      setProfile: (profile, skipSync = false) => {
        const now = new Date().toISOString()
        set({
          profile: {
            ...defaultProfile,
            ...profile,
            createdAt: now,
            updatedAt: now,
          },
        })
        // Trigger async save unless explicitly skipped (e.g., during onboarding when completeOnboarding will handle it)
        if (!skipSync) {
          get().saveToSupabase()
        }
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

          const { data, error } = await supabase
            .from('user_profiles')
            .select(
              `
              artist_name,
              genre,
              vibe,
              project_type,
              project_title,
              release_date,
              primary_goal,
              goals,
              onboarding_completed,
              onboarding_completed_at,
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
                artistName: data.artist_name || existingProfile?.artistName || '',
                genre: data.genre || existingProfile?.genre || '',
                vibe: data.vibe || existingProfile?.vibe || '',
                projectType:
                  (data.project_type as ProjectType) || existingProfile?.projectType || 'none',
                projectTitle: data.project_title || existingProfile?.projectTitle || '',
                releaseDate: data.release_date || existingProfile?.releaseDate || null,
                primaryGoal:
                  (data.primary_goal as PrimaryGoal) || existingProfile?.primaryGoal || 'explore',
                goals: data.goals || existingProfile?.goals || [],
                onboardingCompleted: data.onboarding_completed || false,
                onboardingCompletedAt:
                  data.onboarding_completed_at || existingProfile?.onboardingCompletedAt || null,
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
            onboardingCompleted: profile.onboardingCompleted,
          })

          const { error } = await supabase.from('user_profiles').upsert(
            {
              id: user.id,
              artist_name: profile.artistName,
              genre: profile.genre || null,
              vibe: profile.vibe || null,
              project_type: profile.projectType === 'none' ? null : profile.projectType,
              project_title: profile.projectTitle || null,
              release_date: profile.releaseDate || null,
              primary_goal: profile.primaryGoal === 'explore' ? null : profile.primaryGoal,
              goals: profile.goals.length > 0 ? profile.goals : null,
              onboarding_completed: profile.onboardingCompleted,
              onboarding_completed_at: profile.onboardingCompletedAt,
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
