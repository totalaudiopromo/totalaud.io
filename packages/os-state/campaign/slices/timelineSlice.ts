/**
 * Timeline Slice
 * Manages timeline state, tracks, clips, and playback
 */

import type { StateCreator } from 'zustand'
import type { TimelineState, TimelineClip, TimelineTrack } from '../campaign.types'
import type { CampaignState } from '../useCampaignState'

export interface TimelineSlice {
  timeline: TimelineState
  // Track operations
  addTrack: (name: string, colour?: string) => void
  removeTrack: (trackId: string) => void
  updateTrack: (trackId: string, updates: Partial<TimelineTrack>) => void
  reorderTracks: (trackIds: string[]) => void
  // Clip operations
  addClip: (clip: Omit<TimelineClip, 'id' | 'createdAt' | 'updatedAt'>) => void
  removeClip: (clipId: string) => void
  updateClip: (clipId: string, updates: Partial<TimelineClip>) => void
  moveClip: (clipId: string, trackId: string, startTime: number) => void
  resizeClip: (clipId: string, duration: number) => void
  // Playback
  setPlayheadPosition: (position: number) => void
  setPlaying: (isPlaying: boolean) => void
  togglePlayback: () => void
  // View controls
  setZoom: (zoom: number) => void
  setScrollOffset: (offset: number) => void
  toggleSnapToGrid: () => void
  setGridSize: (size: number) => void
  // Selection
  selectClips: (clipIds: string[]) => void
  selectTracks: (trackIds: string[]) => void
  clearSelection: () => void
  // Card linking
  linkCardToClip: (clipId: string, cardId: string) => void
  unlinkCardFromClip: (clipId: string, cardId: string) => void
}

const TRACK_COLOURS = [
  '#3AA9BE', // Cyan
  '#51CF66', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#EC4899', // Pink
  '#14B8A6', // Teal
]

export const createTimelineSlice: StateCreator<
  CampaignState,
  [],
  [],
  TimelineSlice
