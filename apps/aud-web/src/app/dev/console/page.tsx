/**
 * Demo Console Surface
 * Phase 15.4: Production Wiring & Demo Surface
 *
 * Purpose:
 * - Polished demo of connected console
 * - No authentication required
 * - Read-only mode (writes blocked with toasts)
 * - All features accessible for review
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { flowCoreColours } from '@/constants/flowCoreColours'
import { ConsoleLayout } from '@/layouts/ConsoleLayout'
import { ConsoleHeader } from '@/components/console/ConsoleHeader'
import { FlowCanvas } from '@/components/features/flow/FlowCanvas'
import { NodePalette } from '@/components/features/flow/NodePalette'
import { CommandPalette } from '@/components/features/flow/CommandPalette'
import type { NodeKind, ConsoleTab } from '@/types/console'
import { useFlowStateTelemetry } from '@/hooks/useFlowStateTelemetry'
import { logger } from '@/lib/logger'
import Link from 'next/link'

const log = logger.scope('DemoConsolePage')

export default function DemoConsolePage() {
  const { trackEvent } = useFlowStateTelemetry()
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [nodePaletteOpen, setNodePaletteOpen] = useState(false)
  const [currentNodeKind, setCurrentNodeKind] = useState<NodeKind | undefined>(undefined)

  /**
   * Track page open
   */
  useEffect(() => {
    log.info('Demo console opened')
    trackEvent('save', {
      metadata: {
        action: 'route_opened',
        path: '/dev/console',
        mode: 'demo',
      },
    })
  }, [trackEvent])

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
    log.info('Node spawned in demo', { kind })
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
        {/* Tab Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(58, 169, 190, 0.1)',
            border: `1px solid ${flowCoreColours.slateCyan}`,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            color: flowCoreColours.iceCyan,
            fontFamily:
              'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
          }}
        >
          <span style={{ fontSize: '18px' }}>📍</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: '2px' }}>
              {tab === 'plan' && 'plan mode — research & strategy'}
              {tab === 'do' && 'do mode — execute campaigns'}
              {tab === 'track' && 'track mode — monitor outcomes'}
              {tab === 'learn' && 'learn mode — analyse insights'}
            </div>
            <div style={{ fontSize: '11px', color: flowCoreColours.textSecondary }}>
              {tab === 'plan' && 'spawn intel agents, attach documents, generate research'}
              {tab === 'do' && 'spawn pitch agents, compose messages, attach assets'}
              {tab === 'track' && 'spawn tracker agents, view outreach logs, track responses'}
              {tab === 'learn' && 'analyse campaign performance, extract insights'}
            </div>
          </div>
        </motion.div>

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
              fontFamily: 'inherit',
              transition: 'all 0.12s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = flowCoreColours.iceCyan
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
            }}
          >
            <span style={{ marginRight: '8px' }}>🎯</span>
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
              fontFamily: 'inherit',
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
            campaignId="demo-campaign"
            userId="demo-user"
            onNodeSpawned={handleNodeSpawn}
          />
        </div>
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
      {/* Demo Mode Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: '12px 24px',
          backgroundColor: 'rgba(137, 223, 243, 0.1)',
          borderBottom: `1px solid ${flowCoreColours.iceCyan}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            color: flowCoreColours.iceCyan,
            fontFamily:
              'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
          }}
        >
          <span style={{ fontSize: '18px' }}>🧪</span>
          <div>
            <div style={{ fontWeight: 600 }}>demo mode — no authentication required</div>
            <div style={{ fontSize: '11px', color: flowCoreColours.textSecondary }}>
              full console features available · writes blocked with toast notifications
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            href="/operator"
            style={{
              padding: '8px 14px',
              backgroundColor: 'transparent',
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '6px',
              color: flowCoreColours.textSecondary,
              fontSize: '12px',
              fontWeight: 500,
              textDecoration: 'none',
              textTransform: 'lowercase',
              transition: 'all 0.12s ease',
              fontFamily: 'inherit',
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
            open operator
          </Link>

          <Link
            href="/console"
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
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = flowCoreColours.iceCyan
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
            }}
          >
            production console
          </Link>
        </div>
      </motion.div>

      {/* Console Layout */}
      <ConsoleLayout
        campaignId="demo-campaign"
        userId="demo-user"
        renderTabContent={renderTabContent}
        header={
          <ConsoleHeader
            campaignId="demo-campaign"
            userId="demo-user"
            currentNodeKind={currentNodeKind}
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
    </div>
  )
}
