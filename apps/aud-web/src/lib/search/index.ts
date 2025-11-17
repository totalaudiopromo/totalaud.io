/**
 * Phase 34: Global Search Engine - Public API
 *
 * Unified export for cross-app search functionality.
 */

// Main engine
export { search, searchFlat } from './engine'
export type { SearchOptions, SearchResponse } from './engine'

// Scoring utilities
export {
  fuzzyMatch,
  scoreResult,
  applyRecencyBonus,
  applyTypeWeighting,
  calculateFinalScore,
} from './scoring'

// Normalisation utilities
export { normaliseText, normaliseQuery, extractKeywords } from './normalise'

// Semantic utilities
export { calculateSemanticBonus, extractQueryThemes, matchThemes } from './semantic'

// Source types
export type { SearchResult } from './sources/notes'

// Source aggregators (for advanced use cases)
export { searchNotes } from './sources/notes'
export { searchCards } from './sources/cards'
export { searchTimeline } from './sources/timeline'
export { searchJournal } from './sources/journal'
export { searchCoach } from './sources/coach'
export { searchScenes } from './sources/scenes'
export { searchMemory } from './sources/memory'
export { searchRhythm } from './sources/rhythm'
export { searchWorkspaces } from './sources/workspaces'
export { searchTAP } from './sources/tap'