> = (set, get) => ({
  timeline: {
    tracks: [],
    clips: [],
    playheadPosition: 0,
    zoom: 50, // 50px per second
    scrollOffset: 0,
    snapToGrid: true,
    gridSize: 1, // 1 second grid
    isPlaying: false,
    duration: 300, // 5 minutes default
    selectedClipIds: [],
    selectedTrackIds: [],
  },

  // Track operations
  addTrack: (name: string, colour?: string) => {
    const tracks = get().timeline.tracks
    const trackColour = colour || TRACK_COLOURS[tracks.length % TRACK_COLOURS.length]

    set((state) => ({
      timeline: {
        ...state.timeline,
        tracks: [
          ...state.timeline.tracks,
          {
            id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            colour: trackColour,
            height: 60,
            muted: false,
            solo: false,
            order: tracks.length,
          },
        ],
      },
      isDirty: true,
    }))
  },

  removeTrack: (trackId: string) => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        tracks: state.timeline.tracks.filter((t) => t.id !== trackId),
        clips: state.timeline.clips.filter((c) => c.trackId !== trackId),
        selectedTrackIds: state.timeline.selectedTrackIds.filter((id) => id !== trackId),
      },
      isDirty: true,
    }))
  },

  updateTrack: (trackId: string, updates: Partial<TimelineTrack>) => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        tracks: state.timeline.tracks.map((track) =>
          track.id === trackId ? { ...track, ...updates } : track
        ),
      },
      isDirty: true,
    }))
  },

  reorderTracks: (trackIds: string[]) => {
    set((state) => {
      const trackMap = new Map(state.timeline.tracks.map((t) => [t.id, t]))
      const reorderedTracks = trackIds
        .map((id) => trackMap.get(id))
        .filter(Boolean)
        .map((track, index) => ({ ...track!, order: index }))

      return {
        timeline: { ...state.timeline, tracks: reorderedTracks },
        isDirty: true,
      }
    })
  },

  // Clip operations
  addClip: (clip: Omit<TimelineClip, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date()
    set((state) => ({
      timeline: {
        ...state.timeline,
        clips: [
          ...state.timeline.clips,
          {
            ...clip,
            id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            cardLinks: clip.cardLinks || [],
            createdAt: now,
            updatedAt: now,
          },
        ],
      },
      isDirty: true,
    }))
  },

  removeClip: (clipId: string) => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        clips: state.timeline.clips.filter((c) => c.id !== clipId),
        selectedClipIds: state.timeline.selectedClipIds.filter((id) => id !== clipId),
      },
      isDirty: true,
    }))
  },

  updateClip: (clipId: string, updates: Partial<TimelineClip>) => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        clips: state.timeline.clips.map((clip) =>
          clip.id === clipId
            ? { ...clip, ...updates, updatedAt: new Date() }
            : clip
        ),
      },
      isDirty: true,
    }))
  },

  moveClip: (clipId: string, trackId: string, startTime: number) => {
    const snapToGrid = get().timeline.snapToGrid
    const gridSize = get().timeline.gridSize
    const snappedTime = snapToGrid
      ? Math.round(startTime / gridSize) * gridSize
      : startTime

    set((state) => ({
      timeline: {
        ...state.timeline,
        clips: state.timeline.clips.map((clip) =>
          clip.id === clipId
            ? { ...clip, trackId, startTime: snappedTime, updatedAt: new Date() }
            : clip
        ),
      },
      isDirty: true,
    }))
  },

  resizeClip: (clipId: string, duration: number) => {
    const snapToGrid = get().timeline.snapToGrid
    const gridSize = get().timeline.gridSize
    const snappedDuration = snapToGrid
      ? Math.max(gridSize, Math.round(duration / gridSize) * gridSize)
      : Math.max(0.1, duration)

    set((state) => ({
      timeline: {
        ...state.timeline,
        clips: state.timeline.clips.map((clip) =>
          clip.id === clipId
            ? { ...clip, duration: snappedDuration, updatedAt: new Date() }
            : clip
        ),
      },
      isDirty: true,
    }))
  },

  // Playback
  setPlayheadPosition: (position: number) => {
    set((state) => ({
      timeline: { ...state.timeline, playheadPosition: Math.max(0, position) },
    }))
  },

  setPlaying: (isPlaying: boolean) => {
    set((state) => ({
      timeline: { ...state.timeline, isPlaying },
    }))
  },

  togglePlayback: () => {
    set((state) => ({
      timeline: { ...state.timeline, isPlaying: !state.timeline.isPlaying },
    }))
  },

  // View controls
  setZoom: (zoom: number) => {
    set((state) => ({
      timeline: { ...state.timeline, zoom: Math.max(10, Math.min(200, zoom)) },
    }))
  },

  setScrollOffset: (offset: number) => {
    set((state) => ({
      timeline: { ...state.timeline, scrollOffset: Math.max(0, offset) },
    }))
  },

  toggleSnapToGrid: () => {
    set((state) => ({
      timeline: { ...state.timeline, snapToGrid: !state.timeline.snapToGrid },
    }))
  },

  setGridSize: (size: number) => {
    set((state) => ({
      timeline: { ...state.timeline, gridSize: Math.max(0.1, size) },
    }))
  },

  // Selection
  selectClips: (clipIds: string[]) => {
    set((state) => ({
      timeline: { ...state.timeline, selectedClipIds: clipIds },
    }))
  },

  selectTracks: (trackIds: string[]) => {
    set((state) => ({
      timeline: { ...state.timeline, selectedTrackIds: trackIds },
    }))
  },

  clearSelection: () => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        selectedClipIds: [],
        selectedTrackIds: [],
      },
    }))
  },

  // Card linking
  linkCardToClip: (clipId: string, cardId: string) => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        clips: state.timeline.clips.map((clip) =>
          clip.id === clipId && !clip.cardLinks.includes(cardId)
            ? {
                ...clip,
                cardLinks: [...clip.cardLinks, cardId],
                updatedAt: new Date(),
              }
            : clip
        ),
      },
      isDirty: true,
    }))
  },

  unlinkCardFromClip: (clipId: string, cardId: string) => {
    set((state) => ({
      timeline: {
        ...state.timeline,
        clips: state.timeline.clips.map((clip) =>
          clip.id === clipId
            ? {
                ...clip,
                cardLinks: clip.cardLinks.filter((id) => id !== cardId),
                updatedAt: new Date(),
              }
            : clip
        ),
      },
      isDirty: true,
    }))
  },
})
