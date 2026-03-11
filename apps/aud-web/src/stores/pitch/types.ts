/**
 * Pitch Store Types & Constants
 *
 * All shared types for the subdivided pitch store slices.
 */

export type PitchType = 'radio' | 'press' | 'playlist' | 'custom'
export type CoachAction = 'improve' | 'suggest' | 'rewrite'
export type TAPTone = 'casual' | 'professional' | 'enthusiastic'
export type TAPGenerationStatus = 'idle' | 'loading' | 'success' | 'error'

// Intelligence Navigator types (Phase 1.5)
export type CoachingMode = 'quick' | 'guided'
export type CoachingPhase = 'foundation' | 'refinement' | 'optimisation'

export interface CoachingMessage {
  id: string
  role: 'user' | 'coach'
  content: string
  timestamp: string
  sectionId?: string
  suggestions?: string[]
}

export interface TAPPitchRequest {
  artistName: string
  trackTitle: string
  genre?: string
  trackLink?: string
  releaseDate?: string
  keyHook: string
  tone?: TAPTone
}

export interface TAPPitchResult {
  subject?: string
  body: string
  signature?: string
  confidence?: 'High' | 'Medium' | 'Low'
  generatedAt: string
}

export interface PitchSection {
  id: string
  title: string
  content: string
  placeholder: string
}

export interface PitchDraft {
  id: string
  name: string
  type: PitchType
  sections: PitchSection[]
  createdAt: string
  updatedAt: string
}

export const DEFAULT_SECTIONS: PitchSection[] = [
  {
    id: 'hook',
    title: 'The Hook',
    content: '',
    placeholder:
      'Start with something memorable — a striking fact, an emotional moment, or a bold statement about your music.',
  },
  {
    id: 'story',
    title: 'Your Story',
    content: '',
    placeholder:
      'Share your journey, describe your sound, and include any proof points (streams, radio plays, press coverage).',
  },
  {
    id: 'ask',
    title: 'The Ask',
    content: '',
    placeholder:
      'Be specific about what you want: airplay, review, playlist inclusion. Make it easy to say yes.',
  },
]

// Supabase sync interface
export interface DatabasePitchDraft {
  id: string
  user_id: string
  name: string
  pitch_type: string
  sections: unknown
  created_at: string
  updated_at: string
}
