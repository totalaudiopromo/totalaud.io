/**
 * LoopOS Desktop - Keyboard Shortcuts
 * Listens for Tauri global shortcuts and triggers handlers
 */

import { useEffect } from 'react'
import { listen } from '@tauri-apps/api/event'

export interface ShortcutHandlers {
  onCommandPalette?: () => void
  onNewNode?: () => void
  onJournal?: () => void
  onDesigner?: () => void
  onExport?: () => void
}

export function useDesktopShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const unlisteners: Array<() => void> = []

    // Command Palette: Cmd/Ctrl+K
    if (handlers.onCommandPalette) {
      listen('shortcut:command-palette', handlers.onCommandPalette).then(
        (unlisten) => {
          unlisteners.push(unlisten)
        }
      )
    }

    // New Node: Cmd/Ctrl+N
    if (handlers.onNewNode) {
      listen('shortcut:new-node', handlers.onNewNode).then((unlisten) => {
        unlisteners.push(unlisten)
      })
    }

    // Journal: Cmd/Ctrl+J
    if (handlers.onJournal) {
      listen('shortcut:journal', handlers.onJournal).then((unlisten) => {
        unlisteners.push(unlisten)
      })
    }

    // Designer: Cmd/Ctrl+D
    if (handlers.onDesigner) {
      listen('shortcut:designer', handlers.onDesigner).then((unlisten) => {
        unlisteners.push(unlisten)
      })
    }

    // Export: Cmd/Ctrl+Shift+E
    if (handlers.onExport) {
      listen('shortcut:export', handlers.onExport).then((unlisten) => {
        unlisteners.push(unlisten)
      })
    }

    return () => {
      unlisteners.forEach((unlisten) => unlisten())
    }
  }, [handlers])
}
