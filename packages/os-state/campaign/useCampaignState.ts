/**
 * Campaign State Hook
 * Unified state management for DAW Timeline + Analogue Cards
 * Used across all OS personalities
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createTimelineSlice } from './slices/timelineSlice'
import type { TimelineSlice } from './slices/timelineSlice'
import { createCardSlice } from './slices/cardSlice'
import type { CardSliceActions } from './slices/cardSlice'
import { createLoopSlice } from './slices/loopSlice'
import type { LoopSliceActions } from './slices/loopSlice'
import { createMetaSlice } from './slices/metaSlice'
import type { MetaSlice } from './slices/metaSlice'

// Re-export for convenience
export type {
  TimelineClip,
  TimelineTrack,
  AnalogueCard,
  CardType,
  ThemeId,
  AgentSuggestion,
  OSActivity,
  OSMoodRing,
} from './campaign.types'

export type CampaignState = TimelineSlice & CardSliceActions & LoopSliceActions & MetaSlice

/**
 * Main campaign state store
 * Combines timeline, cards, and metadata into a single unified state
 */
export const useCampaignState = create<CampaignState>()(
  persist(
    (...args) => ({
      ...createTimelineSlice(...args),
      ...createCardSlice(...args),
      ...createLoopSlice(...args),
      ...createMetaSlice(...args),
    }),
    {
      name: 'totalaud-campaign-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        meta: state.meta,
        timeline: {
          tracks: state.timeline.tracks,
          clips: state.timeline.clips,
          zoom: state.timeline.zoom,
          snapToGrid: state.timeline.snapToGrid,
          gridSize: state.timeline.gridSize,
          duration: state.timeline.duration,
        },
        cards: state.cards,
        loops: state.loops,
      }),
    }
  )
)

/**
 * Helper hook to get timeline state and actions
 */
export const useTimeline = () => {
  const timeline = useCampaignState((state) => state.timeline)
  const actions = useCampaignState((state) => ({
    addTrack: state.addTrack,
    removeTrack: state.removeTrack,
    updateTrack: state.updateTrack,
    reorderTracks: state.reorderTracks,
    addClip: state.addClip,
    removeClip: state.removeClip,
    updateClip: state.updateClip,
    moveClip: state.moveClip,
    resizeClip: state.resizeClip,
    setPlayheadPosition: state.setPlayheadPosition,
    setPlaying: state.setPlaying,
    togglePlayback: state.togglePlayback,
    setZoom: state.setZoom,
    setScrollOffset: state.setScrollOffset,
    toggleSnapToGrid: state.toggleSnapToGrid,
    setGridSize: state.setGridSize,
    selectClips: state.selectClips,
    selectTracks: state.selectTracks,
    clearSelection: state.clearSelection,
  }))

  return { timeline, ...actions }
}

/**
 * Helper hook to get card state and actions
 */
export const useCards = () => {
  const cards = useCampaignState((state) => state.cards)
  const actions = useCampaignState((state) => ({
    addCard: state.addCard,
    removeCard: state.removeCard,
    updateCard: state.updateCard,
    linkCardToClip: state.linkCardToClip,
    unlinkCard: state.unlinkCard,
    selectCards: state.selectCards,
    clearCardSelection: state.clearCardSelection,
    filterCardsByType: state.filterCardsByType,
    sortCards: state.sortCards,
    getCardsByType: state.getCardsByType,
    getCardsForClip: state.getCardsForClip,
  }))

  return { cards, ...actions }
}

/**
 * Helper hook to get loop state and actions
 */
export const useLoops = () => {
  const loops = useCampaignState((state) => state.loops)
  const actions = useCampaignState((state) => ({
    setLoops: state.setLoops,
    addLoop: state.addLoop,
    updateLoop: state.updateLoop,
    removeLoop: state.removeLoop,
    addLoopEvent: state.addLoopEvent,
    clearLoopEvents: state.clearLoopEvents,
    addLoopSuggestion: state.addLoopSuggestion,
    updateLoopSuggestion: state.updateLoopSuggestion,
    removeLoopSuggestion: state.removeLoopSuggestion,
    setLoopMetrics: state.setLoopMetrics,
    updateLoopHealthScore: state.updateLoopHealthScore,
    getLoop: state.getLoop,
    getLoopsByAgent: state.getLoopsByAgent,
    getActiveLoops: state.getActiveLoops,
  }))

  return { loops, ...actions }
}

/**
 * Helper hook to get campaign metadata
 */
export const useCampaignMeta = () => {
  const meta = useCampaignState((state) => state.meta)
  const isDirty = useCampaignState((state) => state.isDirty)
  const lastSavedAt = useCampaignState((state) => state.lastSavedAt)
  const actions = useCampaignState((state) => ({
    updateCampaignMeta: state.updateCampaignMeta,
    setTheme: state.setTheme,
    markClean: state.markClean,
    markDirty: state.markDirty,
  }))

  return { meta, isDirty, lastSavedAt, ...actions }
}
