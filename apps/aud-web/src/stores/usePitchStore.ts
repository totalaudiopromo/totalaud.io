import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  PitchType,
  CoachAction,
  TAPTone,
  TAPGenerationStatus,
  CoachingMode,
  CoachingPhase,
  CoachingMessage,
  TAPPitchRequest,
  TAPPitchResult,
  PitchSection,
  PitchDraft,
} from './pitch/types'
import { createDraftsSlice, DraftsSlice } from './pitch/draftsSlice'
import { createCoachSlice, CoachSlice } from './pitch/coachSlice'
import { createTAPSlice, TAPSlice } from './pitch/tapSlice'

// Re-export types for backward compatibility
export type {
  PitchType,
  CoachAction,
  TAPTone,
  TAPGenerationStatus,
  CoachingMode,
  CoachingPhase,
  CoachingMessage,
  TAPPitchRequest,
  TAPPitchResult,
  PitchSection,
  PitchDraft,
}

export interface PitchState extends DraftsSlice, CoachSlice, TAPSlice {}

/**
 * Pitch Mode Store
 *
 * Refactored in Feb 2026 into modular slices for better maintainability.
 * Combines Draft management, AI Coaching, and TAP Generation.
 */
export const usePitchStore = create<PitchState>()(
  persist(
    (...a) => ({
      ...createDraftsSlice(...a),
      ...createCoachSlice(...a),
      ...createTAPSlice(...a),
    }),
    {
      name: 'totalaud-pitch-store',
      version: 3,
    }
  )
)

// ============ Selectors (Maintained for UI compatibility) ============

export const selectCurrentSection = (state: PitchState): PitchSection | null => {
  if (!state.selectedSectionId) return null
  return state.sections.find((s) => s.id === state.selectedSectionId) ?? null
}

export const selectHasContent = (state: PitchState): boolean => {
  return state.sections.some((s) => s.content.trim().length > 0)
}

export const selectDraftCount = (state: PitchState): number => {
  return state.drafts.length
}

export const selectTAPStatus = (state: PitchState) => ({
  status: state.tapGenerationStatus,
  result: state.tapPitchResult,
  error: state.tapError,
  isModalOpen: state.isTAPModalOpen,
})

export const selectSyncStatus = (state: PitchState) => ({
  isLoading: state.isLoading,
  isSyncing: state.isSyncing,
  error: state.syncError,
  lastSyncedAt: state.lastSyncedAt,
})

export const selectCoachingSession = (state: PitchState) => ({
  session: state.coachingSession,
  mode: state.coachingMode,
  phase: state.coachingPhase,
  isActive: state.isSessionActive,
  isLoading: state.isCoachLoading,
  error: state.coachError,
})

// ============ Export Helpers ============

export function buildPitchMarkdown(sections: PitchSection[], type: PitchType): string {
  const typeLabels: Record<PitchType, string> = {
    radio: 'Radio Pitch',
    press: 'Press Release',
    playlist: 'Playlist Pitch',
    custom: 'Custom Pitch',
  }

  const lines = [
    `# ${typeLabels[type]}`,
    '',
    `*Generated on ${new Date().toLocaleDateString('en-GB')}*`,
    '',
  ]

  for (const section of sections) {
    if (section.content.trim()) {
      lines.push(`## ${section.title}`, '', section.content.trim(), '')
    }
  }

  return lines.join('\n')
}

export function buildPitchPlainText(sections: PitchSection[], type: PitchType): string {
  const typeLabels: Record<PitchType, string> = {
    radio: 'RADIO PITCH',
    press: 'PRESS RELEASE',
    playlist: 'PLAYLIST PITCH',
    custom: 'CUSTOM PITCH',
  }

  const lines = [typeLabels[type], '='.repeat(typeLabels[type].length), '']

  for (const section of sections) {
    if (section.content.trim()) {
      lines.push(
        `${section.title.toUpperCase()}`,
        '-'.repeat(section.title.length),
        section.content.trim(),
        ''
      )
    }
  }

  return lines.join('\n')
}
