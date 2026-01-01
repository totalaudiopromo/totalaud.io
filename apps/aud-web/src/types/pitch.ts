/**
 * Pitch Domain Types
 */

export type PitchType = 'radio' | 'press' | 'playlist' | 'custom'
export type CoachAction = 'improve' | 'suggest' | 'rewrite'
export type TAPTone = 'casual' | 'professional' | 'enthusiastic'
export type TAPGenerationStatus = 'idle' | 'loading' | 'success' | 'error'

// Intelligence Navigator types
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
