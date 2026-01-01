/**
 * Ideas Store Types
 *
 * Type definitions for the Ideas Mode store.
 * Separated from implementation for testability and reuse.
 */

import type { IdeaTag, SortMode, ViewMode, IdeaCard } from '@/types/ideas'
import type { SyncState } from '@/types/sync'

// ============================================================================
// Domain Types
// ============================================================================

export type { IdeaTag, SortMode, ViewMode, IdeaCard } from '@/types/ideas'

// ============================================================================
// State Interface (Pure Data)
// ============================================================================

export interface IdeasStateData {
  /** All idea cards */
  cards: IdeaCard[]
  /** Current tag filter */
  filter: IdeaTag | null
  /** Currently selected card ID */
  selectedCardId: string | null
  /** Search query string */
  searchQuery: string
  /** Current sort mode */
  sortMode: SortMode
  /** Current view mode (canvas or list) */
  viewMode: ViewMode
  /** Whether starter ideas have been shown */
  hasSeenStarters: boolean
}

// ============================================================================
// Sync State Interface
// ============================================================================

export interface IdeasSyncState extends SyncState {}

// ============================================================================
// Actions Interface
// ============================================================================

export interface IdeasActions {
  // CRUD
  addCard: (
    content: string,
    tag: IdeaTag,
    position?: { x: number; y: number },
    seed?: number
  ) => Promise<string>
  updateCard: (id: string, updates: Partial<Pick<IdeaCard, 'content' | 'tag'>>) => Promise<void>
  deleteCard: (id: string) => Promise<void>
  moveCard: (id: string, position: { x: number; y: number }) => Promise<void>
  clearAllCards: () => Promise<void>

  // UI State
  setFilter: (tag: IdeaTag | null) => void
  selectCard: (id: string | null) => void
  setSearchQuery: (query: string) => void
  setSortMode: (mode: SortMode) => void
  setViewMode: (mode: ViewMode) => void

  // Starter Ideas
  initStarterIdeas: () => void
  dismissStarterIdeas: () => Promise<void>

  // Sync
  loadFromSupabase: () => Promise<void>
  syncToSupabase: () => Promise<void>
}

// ============================================================================
// Complete Store Interface
// ============================================================================

export type IdeasState = IdeasStateData & IdeasSyncState & IdeasActions

// ============================================================================
// Initial State Factory
// ============================================================================

export const createInitialIdeasState = (): IdeasStateData & IdeasSyncState => ({
  cards: [],
  filter: null,
  selectedCardId: null,
  searchQuery: '',
  sortMode: 'newest',
  viewMode: 'canvas',
  hasSeenStarters: false,
  isLoading: false,
  isSyncing: false,
  syncError: null,
  lastSyncedAt: null,
})
