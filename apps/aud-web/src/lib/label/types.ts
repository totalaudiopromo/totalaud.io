/**
 * Label OS — hand-written row and insert types.
 *
 * These tables are not yet in the generated Database types (regeneration
 * requires local Supabase). All queries go through lib/label/db.ts, the
 * single cast boundary. Once types are regenerated, this file becomes the
 * domain-type layer only.
 */

export type LabelRole = 'owner' | 'manager' | 'member'
export type ReleaseStatus = 'idea' | 'in_progress' | 'scheduled' | 'released'
export type ReleaseType = 'single' | 'ep' | 'album'
export type TrackStatus = 'draft' | 'mixed' | 'mastered' | 'delivered'
export type ContactType = 'radio' | 'playlist' | 'blog' | 'press' | 'dsp'

export const RELEASE_STATUSES: ReleaseStatus[] = ['idea', 'in_progress', 'scheduled', 'released']
export const RELEASE_TYPES: ReleaseType[] = ['single', 'ep', 'album']
export const TRACK_STATUSES: TrackStatus[] = ['draft', 'mixed', 'mastered', 'delivered']
export const CONTACT_TYPES: ContactType[] = ['radio', 'playlist', 'blog', 'press', 'dsp']

export const RELEASE_STATUS_LABELS: Record<ReleaseStatus, string> = {
  idea: 'Idea',
  in_progress: 'In progress',
  scheduled: 'Scheduled',
  released: 'Released',
}

export const RELEASE_TYPE_LABELS: Record<ReleaseType, string> = {
  single: 'Single',
  ep: 'EP',
  album: 'Album',
}

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  radio: 'Radio',
  playlist: 'Playlist',
  blog: 'Blog',
  press: 'Press',
  dsp: 'DSP',
}

// ---------------------------------------------------------------------------
// Row types (snake_case, mirror the database)
// ---------------------------------------------------------------------------

export interface LabelRow {
  id: string
  name: string
  slug: string
  description: string | null
  website: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface LabelMemberRow {
  id: string
  label_id: string
  user_id: string
  role: LabelRole
  created_at: string
  updated_at: string
}

export interface ArtistRow {
  id: string
  label_id: string
  name: string
  bio: string | null
  genres: string[]
  image_url: string | null
  website: string | null
  spotify_url: string | null
  social_links: Record<string, string>
  created_at: string
  updated_at: string
}

export interface ReleaseRow {
  id: string
  label_id: string
  artist_id: string
  title: string
  type: ReleaseType
  status: ReleaseStatus
  release_date: string | null
  upc: string | null
  artwork_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface TrackRow {
  id: string
  label_id: string
  release_id: string
  title: string
  track_number: number | null
  duration_seconds: number | null
  isrc: string | null
  version: string | null
  status: TrackStatus
  created_at: string
  updated_at: string
}

export interface ReleaseTaskRow {
  id: string
  label_id: string
  release_id: string
  title: string
  description: string | null
  due_date: string | null
  completed: boolean
  completed_at: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export interface ContactRow {
  id: string
  label_id: string
  name: string
  outlet: string | null
  type: ContactType | null
  email: string | null
  tags: string[]
  notes: string | null
  last_contacted: string | null
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Insert types (what the client sends; ids/timestamps are server-generated)
// ---------------------------------------------------------------------------

export interface ArtistInsert {
  label_id: string
  name: string
  bio?: string | null
  genres?: string[]
  image_url?: string | null
  website?: string | null
  spotify_url?: string | null
  social_links?: Record<string, string>
}

export interface ReleaseInsert {
  label_id: string
  artist_id: string
  title: string
  type: ReleaseType
  status?: ReleaseStatus
  release_date?: string | null
  upc?: string | null
  artwork_url?: string | null
  notes?: string | null
}

export interface TrackInsert {
  label_id: string
  release_id: string
  title: string
  track_number?: number | null
  duration_seconds?: number | null
  isrc?: string | null
  version?: string | null
  status?: TrackStatus
}

export interface TaskInsert {
  label_id: string
  release_id: string
  title: string
  description?: string | null
  due_date?: string | null
  assigned_to?: string | null
}

export interface ContactInsert {
  label_id: string
  name: string
  outlet?: string | null
  type?: ContactType | null
  email?: string | null
  tags?: string[]
  notes?: string | null
  last_contacted?: string | null
}

/** Label row joined with the current user's membership role. */
export interface LabelWithRole extends LabelRow {
  member_role: LabelRole
}
