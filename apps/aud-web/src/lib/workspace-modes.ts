/**
 * Workspace mode types and accent colours.
 * Single source of truth -- used by workspace page, MobileNav, and any mode-aware component.
 */

export type WorkspaceMode = 'ideas' | 'scout' | 'timeline' | 'pitch' | 'finish'

export const MODE_COLOURS: Record<WorkspaceMode, string> = {
  ideas: '#F59E0B',
  scout: '#10B981',
  timeline: '#8B5CF6',
  pitch: '#FB923C',
  finish: '#3AA9BE',
}
