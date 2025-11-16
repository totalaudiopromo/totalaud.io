/**
 * LoopOS Runtime Detection
 * Detects whether the app is running in desktop mode (Tauri) or web mode
 */

/**
 * Check if running inside Tauri desktop app
 */
export function isDesktop(): boolean {
  // Check for Tauri-specific global
  if (typeof window !== 'undefined') {
    return '__TAURI__' in window
  }
  return false
}

/**
 * Check if running in web browser
 */
export function isWeb(): boolean {
  return !isDesktop()
}

/**
 * Get runtime mode
 */
export function getRuntimeMode(): 'desktop' | 'web' {
  return isDesktop() ? 'desktop' : 'web'
}

/**
 * Desktop-specific features flag
 * Use this to enable/disable features based on runtime
 */
export const desktopFeatures = {
  /**
   * Offline queue is handled by desktop app
   */
  get offlineQueue(): boolean {
    return isDesktop()
  },

  /**
   * Local cache is handled by desktop app
   */
  get localCache(): boolean {
    return isDesktop()
  },

  /**
   * Native menus and shortcuts available
   */
  get nativeMenus(): boolean {
    return isDesktop()
  },

  /**
   * System tray integration available
   */
  get systemTray(): boolean {
    return isDesktop()
  },
}

/**
 * Listen for desktop shortcuts (when running in desktop mode)
 */
export function listenForDesktopShortcuts(handlers: {
  onCommandPalette?: () => void
  onNewNode?: () => void
  onJournal?: () => void
  onDesigner?: () => void
  onExport?: () => void
}) {
  if (!isDesktop()) return

  window.addEventListener('message', (event) => {
    if (event.data?.type === 'shortcut') {
      const action = event.data.action

      switch (action) {
        case 'command-palette':
          handlers.onCommandPalette?.()
          break
        case 'new-node':
          handlers.onNewNode?.()
          break
        case 'journal':
          handlers.onJournal?.()
          break
        case 'designer':
          handlers.onDesigner?.()
          break
        case 'export':
          handlers.onExport?.()
          break
      }
    }
  })
}
