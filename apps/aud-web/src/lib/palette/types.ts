/**
 * Phase 33: Global Command Palette - Types
 *
 * Type definitions for the unified command palette system.
 * British tone, calm actions, cross-surface creativity.
 */

import type { ReactNode } from 'react'

export type SurfaceType = 'analogue' | 'timeline' | 'coach' | 'designer' | 'rhythm' | 'ascii' | 'xp' | 'aqua' | 'daw'

export type PaletteMode = 'search' | 'actions' | 'default'

export type CommandGroup =
  | 'navigation'
  | 'creation'
  | 'linking'
  | 'memory'
  | 'ai'
  | 'workspace'
  | 'settings'

export interface PaletteContext {
  surface: SurfaceType | null
  workspaceId: string | null
  selectedItemId: string | null
  selectedItemType: 'note' | 'card' | 'node' | 'message' | 'scene' | null
}

export interface CommandDefinition {
  id: string
  title: string
  subtitle?: string
  group: CommandGroup
  keywords?: string[]
  icon?: ReactNode
  action: () => Promise<void> | void
  visible?: (ctx: PaletteContext) => boolean
}

export interface SearchResult {
  id: string
  type: 'note' | 'card' | 'node' | 'message' | 'scene' | 'theme' | 'rhythm' | 'workspace' | 'action'
  title: string
  subtitle?: string
  content?: string
  group: string
  score: number
  icon?: ReactNode
  action: () => void
}

export interface SearchGroup {
  label: string
  results: SearchResult[]
}

export interface CommandPaletteState {
  isOpen: boolean
  mode: PaletteMode
  context: PaletteContext
  query: string
}
