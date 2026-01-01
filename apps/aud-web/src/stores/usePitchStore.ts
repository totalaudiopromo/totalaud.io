/**
 * Pitch Mode Store
 *
 * Phase 10: Data Persistence
 *
 * Zustand store for pitch drafts with:
 * - Supabase sync for authenticated users
 * - localStorage fallback for unauthenticated users
 * - Local AI Coach (Claude) for section-level improvements
 * - TAP Pitch service for full pitch generation from metadata
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CoachAction,
  CoachingMessage,
  CoachingMode,
  CoachingPhase,
  PitchDraft,
  PitchSection,
  PitchType,
  TAPGenerationStatus,
  TAPTone,
  TAPPitchRequest,
  TAPPitchResult,
} from '@/types/pitch'
import { DEFAULT_SECTIONS } from './pitch/constants'
import { createPitchActions } from './pitch/actions'
import type { PitchState } from './pitch/state'

export type {
  CoachAction,
  CoachingMessage,
  CoachingMode,
  CoachingPhase,
  PitchDraft,
  PitchSection,
  PitchType,
  TAPGenerationStatus,
  TAPTone,
  TAPPitchRequest,
  TAPPitchResult,
} from '@/types/pitch'

const initialState: Omit<PitchState, keyof ReturnType<typeof createPitchActions>> = {
  currentType: null,
  sections: DEFAULT_SECTIONS,
  isDirty: false,
  drafts: [],
  currentDraftId: null,
  isCoachOpen: false,
  isCoachLoading: false,
  coachResponse: null,
  coachError: null,
  selectedSectionId: null,
  coachingSession: [],
  coachingMode: null,
  coachingPhase: null,
  isSessionActive: false,
  queuedSessionMessages: [],
  tapGenerationStatus: 'idle',
  tapPitchResult: null,
  tapError: null,
  isTAPModalOpen: false,
  isLoading: false,
  isSyncing: false,
  syncError: null,
  lastSyncedAt: null,
}

export const usePitchStore = create<PitchState>()(
  persist(
    (set, get) => ({
      ...initialState,
      ...createPitchActions(set, get),
    }),
    {
      name: 'totalaud-pitch-store',
      version: 3,
    }
  )
)

export {
  selectCoachingSession,
  selectCurrentSection,
  selectDraftCount,
  selectHasContent,
  selectSyncStatus,
  selectTAPStatus,
} from './pitch/selectors'

export { buildPitchMarkdown, buildPitchPlainText } from './pitch/exporters'
