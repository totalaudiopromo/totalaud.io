'use client'

/**
 * Phase 33: Global Command Palette - Context
 *
 * React context provider for the unified command palette.
 * Manages state, commands, and cross-surface context.
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type {
  PaletteMode,
  PaletteContext,
  CommandDefinition,
  SurfaceType,
} from './types'

interface CommandPaletteContextValue {
  // State
  isOpen: boolean
  mode: PaletteMode
  context: PaletteContext
  query: string

  // Actions
  openPalette: (mode?: PaletteMode) => void
  closePalette: () => void
  setQuery: (query: string) => void
  setContext: (context: Partial<PaletteContext>) => void
  setSurface: (surface: SurfaceType | null) => void

  // Commands
  commands: CommandDefinition[]
  registerCommand: (command: CommandDefinition) => void
  unregisterCommand: (id: string) => void
  executeCommand: (id: string) => Promise<void>
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null)

export function useCommandPaletteContext() {
  const context = useContext(CommandPaletteContext)
  if (!context) {
    throw new Error('useCommandPaletteContext must be used within CommandPaletteProvider')
  }
  return context
}

interface CommandPaletteProviderProps {
  children: ReactNode
}

export function CommandPaletteProvider({ children }: CommandPaletteProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<PaletteMode>('default')
  const [query, setQuery] = useState('')
  const [context, setContextState] = useState<PaletteContext>({
    surface: null,
    workspaceId: null,
    selectedItemId: null,
    selectedItemType: null,
  })
  const [commands, setCommands] = useState<CommandDefinition[]>([])

  // Open palette
  const openPalette = useCallback((newMode: PaletteMode = 'default') => {
    setMode(newMode)
    setQuery('')
    setIsOpen(true)
  }, [])

  // Close palette
  const closePalette = useCallback(() => {
    setIsOpen(false)
    setQuery('')
  }, [])

  // Update context
  const setContext = useCallback((partial: Partial<PaletteContext>) => {
    setContextState((prev) => ({ ...prev, ...partial }))
  }, [])

  // Update surface
  const setSurface = useCallback((surface: SurfaceType | null) => {
    setContextState((prev) => ({ ...prev, surface }))
  }, [])

  // Register command
  const registerCommand = useCallback((command: CommandDefinition) => {
    setCommands((prev) => {
      // Remove existing command with same ID
      const filtered = prev.filter((c) => c.id !== command.id)
      return [...filtered, command]
    })
  }, [])

  // Unregister command
  const unregisterCommand = useCallback((id: string) => {
    setCommands((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // Execute command
  const executeCommand = useCallback(
    async (id: string) => {
      const command = commands.find((c) => c.id === id)
      if (!command) return

      try {
        await command.action()
        closePalette()
      } catch (error) {
        console.error('[Command Palette] Failed to execute command:', error)
      }
    },
    [commands, closePalette]
  )

  // Global keyboard shortcut (⌘K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) {
          closePalette()
        } else {
          openPalette()
        }
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        closePalette()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, openPalette, closePalette])

  const value: CommandPaletteContextValue = {
    isOpen,
    mode,
    context,
    query,
    openPalette,
    closePalette,
    setQuery,
    setContext,
    setSurface,
    commands,
    registerCommand,
    unregisterCommand,
    executeCommand,
  }

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  )
}
