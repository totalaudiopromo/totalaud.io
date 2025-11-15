import { create } from 'zustand'
import { nanoid } from 'nanoid'

export type NodeCategory = 'Create' | 'Promote' | 'Analyse' | 'Refine'
export type NodeStatus = 'upcoming' | 'active' | 'completed'

export interface LoopNode {
  id: string
  title: string
  category: NodeCategory
  status: NodeStatus
  position: { x: number; y: number }
  colour: string
  icon?: string
  description?: string
  friction: number // 0-10 (how hard is this task?)
  priority: number // 0-10
  createdAt: number
  completedAt?: number
}

export interface PlaybackState {
  isPlaying: boolean
  currentTime: number
  loopDuration: number
  bpm: number
}

interface LoopStore {
  // Nodes
  nodes: LoopNode[]
  addNode: (node: Omit<LoopNode, 'id' | 'createdAt'>) => void
  updateNode: (id: string, updates: Partial<LoopNode>) => void
  removeNode: (id: string) => void
  completeNode: (id: string) => void

  // Playback
  playback: PlaybackState
  togglePlayback: () => void
  setCurrentTime: (time: number) => void
  setBPM: (bpm: number) => void

  // View state
  zoom: number
  setZoom: (zoom: number) => void
  pan: { x: number; y: number }
  setPan: (pan: { x: number; y: number }) => void
}

// Colour palette for node categories
export const categoryColours: Record<NodeCategory, string> = {
  Create: '#3AA9BE', // Cyan
  Promote: '#A855F7', // Purple
  Analyse: '#F59E0B', // Amber
  Refine: '#10B981', // Emerald
}

export const useLoopStore = create<LoopStore>((set) => ({
  // Initial nodes (demo data)
  nodes: [
    {
      id: nanoid(),
      title: 'Write new track',
      category: 'Create',
      status: 'upcoming',
      position: { x: 100, y: 100 },
      colour: categoryColours.Create,
      friction: 7,
      priority: 9,
      createdAt: Date.now(),
    },
    {
      id: nanoid(),
      title: 'Submit to playlists',
      category: 'Promote',
      status: 'upcoming',
      position: { x: 300, y: 150 },
      colour: categoryColours.Promote,
      friction: 4,
      priority: 8,
      createdAt: Date.now(),
    },
    {
      id: nanoid(),
      title: 'Check analytics',
      category: 'Analyse',
      status: 'upcoming',
      position: { x: 500, y: 100 },
      colour: categoryColours.Analyse,
      friction: 2,
      priority: 5,
      createdAt: Date.now(),
    },
  ],

  addNode: (node) =>
    set((state) => ({
      nodes: [
        ...state.nodes,
        {
          ...node,
          id: nanoid(),
          createdAt: Date.now(),
        },
      ],
    })),

  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
    })),

  completeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, status: 'completed' as NodeStatus, completedAt: Date.now() }
          : node
      ),
    })),

  // Playback state
  playback: {
    isPlaying: false,
    currentTime: 0,
    loopDuration: 16, // 16 beats
    bpm: 120,
  },

  togglePlayback: () =>
    set((state) => ({
      playback: {
        ...state.playback,
        isPlaying: !state.playback.isPlaying,
      },
    })),

  setCurrentTime: (time) =>
    set((state) => ({
      playback: {
        ...state.playback,
        currentTime: time,
      },
    })),

  setBPM: (bpm) =>
    set((state) => ({
      playback: {
        ...state.playback,
        bpm,
      },
    })),

  // View state
  zoom: 1,
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(2, zoom)) }),

  pan: { x: 0, y: 0 },
  setPan: (pan) => set({ pan }),
}))
