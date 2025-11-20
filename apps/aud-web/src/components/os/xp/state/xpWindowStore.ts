import { create } from 'zustand'

export type XPWindowType = 'notes' | 'processes' | 'clipboard' | 'systemInfo'

export interface XPWindowInstance {
  id: string
  type: XPWindowType
  title: string
  position: { x: number; y: number }
  size: { w: number; h: number }
  minimized: boolean
}

interface XPWindowState {
  windows: XPWindowInstance[]
  focusedWindowId: string | null
  zOrder: string[]
  openWindow: (type: XPWindowType) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimiseWindow: (id: string) => void
  restoreWindow: (id: string) => void
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void
}

let idCounter = 0
const nextId = () => `xp-window-${++idCounter}`

const defaultConfig: Record<XPWindowType, { title: string; size: { w: number; h: number } }> = {
  notes: {
    title: 'Flow Notes',
    size: { w: 480, h: 320 },
  },
  processes: {
    title: 'Agent Monitor',
    size: { w: 420, h: 260 },
  },
  clipboard: {
    title: 'Clipboard',
    size: { w: 360, h: 260 },
  },
  systemInfo: {
    title: 'System Info',
    size: { w: 360, h: 240 },
  },
}

export const useXPWindowStore = create<XPWindowState>((set, get) => ({
  windows: [],
  focusedWindowId: null,
  zOrder: [],

  openWindow: (type) =>
    set((state) => {
      const id = nextId()
      const config = defaultConfig[type]
      const baseOffset = state.windows.length * 32

      const newWindow: XPWindowInstance = {
        id,
        type,
        title: config.title,
        position: { x: 120 + baseOffset, y: 80 + baseOffset },
        size: config.size,
        minimized: false,
      }

      return {
        windows: [...state.windows, newWindow],
        focusedWindowId: id,
        zOrder: [...state.zOrder.filter((wid) => wid !== id), id],
      }
    }),

  closeWindow: (id) =>
    set((state) => {
      const windows = state.windows.filter((w) => w.id !== id)
      const zOrder = state.zOrder.filter((wid) => wid !== id)
      const focusedWindowId =
        state.focusedWindowId === id ? (zOrder[zOrder.length - 1] ?? null) : state.focusedWindowId

      return {
        windows,
        zOrder,
        focusedWindowId,
      }
    }),

  focusWindow: (id) =>
    set((state) => {
      if (!state.windows.find((w) => w.id === id)) return state
      return {
        focusedWindowId: id,
        zOrder: [...state.zOrder.filter((wid) => wid !== id), id],
      }
    }),

  minimiseWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
      focusedWindowId: state.focusedWindowId === id ? null : state.focusedWindowId,
    })),

  restoreWindow: (id) =>
    set((state) => {
      if (!state.windows.find((w) => w.id === id)) return state
      return {
        windows: state.windows.map((w) => (w.id === id ? { ...w, minimized: false } : w)),
        focusedWindowId: id,
        zOrder: [...state.zOrder.filter((wid) => wid !== id), id],
      }
    }),

  updateWindowPosition: (id, position) =>
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, position } : w)),
    })),
}))
