/**
 * useSaveSignal Hook
 * Phase 14.5: Save FlowCanvas scene state to Supabase
 * Phase 14.8: Enhanced auto-save with diff detection
 *
 * Features:
 * - Manual save via button
 * - Auto-save every 60s (only if changed)
 * - Diff detection to prevent unnecessary saves
 * - Save state tracking (idle/saving/saved/error)
 * - Updates last_saved_at timestamp
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

export interface SceneState {
  nodes: any[]
  edges: any[]
  viewport: {
    x: number
    y: number
    zoom: number
  }
  [key: string]: any
}

export interface CampaignContext {
  id?: string
  artist?: string
  goal?: string
  title?: string
  [key: string]: any
}

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

interface UseSaveSignalOptions {
  autoSaveInterval?: number // milliseconds (default: 60000 = 60s)
  enabled?: boolean // enable/disable auto-save
  onSaveComplete?: () => void // callback after successful save
}

interface UseSaveSignalResult {
  save: (sceneState: SceneState, campaignContext?: CampaignContext) => Promise<void>
  isSaving: boolean
  lastSavedAt: Date | null
  sceneId: string | null
  savingState: SaveState
  startAutoSave: (options: AutoSaveOptions) => void
  stopAutoSave: () => void
}

interface AutoSaveOptions {
  getSceneState: () => SceneState | null
  getCampaignContext: () => CampaignContext | null
  intervalMs?: number
}

const AUTO_SAVE_INTERVAL = 60000 // 60 seconds

// Lightweight hash for diff detection
function hashSceneState(state: SceneState | null): string {
  if (!state) return ''
  return JSON.stringify({
    nodeCount: state.nodes?.length || 0,
    edgeCount: state.edges?.length || 0,
    viewport: state.viewport,
  })
}

export function useSaveSignal(options: UseSaveSignalOptions = {}): UseSaveSignalResult {
  const { autoSaveInterval = AUTO_SAVE_INTERVAL, enabled = true, onSaveComplete } = options

  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [sceneId, setSceneId] = useState<string | null>(null)
  const [savingState, setSavingState] = useState<SaveState>('idle')

  const sceneStateRef = useRef<SceneState | null>(null)
  const campaignContextRef = useRef<CampaignContext | null>(null)
  const lastSavedHashRef = useRef<string>('')
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const save = useCallback(
    async (sceneState: SceneState, campaignContext?: CampaignContext, isAutoSave = false) => {
      sceneStateRef.current = sceneState
      campaignContextRef.current = campaignContext || null

      setIsSaving(true)
      setSavingState('saving')

      try {
        const title =
          campaignContext?.title ||
          `${campaignContext?.artist || 'Untitled'} - ${campaignContext?.goal || 'Signal'}`

        const response = await fetch('/api/canvas/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sceneState,
            campaignId: campaignContext?.id,
            title,
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to save: ${response.statusText}`)
        }

        const data = await response.json()

        setSceneId(data.sceneId)
        setLastSavedAt(new Date())
        setSavingState('saved')
        lastSavedHashRef.current = hashSceneState(sceneState)

        // Call completion callback
        onSaveComplete?.()

        // Reset to idle after 5s
        setTimeout(() => {
          setSavingState('idle')
        }, 5000)
      } catch (error) {
        console.error('Save failed:', error)
        setSavingState('error')

        // Reset error state after 5s
        setTimeout(() => {
          setSavingState('idle')
        }, 5000)
      } finally {
        setIsSaving(false)
      }
    },
    [onSaveComplete]
  )

  const startAutoSave = useCallback(
    ({ getSceneState, getCampaignContext, intervalMs = AUTO_SAVE_INTERVAL }: AutoSaveOptions) => {
      // Clear existing interval if any
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current)
      }

      autoSaveIntervalRef.current = setInterval(() => {
        const sceneState = getSceneState()
        const campaignContext = getCampaignContext()

        if (!sceneState) return

        // Compare hash to detect changes
        const currentHash = hashSceneState(sceneState)
        if (currentHash === lastSavedHashRef.current) {
          // No changes detected, skip save
          return
        }

        // Changes detected, trigger auto-save
        save(sceneState, campaignContext || undefined, true)
      }, intervalMs)
    },
    [save]
  )

  const stopAutoSave = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current)
      autoSaveIntervalRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoSave()
    }
  }, [stopAutoSave])

  return {
    save,
    isSaving,
    lastSavedAt,
    sceneId,
    savingState,
    startAutoSave,
    stopAutoSave,
  }
}
