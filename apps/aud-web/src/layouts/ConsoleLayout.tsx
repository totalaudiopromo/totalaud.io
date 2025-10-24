/**
 * Console Layout - Main Workspace Container
 *
 * 12-column adaptive grid with three panes:
 * - Mission Stack (left): Plan → Do → Track → Learn
 * - Activity Stream (center): Live agent actions + workflow events
 * - Insight Panel (right): Metrics, goals, recommendations
 *
 * Phase 1: Core Structure with placeholders
 */

'use client'

import { useTheme } from '@aud-web/components/themes/ThemeResolver'
import { useConsoleStore } from '@aud-web/stores/consoleStore'
import { consolePalette } from '@aud-web/themes/consolePalette'
import { motion, AnimatePresence } from 'framer-motion'
import { useStudioMotion } from '@aud-web/hooks/useStudioMotion'
import { MissionStack } from '@aud-web/components/console/MissionStack'
import { ActivityStream } from '@aud-web/components/console/ActivityStream'
import { InsightPanel } from '@aud-web/components/console/InsightPanel'
import { AgentFooter } from '@aud-web/components/console/AgentFooter'
import { ContextPane } from '@aud-web/components/console/ContextPane'
import { useState, useCallback } from 'react'

export function ConsoleLayout() {
  const { currentTheme } = useTheme()
  const motion_config = useStudioMotion(currentTheme)

  const {
    campaignName,
    activePane,
    activeMode,
    showOperatorPalette,
    toggleOperatorPalette,
  } = useConsoleStore()

  // Custom events that can be added from ContextPane forms
  const [customEvents, setCustomEvents] = useState<Array<{id: string, message: string, timestamp: Date}>>([])

  const handleAddEvent = useCallback((message: string) => {
    const newEvent = {
      id: crypto.randomUUID(),
      message,
      timestamp: new Date(),
    }
    setCustomEvents(prev => [newEvent, ...prev])
  }, [])

  // Motion tokens (≤ 150ms for transitions as per spec)
  const transitionSpeed = Math.min(motion_config.duration, 0.15)

  return (
    <div
      className="console-layout"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridTemplateRows: `${consolePalette.layout.header} 1fr ${consolePalette.layout.footer}`,
        height: '100vh',
        width: '100vw',
        backgroundColor: consolePalette.background.primary,
        color: consolePalette.text.primary,
        fontFamily: consolePalette.typography.fontFamily,
        fontSize: consolePalette.typography.fontSize.body,
        gap: consolePalette.spacing.gap,
        padding: consolePalette.spacing.containerPadding,
      }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: transitionSpeed }}
        style={{
          gridColumn: '1 / -1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: consolePalette.spacing.panePadding,
          borderBottom: `1px solid ${consolePalette.border.default}`,
          backgroundColor: consolePalette.background.secondary,
        }}
      >
        {/* Brand */}
        <div
          style={{
            fontSize: consolePalette.typography.fontSize.h3,
            fontWeight: 600,
            letterSpacing: consolePalette.typography.letterSpacing.wide,
            color: consolePalette.accent.primary,
          }}
        >
          totalaud.io
        </div>

        {/* Campaign Name */}
        <div
          style={{
            fontSize: consolePalette.typography.fontSize.body,
            color: consolePalette.text.secondary,
            letterSpacing: consolePalette.typography.letterSpacing.normal,
          }}
        >
          {campaignName || 'Untitled Campaign'}
        </div>

        {/* Operator Toggle */}
        <button
          onClick={toggleOperatorPalette}
          style={{
            padding: `${consolePalette.spacing.elementPadding} ${parseInt(consolePalette.spacing.elementPadding) * 2}px`,
            backgroundColor: showOperatorPalette
              ? consolePalette.accent.primary
              : 'transparent',
            color: showOperatorPalette
              ? consolePalette.background.primary
              : consolePalette.text.secondary,
            border: `1px solid ${
              showOperatorPalette
                ? consolePalette.accent.primary
                : consolePalette.border.default
            }`,
            borderRadius: '6px',
            fontSize: consolePalette.typography.fontSize.small,
            fontWeight: 500,
            cursor: 'pointer',
            transition: `all ${transitionSpeed}s ease`,
          }}
        >
          ⌘K
        </button>
      </motion.header>

      {/* Main: Three Panes */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: transitionSpeed, delay: 0.1 }}
        style={{
          gridColumn: '1 / -1',
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: consolePalette.spacing.gap,
          overflow: 'hidden',
        }}
      >
        {/* Mission Stack (Left - 3 cols) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: transitionSpeed, delay: 0.15 }}
          style={{
            gridColumn: '1 / 4',
            backgroundColor: consolePalette.background.secondary,
            border: `1px solid ${consolePalette.border.default}`,
            borderRadius: '8px',
            padding: consolePalette.spacing.panePadding,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            opacity: activePane === 'mission' ? 1 : 0.6,
            transition: `opacity ${transitionSpeed}s ease`,
          }}
        >
          <h2
            style={{
              fontSize: consolePalette.typography.fontSize.h3,
              fontWeight: 600,
              marginBottom: consolePalette.spacing.sectionMargin,
              color: consolePalette.accent.primary,
            }}
          >
            Mission Stack
          </h2>
          <MissionStack />
        </motion.div>

        {/* Center Pane - Dynamic based on activePane (6 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{ duration: transitionSpeed, delay: 0.2 }}
          style={{
            gridColumn: '4 / 10',
            backgroundColor: consolePalette.background.secondary,
            border: `1px solid ${consolePalette.border.default}`,
            borderRadius: '8px',
            borderLeft: `1px solid rgba(58, 225, 194, 0.2)`,  // Accent divider
            borderRight: `1px solid rgba(58, 225, 194, 0.2)`,  // Accent divider
            padding: consolePalette.spacing.panePadding,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            opacity: activePane === 'mission' || activePane === 'activity' ? 1 : 0.85,
            transition: `all ${transitionSpeed}s ease`,
          }}
        >
          <AnimatePresence mode="wait">
            {activePane === 'mission' ? (
              <motion.div
                key="context"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                <ContextPane onAddEvent={handleAddEvent} />
              </motion.div>
            ) : (
              <motion.div
                key="activity"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                <h2
                  style={{
                    fontSize: consolePalette.typography.fontSize.h3,
                    fontWeight: 600,
                    marginBottom: consolePalette.spacing.sectionMargin,
                    color: consolePalette.accent.primary,
                  }}
                >
                  Activity Stream
                </h2>
                <ActivityStream />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Insight Panel (Right - 3 cols) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: transitionSpeed, delay: 0.25 }}
          style={{
            gridColumn: '10 / -1',
            backgroundColor: consolePalette.background.secondary,
            border: `1px solid ${consolePalette.border.default}`,
            borderRadius: '8px',
            padding: consolePalette.spacing.panePadding,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            opacity: activePane === 'insight' ? 1 : 0.6,
            transition: `opacity ${transitionSpeed}s ease`,
          }}
        >
          <h2
            style={{
              fontSize: consolePalette.typography.fontSize.h3,
              fontWeight: 600,
              marginBottom: consolePalette.spacing.sectionMargin,
              color: consolePalette.accent.primary,
            }}
          >
            Insight Panel
          </h2>
          <InsightPanel />
        </motion.div>
      </motion.main>

      {/* Footer: Agent Status Bar */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: transitionSpeed, delay: 0.3 }}
        style={{
          gridColumn: '1 / -1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: consolePalette.spacing.panePadding,
          borderTop: `1px solid ${consolePalette.border.default}`,
          backgroundColor: consolePalette.background.secondary,
          fontSize: consolePalette.typography.fontSize.small,
          color: consolePalette.text.secondary,
        }}
      >
        <AgentFooter />
      </motion.footer>
    </div>
  )
}
