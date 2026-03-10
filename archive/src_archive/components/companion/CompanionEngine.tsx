'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useOptionalDemo } from '@/components/demo/DemoOrchestrator'
import { useProjectEngine } from '@/components/projects/useProjectEngine'
import { CompanionContext } from './useCompanion'
import { COMPANION_PRESETS, getCompanionPreset } from './companionPresets'
import type { CompanionId } from './companionPresets'

interface CompanionEngineProps {
  children: React.ReactNode
}

const STORAGE_PREFIX = 'ta_companion_'
const STORAGE_VERSION = 'v1'

function buildStorageKey(projectId: string): string {
  return `${STORAGE_PREFIX}${projectId}_${STORAGE_VERSION}`
}

interface PersistedCompanionPayload {
  activeCompanionId: CompanionId
}

export function CompanionEngineProvider({ children }: CompanionEngineProps) {
  const demo = useOptionalDemo()
  const { currentProjectId } = useProjectEngine()

  const [activeCompanionId, setActiveCompanionId] = useState<CompanionId | null>(null)

  const isDemoMode =
    demo?.isDemoMode || (typeof window !== 'undefined' && (window as any).__TA_DEMO__ === true)

  const setCompanion = useCallback(
    (id: CompanionId | null) => {
      setActiveCompanionId(id)

      if (isDemoMode) {
        // Demo mode should never persist companion state.
        return
      }

      if (!id || !currentProjectId) return
      if (typeof window === 'undefined') return

      try {
        const payload: PersistedCompanionPayload = {
          activeCompanionId: id,
        }
        const storageKey = buildStorageKey(currentProjectId)
        window.localStorage.setItem(storageKey, JSON.stringify(payload))
      } catch {
        // Ignore storage failures – never block the session
      }
    },
    [currentProjectId, isDemoMode]
  )

  useEffect(() => {
    if (isDemoMode) {
      // In demo mode we always surface Lana, but do not persist.
      setActiveCompanionId('lana_glass')
      return
    }

    if (!currentProjectId) {
      setActiveCompanionId(null)
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    const storageKey = buildStorageKey(currentProjectId)

    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedCompanionPayload
        if (parsed.activeCompanionId) {
          const preset = getCompanionPreset(parsed.activeCompanionId)
          if (preset) {
            setActiveCompanionId(parsed.activeCompanionId)
            return
          }
        }
      }
    } catch {
      // Ignore parse errors and fall through to default
    }

    // Default companion per project when none stored yet
    setActiveCompanionId('default_muse')
  }, [currentProjectId, isDemoMode])

  const injectIntoPrompt = useCallback(
    (input: string): string => {
      const active = getCompanionPreset(activeCompanionId)
      if (!active) return input

      const lines = [
        '<COMPANION>',
        `Name: ${active.name}`,
        `Tone: ${active.tone}`,
        `Traits: ${active.traits.join(', ')}`,
        `Bias: ${active.agentBias}`,
        '</COMPANION>',
        '',
        '<USER_INPUT>',
        input,
        '</USER_INPUT>',
      ]

      return lines.join('\n')
    },
    [activeCompanionId]
  )

  const value = useMemo(
    () => ({
      activeCompanionId,
      activeCompanion: getCompanionPreset(activeCompanionId),
      companions: COMPANION_PRESETS,
      setCompanion,
      injectIntoPrompt,
    }),
    [activeCompanionId, setCompanion, injectIntoPrompt]
  )

  return <CompanionContext.Provider value={value}>{children}</CompanionContext.Provider>
}
