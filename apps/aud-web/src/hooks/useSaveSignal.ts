/**
 * useSaveSignal Hook
 * Phase 14.5: Save FlowCanvas scene state to Supabase
 *
 * Features:
 * - Manual save via button
 * - Auto-save every 60s
 * - Toast notifications
 * - Updates last_saved_at timestamp
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'react-hot-toast'

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
  [key: string]: any
}

interface UseSaveSignalOptions {
  autoSaveInterval?: number // milliseconds (default: 60000 = 60s)
  enabled?: boolean // enable/disable auto-save
}

interface UseSaveSignalResult {
  save: (sceneState: SceneState, campaignContext?: CampaignContext) => Promise<void>
  isSaving: boolean
  lastSavedAt: Date | null
  sceneId: string | null
}

const AUTO_SAVE_INTERVAL = 60000 // 60 seconds

export function useSaveSignal(options: UseSaveSignalOptions = {}): UseSaveSignalResult {
  const { autoSaveInterval = AUTO_SAVE_INTERVAL, enabled = true } = options

  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [sceneId, setSceneId] = useState<string | null>(null)

  const sceneStateRef = useRef<SceneState | null>(null)
  const campaignContextRef = useRef<CampaignContext | null>(null)

  const save = useCallback(async (sceneState: SceneState, campaignContext?: CampaignContext) => {
    sceneStateRef.current = sceneState
    campaignContextRef.current = campaignContext || null

    setIsSaving(true)

    try {
      const artistName = campaignContext?.artist || 'Untitled'
      const goalName = campaignContext?.goal || 'Signal'
      
      const response = await fetch('/api/canvas/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneState,
          campaignId: campaignContext?.id,
          title: `${artistName} - ${goalName}`,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.statusText}`)
      }

      const data = await response.json()
      
      setSceneId(data.sceneId)
      setLastSavedAt(new Date())

      toast.success('signal saved successfully', {
        duration: 2000,
        style: {
          background: '#0F1113',
          color: '#51CF66',
          border: '1px solid #263238',
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '14px',
          textTransform: 'lowercase',
        },
      })
    } catch (error) {
      console.error('Save failed:', error)
      toast.error("couldn't save — check connection", {
        duration: 3000,
        style: {
          background: '#0F1113',
          color: '#FF5252',
          border: '1px solid #263238',
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '14px',
          textTransform: 'lowercase',
        },
      })
    } finally {
      setIsSaving(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      if (sceneStateRef.current) {
        save(sceneStateRef.current, campaignContextRef.current || undefined)
      }
    }, autoSaveInterval)

    return () => clearInterval(interval)
  }, [enabled, autoSaveInterval, save])

  return {
    save,
    isSaving,
    lastSavedAt,
    sceneId,
  }
}
