/**
 * Label OS — Zod schemas for API request validation.
 * Every string field carries a max length; dates are ISO yyyy-mm-dd.
 */

import { z } from 'zod'

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected yyyy-mm-dd')
const uuid = z.string().uuid()

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const createLabelSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only'),
  description: z.string().max(500).optional(),
})

export const updateLabelSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).nullable().optional(),
  website: z.string().url().max(300).nullable().optional(),
})

// ---------------------------------------------------------------------------
// Artists
// ---------------------------------------------------------------------------

export const createArtistSchema = z.object({
  labelId: uuid,
  name: z.string().min(1).max(120),
  bio: z.string().max(2000).optional(),
  genres: z.array(z.string().max(40)).max(10).optional(),
  imageUrl: z.string().url().max(500).nullable().optional(),
  website: z.string().url().max(300).nullable().optional(),
  spotifyUrl: z.string().url().max(300).nullable().optional(),
})

export const updateArtistSchema = createArtistSchema.omit({ labelId: true }).partial()

// ---------------------------------------------------------------------------
// Releases
// ---------------------------------------------------------------------------

export const createReleaseSchema = z.object({
  labelId: uuid,
  artistId: uuid,
  title: z.string().min(1).max(200),
  type: z.enum(['single', 'ep', 'album']),
  status: z.enum(['idea', 'in_progress', 'scheduled', 'released']).optional(),
  releaseDate: isoDate.nullable().optional(),
  upc: z.string().max(20).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
})

export const updateReleaseSchema = createReleaseSchema
  .omit({ labelId: true, artistId: true })
  .partial()

// ---------------------------------------------------------------------------
// Tracks
// ---------------------------------------------------------------------------

export const createTrackSchema = z.object({
  labelId: uuid,
  releaseId: uuid,
  title: z.string().min(1).max(200),
  trackNumber: z.number().int().min(1).max(999).nullable().optional(),
  durationSeconds: z.number().int().min(0).max(36000).nullable().optional(),
  isrc: z.string().max(15).nullable().optional(),
  version: z.string().max(80).nullable().optional(),
  status: z.enum(['draft', 'mixed', 'mastered', 'delivered']).optional(),
})

export const updateTrackSchema = createTrackSchema
  .omit({ labelId: true, releaseId: true })
  .partial()

// ---------------------------------------------------------------------------
// Release tasks
// ---------------------------------------------------------------------------

export const createTaskSchema = z.object({
  labelId: uuid,
  releaseId: uuid,
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  dueDate: isoDate.nullable().optional(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  dueDate: isoDate.nullable().optional(),
  completed: z.boolean().optional(),
})

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export const createContactSchema = z.object({
  labelId: uuid,
  name: z.string().min(1).max(120),
  outlet: z.string().max(160).nullable().optional(),
  type: z.enum(['radio', 'playlist', 'blog', 'press', 'dsp']).nullable().optional(),
  email: z.string().email().max(254).nullable().optional(),
  tags: z.array(z.string().max(40)).max(15).optional(),
  notes: z.string().max(5000).nullable().optional(),
  lastContacted: isoDate.nullable().optional(),
})

export const updateContactSchema = createContactSchema.omit({ labelId: true }).partial()
