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

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { ConsoleLayout } from '@aud-web/layouts/ConsoleLayout'
import { ConsoleHeader } from '@aud-web/components/console/ConsoleHeader'
import { FlowCanvas } from '@aud-web/components/features/flow/FlowCanvas'
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
        const authData = await authResponse.json()

        // Get campaign ID from query (available for both auth and demo mode)
        const campaignIdFromQuery = searchParams?.get('id')

        if (authData.authenticated) {
          setIsAuthenticated(true)
          setUserId(authData.userId)

          // Get or create campaign
          if (campaignIdFromQuery) {
            setCampaignId(campaignIdFromQuery)
          } else {
            // Load last used campaign or create new one
            const campaignResponse = await fetch('/api/campaigns/last-used', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            })
            const campaignData = await campaignResponse.json()
            setCampaignId(campaignData.campaignId)
          }
        } else {
          // Demo mode
          setIsAuthenticated(false)
          setUserId('demo-user')
          setCampaignId('demo-campaign')

          toast.info('demo mode — no authentication', {
            description: 'data will not be saved',
            duration: 5000,
          })
        }

        // Track page open
        trackEvent('save', {
          metadata: {
            action: 'route_opened',
            path: '/console',
            mode: authData.authenticated ? 'authenticated' : 'demo',
          },
        })

        log.info('Console initialized', {
          authenticated: authData.authenticated,
          campaignId: campaignIdFromQuery || 'auto',
        })
      } catch (error) {
        log.error('Failed to initialize console', error)
        // Fallback to demo mode
        setIsAuthenticated(false)
        setUserId('demo-user')
        setCampaignId('demo-campaign')

        toast.error('failed to load console', {
          description: 'running in demo mode',
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
    log.info('Node spawned', { kind, authenticated: isAuthenticated })
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
              transition: 'all 0.12s ease',
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
              transition: 'all 0.12s ease',
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
          <FlowCanvas
            campaignId={campaignId || undefined}
            userId={userId || undefined}
            onNodeSpawned={handleNodeSpawn}
          />
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

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: flowCoreColours.matteBlack,
      }}
    >
      {/* Demo Mode Banner (if unauthenticated) */}
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 24px',
            backgroundColor: 'rgba(137, 223, 243, 0.1)',
            borderBottom: `1px solid ${flowCoreColours.iceCyan}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            color: flowCoreColours.iceCyan,
            fontFamily:
              'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>demo mode — sign in to save your work</div>
            <div style={{ fontSize: '11px', color: flowCoreColours.textSecondary }}>
              all features available · writes will not be persisted
            </div>
          </div>
          <a
            href="/auth/signin"
            style={{
              padding: '8px 14px',
              backgroundColor: flowCoreColours.slateCyan,
              border: 'none',
              borderRadius: '6px',
              color: flowCoreColours.matteBlack,
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              textTransform: 'lowercase',
              transition: 'all 0.12s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = flowCoreColours.iceCyan
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
            }}
          >
            sign in
          </a>
        </motion.div>
      )}

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
