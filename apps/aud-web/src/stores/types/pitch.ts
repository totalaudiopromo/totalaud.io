/**
 * Pitch Store Types
 *
 * Type definitions for the Pitch Mode store.
 * Includes coaching, TAP integration, and draft management.
 */

import type {
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
} from '@/types/pitch'
import type { SyncState } from '@/types/sync'

// ============================================================================
// Domain Types
// ============================================================================

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
} from '@/types/pitch'

// ============================================================================
// State Interface (Pure Data)
// ============================================================================

export interface PitchStateData {
  /** Current pitch type being edited */
  currentType: PitchType | null
  /** Current sections with content */
  sections: PitchSection[]
  /** Whether there are unsaved changes */
  isDirty: boolean
  /** All saved drafts */
  drafts: PitchDraft[]
  /** ID of currently loaded draft */
  currentDraftId: string | null
  /** Currently selected section ID */
  selectedSectionId: string | null
}

// ============================================================================
// Coach State Interface
// ============================================================================

export interface PitchCoachState {
  /** Whether legacy coach panel is open */
  isCoachOpen: boolean
  /** Whether coach is loading */
  isCoachLoading: boolean
  /** Legacy coach response */
  coachResponse: string | null
  /** Coach error message */
  coachError: string | null
}

// ============================================================================
// Intelligence Navigator State
// ============================================================================

export interface PitchNavigatorState {
  /** Current coaching session messages */
  coachingSession: CoachingMessage[]
  /** Queued coaching messages awaiting a response */
  queuedSessionMessages: Array<{ content: string; sectionId?: string }>
  /** Current coaching mode */
  coachingMode: CoachingMode | null
  /** Current coaching phase */
  coachingPhase: CoachingPhase | null
  /** Whether a session is active */
  isSessionActive: boolean
}

// ============================================================================
// TAP Integration State
// ============================================================================

export interface PitchTAPState {
  /** TAP generation status */
  tapGenerationStatus: TAPGenerationStatus
  /** TAP generation result */
  tapPitchResult: TAPPitchResult | null
  /** TAP error message */
  tapError: string | null
  /** Whether TAP modal is open */
  isTAPModalOpen: boolean
}

// ============================================================================
// Sync State Interface
// ============================================================================

export interface PitchSyncState extends SyncState {}

// ============================================================================
// Actions Interface
// ============================================================================

export interface PitchActions {
  // Type Selection
  selectType: (type: PitchType) => void
  resetPitch: () => void

  // Section Editing
  updateSection: (id: string, content: string) => void
  selectSection: (id: string | null) => void

  // Legacy Coach
  toggleCoach: () => void
  openCoach: () => void
  closeCoach: () => void
  setCoachLoading: (loading: boolean) => void
  setCoachResponse: (response: string | null) => void
  setCoachError: (error: string | null) => void
  applyCoachSuggestion: (sectionId: string, content: string) => void

  // Intelligence Navigator
  startCoachingSession: (mode: CoachingMode) => void
  endCoachingSession: () => void
  addCoachingMessage: (message: Omit<CoachingMessage, 'id' | 'timestamp'>) => void
  setCoachingPhase: (phase: CoachingPhase) => void
  sendSessionMessage: (content: string, sectionId?: string) => Promise<void>
  clearCoachingSession: () => void

  // TAP Integration
  openTAPModal: () => void
  closeTAPModal: () => void
  generateWithTAP: (request: TAPPitchRequest) => Promise<void>
  applyTAPResult: () => void
  clearTAPResult: () => void

  // Draft Management
  saveDraft: (name: string) => Promise<string>
  loadDraft: (id: string) => void
  deleteDraft: (id: string) => Promise<void>
  renameDraft: (id: string, name: string) => Promise<void>

  // Sync
  loadFromSupabase: () => Promise<void>
  syncToSupabase: () => Promise<void>
}

// ============================================================================
// Complete Store Interface
// ============================================================================

export type PitchState = PitchStateData &
  PitchCoachState &
  PitchNavigatorState &
  PitchTAPState &
  PitchSyncState &
  PitchActions

// ============================================================================
// Initial State Factory
// ============================================================================

export const createInitialPitchState = (): PitchStateData &
  PitchCoachState &
  PitchNavigatorState &
  PitchTAPState &
  PitchSyncState => ({
  currentType: null,
  sections: [],
  isDirty: false,
  drafts: [],
  currentDraftId: null,
  selectedSectionId: null,
  isCoachOpen: false,
  isCoachLoading: false,
  coachResponse: null,
  coachError: null,
  coachingSession: [],
  queuedSessionMessages: [],
  coachingMode: null,
  coachingPhase: null,
  isSessionActive: false,
  tapGenerationStatus: 'idle',
  tapPitchResult: null,
  tapError: null,
  isTAPModalOpen: false,
  isLoading: false,
  isSyncing: false,
  syncError: null,
  lastSyncedAt: null,
})
