/**
 * useLabelStore — single store for the Label OS workspace.
 *
 * Entity data is loaded from the /api/label routes on mount and never
 * persisted to localStorage (labels are multi-user). Only the active label
 * id survives reloads. Mutations are optimistic with rollback on failure.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { logger } from '@/lib/logger'
import type {
  ArtistInsert,
  ArtistRow,
  ContactInsert,
  ContactRow,
  LabelRole,
  LabelWithRole,
  ReleaseInsert,
  ReleaseRow,
  ReleaseTaskRow,
  TaskInsert,
  TrackInsert,
  TrackRow,
} from '@/lib/label/types'

const log = logger.scope('LabelStore')

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  const body = (await response.json().catch(() => ({}))) as { data?: T; error?: string }
  if (!response.ok) {
    throw new Error(body.error || `Request failed (${response.status})`)
  }
  return body.data as T
}

interface LabelState {
  // Labels
  labels: LabelWithRole[]
  activeLabelId: string | null
  isLoadingLabels: boolean
  labelsError: string | null

  // Entities (scoped to the active label)
  artists: ArtistRow[]
  isLoadingArtists: boolean
  releases: ReleaseRow[]
  isLoadingReleases: boolean
  tracksByRelease: Record<string, TrackRow[]>
  tasks: ReleaseTaskRow[]
  isLoadingTasks: boolean
  contacts: ContactRow[]
  isLoadingContacts: boolean

  // Actions — labels
  loadLabels: () => Promise<void>
  createLabel: (name: string, slug: string, description?: string) => Promise<LabelWithRole>
  setActiveLabel: (labelId: string) => void

  // Actions — artists
  loadArtists: (labelId: string) => Promise<void>
  createArtist: (data: ArtistInsert) => Promise<ArtistRow>
  updateArtist: (id: string, data: Partial<ArtistInsert>) => Promise<void>
  deleteArtist: (id: string) => Promise<void>

  // Actions — releases
  loadReleases: (labelId: string) => Promise<void>
  createRelease: (data: ReleaseInsert) => Promise<ReleaseRow>
  updateRelease: (id: string, data: Partial<ReleaseInsert>) => Promise<void>
  deleteRelease: (id: string) => Promise<void>

  // Actions — tracks
  loadTracks: (releaseId: string) => Promise<void>
  createTrack: (data: TrackInsert) => Promise<TrackRow>
  updateTrack: (id: string, releaseId: string, data: Partial<TrackInsert>) => Promise<void>
  deleteTrack: (id: string, releaseId: string) => Promise<void>

  // Actions — tasks
  loadTasks: (labelId: string) => Promise<void>
  createTask: (data: TaskInsert) => Promise<ReleaseTaskRow>
  toggleTask: (id: string, completed: boolean) => Promise<void>
  deleteTask: (id: string) => Promise<void>

  // Actions — contacts
  loadContacts: (labelId: string) => Promise<void>
  createContact: (data: ContactInsert) => Promise<ContactRow>
  updateContact: (id: string, data: Partial<ContactInsert>) => Promise<void>
  deleteContact: (id: string) => Promise<void>
}

/** Maps camelCase insert payloads to the API's expected body shape. */
function artistBody(data: Partial<ArtistInsert>) {
  return {
    labelId: data.label_id,
    name: data.name,
    bio: data.bio ?? undefined,
    genres: data.genres,
    imageUrl: data.image_url,
    website: data.website,
    spotifyUrl: data.spotify_url,
  }
}

function releaseBody(data: Partial<ReleaseInsert>) {
  return {
    labelId: data.label_id,
    artistId: data.artist_id,
    title: data.title,
    type: data.type,
    status: data.status,
    releaseDate: data.release_date,
    upc: data.upc,
    notes: data.notes,
  }
}

function trackBody(data: Partial<TrackInsert>) {
  return {
    labelId: data.label_id,
    releaseId: data.release_id,
    title: data.title,
    trackNumber: data.track_number,
    durationSeconds: data.duration_seconds,
    isrc: data.isrc,
    version: data.version,
    status: data.status,
  }
}

function contactBody(data: Partial<ContactInsert>) {
  return {
    labelId: data.label_id,
    name: data.name,
    outlet: data.outlet,
    type: data.type,
    email: data.email,
    tags: data.tags,
    notes: data.notes,
    lastContacted: data.last_contacted,
  }
}

