/**
 * Phase 33: Global Command Palette - Hook
 *
 * Main hook for components to interact with the command palette.
 * Provides access to palette state and actions.
 */

import { useCommandPaletteContext } from '@/lib/palette/context'

export function useCommandPalette() {
  return useCommandPaletteContext()
}
