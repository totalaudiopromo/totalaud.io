import type {
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

export interface PitchState {
  currentType: PitchType | null
  sections: PitchSection[]
  isDirty: boolean

  drafts: PitchDraft[]
  currentDraftId: string | null

  isCoachOpen: boolean
  isCoachLoading: boolean
  coachResponse: string | null
  coachError: string | null
  selectedSectionId: string | null

  coachingSession: CoachingMessage[]
  coachingMode: CoachingMode | null
  coachingPhase: CoachingPhase | null
  isSessionActive: boolean
  queuedSessionMessages: Array<{ content: string; sectionId?: string }>

  tapGenerationStatus: TAPGenerationStatus
  tapPitchResult: TAPPitchResult | null
  tapError: string | null
  isTAPModalOpen: boolean

  isLoading: boolean
  isSyncing: boolean
  syncError: string | null
  lastSyncedAt: string | null

  selectType: (type: PitchType) => void
  resetPitch: () => void

  updateSection: (id: string, content: string) => void
  selectSection: (id: string | null) => void

  toggleCoach: () => void
  openCoach: () => void
  closeCoach: () => void
  setCoachLoading: (loading: boolean) => void
  setCoachResponse: (response: string | null) => void
  setCoachError: (error: string | null) => void
  applyCoachSuggestion: (sectionId: string, content: string) => void

  startCoachingSession: (mode: CoachingMode) => void
  endCoachingSession: () => void
  addCoachingMessage: (message: Omit<CoachingMessage, 'id' | 'timestamp'>) => void
  setCoachingPhase: (phase: CoachingPhase) => void
  sendSessionMessage: (content: string, sectionId?: string) => Promise<void>
  clearCoachingSession: () => void

  openTAPModal: () => void
  closeTAPModal: () => void
  generateWithTAP: (request: TAPPitchRequest) => Promise<void>
  applyTAPResult: () => void
  clearTAPResult: () => void

  saveDraft: (name: string) => Promise<string>
  loadDraft: (id: string) => void
  deleteDraft: (id: string) => Promise<void>
  renameDraft: (id: string, name: string) => Promise<void>

  loadFromSupabase: () => Promise<void>
  syncToSupabase: () => Promise<void>
}
