/**
 * Orchestration Context
 * Phase 15.3: Connected Console & Orchestration
 *
 * Purpose:
 * - Manage intel → pitch seed flow
 * - Manage pitch → tracker log flow
 * - Event bus for agent communication
 */

'use client'

import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from 'react'
import type {
  OrchestrationIntelPayload,
  OrchestrationPitchSeed,
  OutreachLog,
} from '@/types/console'
import { useFlowStateTelemetry } from '@/hooks/useFlowStateTelemetry'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'

const log = logger.scope('OrchestrationContext')

interface OrchestrationContextValue {
  // Intel → Pitch
  intelPayload: OrchestrationIntelPayload | null
  setIntelPayload: (payload: OrchestrationIntelPayload) => void
  consumeIntelPayload: () => OrchestrationPitchSeed | null
  clearIntelPayload: () => void

  // Pitch → Tracker
  logOutreach: (log: Omit<OutreachLog, 'id' | 'timestamp'>) => Promise<void>
  recentLogs: OutreachLog[]
}

const OrchestrationContext = createContext<OrchestrationContextValue | undefined>(undefined)

interface OrchestrationProviderProps {
  children: ReactNode
  campaignId?: string
}

export function OrchestrationProvider({ children, campaignId }: OrchestrationProviderProps) {
  const { trackEvent } = useFlowStateTelemetry()
  const [intelPayload, setIntelPayloadState] = useState<OrchestrationIntelPayload | null>(null)
  const [recentLogs, setRecentLogs] = useState<OutreachLog[]>([])

  /**
   * Set intel payload and emit telemetry
   */
  const setIntelPayload = useCallback(
    (payload: OrchestrationIntelPayload) => {
      log.info('Intel payload set', {
        summary: payload.summary.slice(0, 100),
        contacts: payload.keyContacts.length,
        keywords: payload.keywords.length,
      })

      setIntelPayloadState(payload)

      // Track telemetry
      trackEvent('save', {
        metadata: {
          action: 'intel_to_pitch_seed',
          contactCount: payload.keyContacts.length,
          keywordCount: payload.keywords.length,
          campaignId: payload.campaignId || campaignId,
        },
      })

      // Show toast
      toast.success('intel ready — use in pitch agent', {
        description: `${payload.keyContacts.length} contact${payload.keyContacts.length === 1 ? '' : 's'}, ${payload.keywords.length} keyword${payload.keywords.length === 1 ? '' : 's'}`,
      })
    },
    [campaignId, trackEvent]
  )

  /**
   * Consume intel payload and convert to pitch seed
   * Clears payload after consumption
   */
  const consumeIntelPayload = useCallback((): OrchestrationPitchSeed | null => {
    if (!intelPayload) return null

    log.info('Intel payload consumed for pitch seed')

    const seed: OrchestrationPitchSeed = {
      prefill: `Based on intel research:\n\n${intelPayload.summary}\n\nKey topics: ${intelPayload.keywords.join(', ')}`,
      recipients: intelPayload.keyContacts,
      keywords: intelPayload.keywords,
      sourceIntelId: intelPayload.campaignId,
    }

    // Clear after consumption
    setIntelPayloadState(null)

    return seed
  }, [intelPayload])

  /**
   * Clear intel payload without consuming
   */
  const clearIntelPayload = useCallback(() => {
    log.debug('Intel payload cleared')
    setIntelPayloadState(null)
  }, [])

  /**
   * Log outreach to tracker
   */
  const logOutreach = useCallback(
    async (logInput: Omit<OutreachLog, 'id' | 'timestamp'>) => {
      try {
        const newLog: OutreachLog = {
          id: `outreach-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          ...logInput,
          timestamp: new Date().toISOString(),
          campaign_id: logInput.campaign_id || campaignId,
        }

        log.info('Outreach logged', {
          logId: newLog.id,
          contact: newLog.contact_name,
          assets: newLog.asset_ids.length,
        })

        // Add to recent logs (keep last 10)
        setRecentLogs((prev) => [newLog, ...prev].slice(0, 10))

        // Track telemetry
        trackEvent('save', {
          metadata: {
            action: 'tracker_log_created',
            assetCount: newLog.asset_ids.length,
            contactId: newLog.contact_id,
            campaignId: newLog.campaign_id,
          },
        })

        // In real implementation, POST to /api/agents/tracker
        // For now, just update local state

        toast.success('outreach logged to tracker', {
          description: `${newLog.contact_name || 'Contact'} — ${newLog.asset_ids.length} asset${newLog.asset_ids.length === 1 ? '' : 's'}`,
        })
      } catch (error) {
        log.error('Failed to log outreach', error)
        toast.error('failed to log outreach')
        throw error
      }
    },
    [campaignId, trackEvent]
  )

  /**
   * Auto-clear intel payload after 5 minutes
   */
  useEffect(() => {
    if (!intelPayload) return

    const timer = setTimeout(
      () => {
        log.info('Intel payload expired (5 minutes)')
        setIntelPayloadState(null)
        toast.info('intel seed expired', {
          description: 'run intel again to generate new findings',
        })
      },
      5 * 60 * 1000
    ) // 5 minutes

    return () => clearTimeout(timer)
  }, [intelPayload])

  const value: OrchestrationContextValue = {
    intelPayload,
    setIntelPayload,
    consumeIntelPayload,
    clearIntelPayload,
    logOutreach,
    recentLogs,
  }

  return <OrchestrationContext.Provider value={value}>{children}</OrchestrationContext.Provider>
}

/**
 * Hook to use orchestration context
 */
export function useOrchestration(): OrchestrationContextValue {
  const context = useContext(OrchestrationContext)
  if (!context) {
    throw new Error('useOrchestration must be used within OrchestrationProvider')
  }
  return context
}

/**
 * Hook to check if intel payload is available
 */
export function useHasIntelSeed(): boolean {
  const { intelPayload } = useOrchestration()
  return intelPayload !== null
}
