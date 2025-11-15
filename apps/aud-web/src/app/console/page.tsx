/**
 * Production Console
 * Phase 15.4: Production Wiring & Demo Surface
 *
 * Purpose:
 * - Production console with authentication
 * - Live Supabase data integration
 * - Campaign management with RLS
 * - Demo mode fallback for unauth users
 */

'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { ConsoleLayout } from '@aud-web/layouts/ConsoleLayout'
import { ConsoleHeader } from '@aud-web/components/console/ConsoleHeader'
import { FlowCanvas, spawnFlowNode } from '@aud-web/components/features/flow/FlowCanvas'
import { NodePalette } from '@aud-web/components/features/flow/NodePalette'
import { CommandPalette } from '@aud-web/components/ui/CommandPalette'
import { FlowHubDashboard } from '@aud-web/components/console/FlowHubDashboard'
import type { NodeKind, ConsoleTab } from '@aud-web/types/console'
import { useFlowStateTelemetry } from '@aud-web/hooks/useFlowStateTelemetry'
import { useFlowHub } from '@aud-web/hooks/useFlowHub'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'

const log = logger.scope('ConsolePage')

export default function ConsolePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { trackEvent } = useFlowStateTelemetry()
  const { isFlowHubOpen, openFlowHub, closeFlowHub } = useFlowHub()

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [nodePaletteOpen, setNodePaletteOpen] = useState(false)
  const [currentNodeKind, setCurrentNodeKind] = useState<NodeKind | undefined>(undefined)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  /**
   * Initialize authentication and campaign
   */
  useEffect(() => {
    async function initialize() {
      try {
        // Check authentication status
        const authResponse = await fetch('/api/auth/session')

        if (authResponse.status === 401) {
          log.warn('User unauthenticated, redirecting to sign-in')
          router.replace('/auth/signin?redirect=/console')
          return
        }

        if (!authResponse.ok) {
          const { error: authError } = await authResponse.json()
          throw new Error(authError || 'Authentication check failed')
        }

        const authData = await authResponse.json()
        const authenticatedUserId = authData.user?.id as string | undefined

        if (!authenticatedUserId) {
          throw new Error('Missing user identifier')
        }

        setUserId(authenticatedUserId)

        // Get campaign ID from query
        const campaignIdFromQuery = searchParams?.get('id')

        if (campaignIdFromQuery) {
          setCampaignId(campaignIdFromQuery)
        } else {
          const campaignResponse = await fetch('/api/campaigns/last-used', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })

          if (campaignResponse.status === 401) {
            router.replace('/auth/signin?redirect=/console')
            return
          }

          if (!campaignResponse.ok) {
            const { error: campaignError } = await campaignResponse.json()
            throw new Error(campaignError || 'Failed to load campaign')
          }

          const campaignData = await campaignResponse.json()
          setCampaignId(campaignData.campaignId)
        }

        setIsAuthenticated(true)

        // Track page open
        trackEvent('save', {
          metadata: {
            action: 'route_opened',
            path: '/console',
            mode: 'authenticated',
          },
        })

        log.info('Console initialized', {
          authenticated: true,
          campaignId: campaignIdFromQuery || 'auto',
        })
      } catch (error) {
        log.error('Failed to initialize console', { error })
        setIsAuthenticated(false)
        toast.error('failed to load console', {
          description: error instanceof Error ? error.message : 'please try again',
        })
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [searchParams, trackEvent])

  /**
   * Global ⌘K shortcut
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        const target = event.target as HTMLElement
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return
        }
        event.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  /**
   * Handle node spawn
   */
  const handleNodeSpawn = (kind: NodeKind) => {
    if (!userId) {
      toast.error('sign in required', {
        description: 'you need to be authenticated to spawn agents',
      })
      return
    }

    const nodeId = spawnFlowNode(kind, { campaignId: campaignId || undefined, userId })

    log.info('Node spawned', { kind, authenticated: isAuthenticated, nodeId })
    setCurrentNodeKind(kind)
    setNodePaletteOpen(false)
    setCommandPaletteOpen(false)
  }

  /**
   * Render tab content
   */
  const renderTabContent = (tab: ConsoleTab) => {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Canvas Actions */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setNodePaletteOpen(true)}
            style={{
              padding: '10px 16px',
              backgroundColor: flowCoreColours.slateCyan,
              border: 'none',
              borderRadius: '6px',
              color: flowCoreColours.matteBlack,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'lowercase',
              fontFamily:
                'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
              transition: 'all var(--flowcore-motion-fast) ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = flowCoreColours.iceCyan
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
            }}
          >
            spawn agent
          </button>

          <button
            onClick={() => setCommandPaletteOpen(true)}
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '6px',
              color: flowCoreColours.textSecondary,
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'lowercase',
              fontFamily:
                'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
              transition: 'all var(--flowcore-motion-fast) ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = flowCoreColours.slateCyan
              e.currentTarget.style.color = flowCoreColours.slateCyan
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = flowCoreColours.borderGrey
              e.currentTarget.style.color = flowCoreColours.textSecondary
            }}
          >
            command palette
            <kbd
              style={{
                marginLeft: '8px',
                padding: '2px 6px',
                backgroundColor: flowCoreColours.matteBlack,
                borderRadius: '3px',
                fontSize: '11px',
                fontFamily: 'inherit',
              }}
            >
              ⌘K
            </kbd>
          </button>
        </div>

        {/* FlowCanvas */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <FlowCanvas campaignId={campaignId || undefined} userId={userId || undefined} />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: flowCoreColours.matteBlack,
          color: flowCoreColours.textSecondary,
          fontFamily:
            'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
          fontSize: '13px',
        }}
      >
        loading console...
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: flowCoreColours.matteBlack,
          color: flowCoreColours.textSecondary,
          fontFamily:
            'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
          fontSize: '13px',
          textAlign: 'center',
          padding: '0 24px',
        }}
      >
        unable to load console — please refresh or sign in again
      </div>
    )
  }

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: flowCoreColours.matteBlack,
      }}
    >
      {/* Console Layout */}
      <ConsoleLayout
        campaignId={campaignId || undefined}
        userId={userId || undefined}
        renderTabContent={renderTabContent}
        header={
          <ConsoleHeader
            campaignId={campaignId || undefined}
            userId={userId || undefined}
            currentNodeKind={currentNodeKind}
            onFlowHubOpen={openFlowHub}
          />
        }
      />

      {/* Node Palette */}
      {nodePaletteOpen && (
        <NodePalette
          open={nodePaletteOpen}
          onClose={() => setNodePaletteOpen(false)}
          onSpawnNode={handleNodeSpawn}
        />
      )}

      {/* Command Palette */}
      {commandPaletteOpen && (
        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onSpawnNode={handleNodeSpawn}
        />
      )}

      {/* Flow Hub Dashboard */}
      <FlowHubDashboard isOpen={isFlowHubOpen} onClose={closeFlowHub} />
    </div>
  )
}