export const useLabelStore = create<LabelState>()(
  persist(
    (set, get) => ({
      labels: [],
      activeLabelId: null,
      isLoadingLabels: false,
      labelsError: null,

      artists: [],
      isLoadingArtists: false,
      releases: [],
      isLoadingReleases: false,
      tracksByRelease: {},
      tasks: [],
      isLoadingTasks: false,
      contacts: [],
      isLoadingContacts: false,

      // ----------------------------------------------------------------- labels

      loadLabels: async () => {
        set({ isLoadingLabels: true, labelsError: null })
        try {
          const labels = await api<LabelWithRole[]>('/api/label/labels')
          const { activeLabelId } = get()
          const stillValid = labels.some((l) => l.id === activeLabelId)
          set({
            labels,
            isLoadingLabels: false,
            activeLabelId: stillValid ? activeLabelId : (labels[0]?.id ?? null),
          })
        } catch (error) {
          log.error('Failed to load labels', error)
          set({ isLoadingLabels: false, labelsError: (error as Error).message })
        }
      },

      createLabel: async (name, slug, description) => {
        const label = await api<LabelWithRole>('/api/label/labels', {
          method: 'POST',
          body: JSON.stringify({ name, slug, description }),
        })
        set((s) => ({ labels: [...s.labels, label], activeLabelId: label.id }))
        return label
      },

      setActiveLabel: (labelId) => {
        set({
          activeLabelId: labelId,
          artists: [],
          releases: [],
          tracksByRelease: {},
          tasks: [],
          contacts: [],
        })
      },

      // ---------------------------------------------------------------- artists

      loadArtists: async (labelId) => {
        set({ isLoadingArtists: true })
        try {
          const artists = await api<ArtistRow[]>(`/api/label/artists?labelId=${labelId}`)
          set({ artists, isLoadingArtists: false })
        } catch (error) {
          log.error('Failed to load artists', error)
          set({ isLoadingArtists: false })
        }
      },

      createArtist: async (data) => {
        const artist = await api<ArtistRow>('/api/label/artists', {
          method: 'POST',
          body: JSON.stringify(artistBody(data)),
        })
        set((s) => ({ artists: [...s.artists, artist] }))
        return artist
      },

      updateArtist: async (id, data) => {
        const previous = get().artists
        set((s) => ({
          artists: s.artists.map((a) => (a.id === id ? { ...a, ...data } : a)),
        }))
        try {
          await api<ArtistRow>(`/api/label/artists/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(artistBody(data)),
          })
        } catch (error) {
          log.error('Failed to update artist', error)
          set({ artists: previous })
          throw error
        }
      },

      deleteArtist: async (id) => {
        const previous = get().artists
        set((s) => ({ artists: s.artists.filter((a) => a.id !== id) }))
        try {
          await api<null>(`/api/label/artists/${id}`, { method: 'DELETE' })
        } catch (error) {
          log.error('Failed to delete artist', error)
          set({ artists: previous })
          throw error
        }
      },

      // --------------------------------------------------------------- releases

      loadReleases: async (labelId) => {
        set({ isLoadingReleases: true })
        try {
          const releases = await api<ReleaseRow[]>(`/api/label/releases?labelId=${labelId}`)
          set({ releases, isLoadingReleases: false })
        } catch (error) {
          log.error('Failed to load releases', error)
          set({ isLoadingReleases: false })
        }
      },

      createRelease: async (data) => {
        const release = await api<ReleaseRow>('/api/label/releases', {
          method: 'POST',
          body: JSON.stringify(releaseBody(data)),
        })
        set((s) => ({ releases: [...s.releases, release] }))
        return release
      },

      updateRelease: async (id, data) => {
        const previous = get().releases
        set((s) => ({
          releases: s.releases.map((r) => (r.id === id ? { ...r, ...data } : r)),
        }))
        try {
          await api<ReleaseRow>(`/api/label/releases/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(releaseBody(data)),
          })
        } catch (error) {
          log.error('Failed to update release', error)
          set({ releases: previous })
          throw error
        }
      },

      deleteRelease: async (id) => {
        const previous = get().releases
        set((s) => ({ releases: s.releases.filter((r) => r.id !== id) }))
        try {
          await api<null>(`/api/label/releases/${id}`, { method: 'DELETE' })
        } catch (error) {
          log.error('Failed to delete release', error)
          set({ releases: previous })
          throw error
        }
      },

      // ----------------------------------------------------------------- tracks

      loadTracks: async (releaseId) => {
        try {
          const tracks = await api<TrackRow[]>(`/api/label/tracks?releaseId=${releaseId}`)
          set((s) => ({ tracksByRelease: { ...s.tracksByRelease, [releaseId]: tracks } }))
        } catch (error) {
          log.error('Failed to load tracks', error)
        }
      },

      createTrack: async (data) => {
        const track = await api<TrackRow>('/api/label/tracks', {
          method: 'POST',
          body: JSON.stringify(trackBody(data)),
        })
        set((s) => ({
          tracksByRelease: {
            ...s.tracksByRelease,
            [data.release_id]: [...(s.tracksByRelease[data.release_id] ?? []), track],
          },
        }))
        return track
      },

      updateTrack: async (id, releaseId, data) => {
        const previous = get().tracksByRelease
        set((s) => ({
          tracksByRelease: {
            ...s.tracksByRelease,
            [releaseId]: (s.tracksByRelease[releaseId] ?? []).map((t) =>
              t.id === id ? { ...t, ...data } : t
            ),
          },
        }))
        try {
          await api<TrackRow>(`/api/label/tracks/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(trackBody(data)),
          })
        } catch (error) {
          log.error('Failed to update track', error)
          set({ tracksByRelease: previous })
          throw error
        }
      },

      deleteTrack: async (id, releaseId) => {
        const previous = get().tracksByRelease
        set((s) => ({
          tracksByRelease: {
            ...s.tracksByRelease,
            [releaseId]: (s.tracksByRelease[releaseId] ?? []).filter((t) => t.id !== id),
          },
        }))
        try {
          await api<null>(`/api/label/tracks/${id}`, { method: 'DELETE' })
        } catch (error) {
          log.error('Failed to delete track', error)
          set({ tracksByRelease: previous })
          throw error
        }
      },

      // ------------------------------------------------------------------ tasks

      loadTasks: async (labelId) => {
        set({ isLoadingTasks: true })
        try {
          const tasks = await api<ReleaseTaskRow[]>(`/api/label/tasks?labelId=${labelId}`)
          set({ tasks, isLoadingTasks: false })
        } catch (error) {
          log.error('Failed to load tasks', error)
          set({ isLoadingTasks: false })
        }
      },

      createTask: async (data) => {
        const task = await api<ReleaseTaskRow>('/api/label/tasks', {
          method: 'POST',
          body: JSON.stringify({
            labelId: data.label_id,
            releaseId: data.release_id,
            title: data.title,
            description: data.description,
            dueDate: data.due_date,
          }),
        })
        set((s) => ({ tasks: [...s.tasks, task] }))
        return task
      },

      toggleTask: async (id, completed) => {
        const previous = get().tasks
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null }
              : t
          ),
        }))
        try {
          await api<ReleaseTaskRow>(`/api/label/tasks/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ completed }),
          })
        } catch (error) {
          log.error('Failed to toggle task', error)
          set({ tasks: previous })
          throw error
        }
      },

      deleteTask: async (id) => {
        const previous = get().tasks
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
        try {
          await api<null>(`/api/label/tasks/${id}`, { method: 'DELETE' })
        } catch (error) {
          log.error('Failed to delete task', error)
          set({ tasks: previous })
          throw error
        }
      },

      // --------------------------------------------------------------- contacts

      loadContacts: async (labelId) => {
        set({ isLoadingContacts: true })
        try {
          const contacts = await api<ContactRow[]>(`/api/label/contacts?labelId=${labelId}`)
          set({ contacts, isLoadingContacts: false })
        } catch (error) {
          log.error('Failed to load contacts', error)
          set({ isLoadingContacts: false })
        }
      },

      createContact: async (data) => {
        const contact = await api<ContactRow>('/api/label/contacts', {
          method: 'POST',
          body: JSON.stringify(contactBody(data)),
        })
        set((s) => ({ contacts: [...s.contacts, contact] }))
        return contact
      },

      updateContact: async (id, data) => {
        const previous = get().contacts
        set((s) => ({
          contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }))
        try {
          await api<ContactRow>(`/api/label/contacts/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(contactBody(data)),
          })
        } catch (error) {
          log.error('Failed to update contact', error)
          set({ contacts: previous })
          throw error
        }
      },

      deleteContact: async (id) => {
        const previous = get().contacts
        set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) }))
        try {
          await api<null>(`/api/label/contacts/${id}`, { method: 'DELETE' })
        } catch (error) {
          log.error('Failed to delete contact', error)
          set({ contacts: previous })
          throw error
        }
      },
    }),
    {
      name: 'totalaud-label-store',
      version: 1,
      partialize: (state) => ({ activeLabelId: state.activeLabelId }),
    }
  )
)

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const selectActiveLabel = (s: LabelState): LabelWithRole | null =>
  s.labels.find((l) => l.id === s.activeLabelId) ?? null

export const selectActiveRole = (s: LabelState): LabelRole | null =>
  selectActiveLabel(s)?.member_role ?? null

export const selectUpcomingReleases = (s: LabelState): ReleaseRow[] => {
  const today = new Date().toISOString().slice(0, 10)
  return s.releases
    .filter((r) => r.status !== 'released' && r.release_date && r.release_date >= today)
    .sort((a, b) => (a.release_date! < b.release_date! ? -1 : 1))
    .slice(0, 5)
}

export const selectOverdueTasks = (s: LabelState): ReleaseTaskRow[] => {
  const today = new Date().toISOString().slice(0, 10)
  return s.tasks
    .filter((t) => !t.completed && t.due_date && t.due_date < today)
    .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))
}

export const selectArtistById =
  (artistId: string) =>
  (s: LabelState): ArtistRow | null =>
    s.artists.find((a) => a.id === artistId) ?? null

export const selectReleaseById =
  (releaseId: string) =>
  (s: LabelState): ReleaseRow | null =>
    s.releases.find((r) => r.id === releaseId) ?? null

export const selectReleasesByArtist =
  (artistId: string) =>
  (s: LabelState): ReleaseRow[] =>
    s.releases.filter((r) => r.artist_id === artistId)
