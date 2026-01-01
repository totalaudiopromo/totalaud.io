import type { PitchSection } from '@/types/pitch'
import type { PitchState } from './state'

export const selectCurrentSection = (state: PitchState): PitchSection | null => {
  if (!state.selectedSectionId) return null
  return state.sections.find((section) => section.id === state.selectedSectionId) ?? null
}

export const selectHasContent = (state: PitchState): boolean => {
  return state.sections.some((section) => section.content.trim().length > 0)
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
