/**
 * Curated Contacts Store
 *
 * Manages tier-gated curated contacts from TAP's enriched database.
 * Used in Scout mode alongside opportunity discovery.
 */

'use client'

import { create } from 'zustand'

export interface CuratedContact {
  id: string
  name: string | null
  outlet: string | null
  role: string | null
  email: string | null
  platformType: string | null
  genres: string[]
  coverageArea: string | null
  geographicScope: string | null
  contactMethod: string | null
  bestTiming: string | null
  submissionGuidelines: string | null
  pitchTips: string[]
  bbcStation: string | null
  enrichmentConfidence: string | null
}

type PlatformFilter = 'radio' | 'press' | 'playlist' | 'blog' | 'podcast' | null

interface CuratedContactsState {
  contacts: CuratedContact[]
  loading: boolean
  error: string | null
  total: number
  tier: string
  maxContacts: number
  upgradeRequired: boolean
  hasFetched: boolean

  // Filters
  platformFilter: PlatformFilter
  genreFilter: string | null
  searchQuery: string

  // Saved contacts
  savedIds: Set<string>

  // Actions
  fetchContacts: () => Promise<void>
  setPlatformFilter: (type: PlatformFilter) => void
  setGenreFilter: (genre: string | null) => void
  setSearchQuery: (query: string) => void
  saveContact: (contactId: string) => Promise<void>
  unsaveContact: (contactId: string) => Promise<void>
}

export const useCuratedContactsStore = create<CuratedContactsState>((set, get) => ({
  contacts: [],
  loading: false,
  error: null,
  total: 0,
  tier: 'free',
  maxContacts: 10,
  upgradeRequired: false,
  hasFetched: false,

  platformFilter: null,
  genreFilter: null,
  searchQuery: '',

  savedIds: new Set(),

  fetchContacts: async () => {
    set({ loading: true, error: null })

    try {
      const { platformFilter, genreFilter, searchQuery, savedIds: existingSavedIds } = get()
      const params = new URLSearchParams()
      params.set('limit', '100')

      if (platformFilter) params.set('type', platformFilter)
      if (genreFilter) params.set('genre', genreFilter)
      if (searchQuery.length >= 2) params.set('q', searchQuery)

      // Fetch contacts and saved IDs in parallel (savedIds only on first load)
      const needsSavedIds = existingSavedIds.size === 0
      const results = await Promise.allSettled([
        fetch(`/api/contacts/curated?${params.toString()}`),
        needsSavedIds ? fetch('/api/contacts/curated/save') : Promise.resolve(null),
      ])

      const contactsResult = results[0]
      const savedResult = results[1]

      if (contactsResult.status !== 'fulfilled') {
        throw contactsResult.reason ?? new Error('Failed to fetch contacts')
      }

      const contactsRes = contactsResult.value
      if (!contactsRes.ok) {
        const body = await contactsRes.json().catch(() => ({}))
        throw new Error(body.error || `Request failed: ${contactsRes.status}`)
      }

      const data = await contactsRes.json()

      let savedIds = existingSavedIds
      if (savedResult.status === 'fulfilled' && savedResult.value?.ok) {
        const savedData = await savedResult.value.json()
        savedIds = new Set<string>(savedData.savedIds ?? [])
      }

      set({
        contacts: data.contacts ?? [],
        total: data.total ?? 0,
        tier: data.tier ?? 'free',
        maxContacts: data.maxContacts ?? 10,
        upgradeRequired: data.upgradeRequired ?? false,
        savedIds,
        loading: false,
        hasFetched: true,
      })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load contacts',
        loading: false,
        hasFetched: true,
      })
    }
  },

  setPlatformFilter: (type) => {
    set({ platformFilter: type })
    get().fetchContacts()
  },

  setGenreFilter: (genre) => {
    set({ genreFilter: genre })
    get().fetchContacts()
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
    if (query.length === 0 || query.length >= 2) {
      get().fetchContacts()
    }
  },

  saveContact: async (contactId: string) => {
    try {
      const res = await fetch('/api/contacts/curated/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curatedContactId: contactId }),
      })
      if (res.ok) {
        set((state) => ({
          savedIds: new Set([...state.savedIds, contactId]),
        }))
      }
    } catch {
      // Silent fail -- toast handled by caller
    }
  },

  unsaveContact: async (contactId: string) => {
    try {
      const res = await fetch('/api/contacts/curated/save', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curatedContactId: contactId }),
      })
      if (res.ok) {
        set((state) => {
          const next = new Set(state.savedIds)
          next.delete(contactId)
          return { savedIds: next }
        })
      }
    } catch {
      // Silent fail
    }
  },
}))
