/**
 * React Query Configuration
 *
 * Provides centralised data fetching, caching, and synchronisation.
 *
 * Key benefits:
 * - Request deduplication (prevents duplicate API calls)
 * - Automatic caching with configurable stale times
 * - Background refetching for fresh data
 * - Optimistic updates with rollback
 * - Built-in loading and error states
 */

export { QueryProvider } from './provider'

// Query keys factory for consistent key management
export const queryKeys = {
  // User related
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    subscription: () => [...queryKeys.user.all, 'subscription'] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
  },

  // Identity related
  identity: {
    all: ['identity'] as const,
    current: () => [...queryKeys.identity.all, 'current'] as const,
  },

  // Timeline related
  timeline: {
    all: ['timeline'] as const,
    events: () => [...queryKeys.timeline.all, 'events'] as const,
    threads: () => [...queryKeys.timeline.all, 'threads'] as const,
    thread: (id: string) => [...queryKeys.timeline.threads(), id] as const,
  },

  // Ideas related
  ideas: {
    all: ['ideas'] as const,
    cards: () => [...queryKeys.ideas.all, 'cards'] as const,
    card: (id: string) => [...queryKeys.ideas.cards(), id] as const,
  },

  // Pitch related
  pitch: {
    all: ['pitch'] as const,
    drafts: () => [...queryKeys.pitch.all, 'drafts'] as const,
    draft: (id: string) => [...queryKeys.pitch.drafts(), id] as const,
    sessions: () => [...queryKeys.pitch.all, 'sessions'] as const,
    session: (id: string) => [...queryKeys.pitch.sessions(), id] as const,
  },

  // Scout related
  scout: {
    all: ['scout'] as const,
    opportunities: () => [...queryKeys.scout.all, 'opportunities'] as const,
    opportunity: (id: string) => [...queryKeys.scout.opportunities(), id] as const,
    filters: () => [...queryKeys.scout.all, 'filters'] as const,
  },
} as const
