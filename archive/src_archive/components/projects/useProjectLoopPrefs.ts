'use client'

import { useEffect, useState, useCallback } from 'react'
import { useOptionalDemo } from '@/components/demo/DemoOrchestrator'
import {
  type ProjectLoopPrefs,
  loadProjectLoopPrefs,
  saveProjectLoopPrefs,
} from './projectLoopPrefs'

export function useProjectLoopPrefs() {
  const demo = useOptionalDemo()
  const isDemoMode =
    demo?.isDemoMode || (typeof window !== 'undefined' && (window as any).__TA_DEMO__ === true)

  const [prefs, setPrefs] = useState<ProjectLoopPrefs>({})

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isDemoMode) return

    const initial = loadProjectLoopPrefs()
    setPrefs(initial)
  }, [isDemoMode])

  const getLastLoopId = useCallback(
    (projectId: string | null | undefined): string | null => {
      if (isDemoMode) return null
      if (!projectId) return null
      const entry = prefs[projectId]
      return entry?.lastLoopId ?? null
    },
    [isDemoMode, prefs]
  )

  const setLastLoopId = useCallback(
    (projectId: string | null | undefined, loopId: string) => {
      if (isDemoMode) return
      if (!projectId || !loopId) return

      setPrefs((previous) => {
        const next: ProjectLoopPrefs = {
          ...previous,
          [projectId]: {
            ...(previous[projectId] ?? {}),
            lastLoopId: loopId,
          },
        }
        saveProjectLoopPrefs(next)
        return next
      })
    },
    [isDemoMode]
  )

  const clearLoopId = useCallback(
    (projectId: string | null | undefined, loopId: string) => {
      if (isDemoMode) return
      if (!projectId || !loopId) return

      setPrefs((previous) => {
        const existing = previous[projectId]
        if (!existing || existing.lastLoopId !== loopId) {
          return previous
        }

        const next: ProjectLoopPrefs = { ...previous }
        const { lastLoopId, ...rest } = existing

        if (Object.keys(rest).length === 0) {
          delete next[projectId]
        } else {
          next[projectId] = rest
        }

        saveProjectLoopPrefs(next)
        return next
      })
    },
    [isDemoMode]
  )

  return { prefs, getLastLoopId, setLastLoopId, clearLoopId }
}
