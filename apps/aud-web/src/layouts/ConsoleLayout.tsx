/**
 * Console Layout - Main Workspace Container
 *
 * 12-column adaptive grid with three panes:
 * - Mission Stack (left): Plan → Do → Track → Learn
 * - Activity Stream (center): Live agent actions + workflow events
 * - Insight Panel (right): Metrics, goals, recommendations
 *
 * Phase 1: Core Structure with placeholders
 * Stage 8.5: Migrated to CSS variable system (Slate Cyan)
 */

'use client'

import { useTheme } from '@aud-web/components/themes/ThemeResolver'
import { useConsoleStore } from '@aud-web/stores/consoleStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useStudioMotion } from '@aud-web/hooks/useStudioMotion'
import { MissionStack } from '@aud-web/components/console/MissionStack'
import { ActivityStream } from '@aud-web/components/console/ActivityStream'
import { InsightPanel } from '@aud-web/components/console/InsightPanel'
import { AgentFooter } from '@aud-web/components/console/AgentFooter'
import { ContextPane } from '@aud-web/components/console/ContextPane'
import { AccessibilityToggle } from '@aud-web/components/ui/AccessibilityToggle'
import { PresenceAvatars } from '@aud-web/components/ui/PresenceAvatars'
import { ShareCampaignModal } from '@aud-web/components/ui/ShareCampaignModal'
import { usePresence } from '@aud-web/hooks/usePresence'
import { getSupabaseClient } from '@aud-web/lib/supabaseClient'
import { useState, useCallback, useEffect } from 'react'

export function ConsoleLayout() {
  const { currentTheme } = useTheme()
  const motion_config = useStudioMotion(currentTheme)

  const { campaignName, activePane, activeMode, showOperatorPalette, toggleOperatorPalette } =
    useConsoleStore()

  // Share modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  // Auth state
  const supabase = getSupabaseClient()
  const [currentUser, setCurrentUser] = useState<{
    id: string
    email?: string
    name?: string
  } | null>(null)
  const [currentCampaign, setCurrentCampaign] = useState<{ id: string; title: string } | null>(null)
  const [userRole, setUserRole] = useState<'owner' | 'editor' | 'viewer'>('viewer')

  // Fetch current user and campaign on mount
  useEffect(() => {
    const fetchAuthData = async () => {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setCurrentUser({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Operator',
        })

        // Get user's first campaign (for now - TODO: allow campaign selection)
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('id, title')
          .limit(1)
          .single()

        if (campaigns) {
          setCurrentCampaign({ id: campaigns.id, title: campaigns.title })

          // Get user's role for this campaign
          const { data: collaborator } = await supabase
            .from('campaign_collaborators')
            .select('role')
            .eq('campaign_id', campaigns.id)
            .eq('user_id', user.id)
            .single()

          if (collaborator) {
            setUserRole(collaborator.role as 'owner' | 'editor' | 'viewer')
          }
        }
      }
    }

    fetchAuthData()
  }, [])

  // Map activeMode to presence mode (filter out 'do' which doesn't exist in presence)
  const presenceMode: 'plan' | 'track' | 'learn' =
    activeMode === 'do' ? 'track' : ((activeMode || 'plan') as 'plan' | 'track' | 'learn')

  // Presence hook - track collaborators in real-time
  const { collaborators, isConnected } = usePresence(
    currentCampaign?.id || null,
    currentUser?.id || null,
    {
      theme: currentTheme,
      mode: presenceMode,
      calm_mode: false,
      user_email: currentUser?.email,
      user_name: currentUser?.name,
    }
  )

  // Custom events that can be added from ContextPane forms
  const [customEvents, setCustomEvents] = useState<
    Array<{ id: string; message: string; timestamp: Date }>
  >([])

  const handleAddEvent = useCallback((message: string) => {
    const newEvent = {
      id: crypto.randomUUID(),
      message,
      timestamp: new Date(),
    }
    setCustomEvents((prev) => [newEvent, ...prev])
  }, [])

  // Motion tokens (≤ 150ms for transitions as per spec)
  const transitionSpeed = Math.min(motion_config.duration, 0.15)

  return (
    <div
      className="console-layout"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridTemplateRows: '64px 1fr 48px',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--bg)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-primary)',
        fontSize: '16px',
        gap: 'var(--space-3)',
        padding: 'var(--space-3)',
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
          paddingInline: 'var(--space-4)',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--surface)',
        }}
      >
        {/* Brand */}
        <div
          style={{
            fontSize: '20px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: 'var(--accent)',
          }}
        >
          totalaud.io
        </div>

        {/* Campaign Name */}
        <div
          style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            letterSpacing: '0',
          }}
        >
          {campaignName || 'Untitled Campaign'}
        </div>

        {/* Right Side Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Presence Avatars */}
          <PresenceAvatars collaborators={collaborators} maxVisible={5} className="mr-2" />

          {/* Connection Status Indicator */}
          {isConnected && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
              }}
              title="Connected to presence channel"
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#4ADE80',
                  boxShadow: '0 0 4px rgba(74, 222, 128, 0.5)',
                }}
              />
              <span>Live</span>
            </div>
          )}

          {/* Share Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: `all ${transitionSpeed}s ease`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.color = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
            title="Share campaign with collaborators"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </button>

          {/* Operator Toggle */}
          <button
            onClick={toggleOperatorPalette}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: showOperatorPalette ? 'var(--accent)' : 'transparent',
              color: showOperatorPalette ? 'var(--bg)' : 'var(--text-secondary)',
              border: `1px solid ${showOperatorPalette ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: `all ${transitionSpeed}s ease`,
            }}
          >
            ⌘K
          </button>
        </div>
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
          gap: 'var(--space-3)',
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
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            opacity: activePane === 'mission' ? 1 : 0.6,
            transition: `opacity ${transitionSpeed}s ease`,
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              marginBottom: 'var(--space-4)',
              color: 'var(--accent)',
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
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            borderLeft: '1px solid rgba(58, 169, 190, 0.2)', // Slate Cyan accent divider
            borderRight: '1px solid rgba(58, 169, 190, 0.2)', // Slate Cyan accent divider
            padding: 'var(--space-4)',
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
                    fontSize: '20px',
                    fontWeight: 600,
                    marginBottom: 'var(--space-4)',
                    color: 'var(--accent)',
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
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            opacity: activePane === 'insight' ? 1 : 0.6,
            transition: `opacity ${transitionSpeed}s ease`,
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              marginBottom: 'var(--space-4)',
              color: 'var(--accent)',
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
          paddingInline: 'var(--space-4)',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--surface)',
          fontSize: '14px',
          color: 'var(--text-secondary)',
        }}
      >
        <AgentFooter />
      </motion.footer>

      {/* Share Campaign Modal */}
      {currentUser && currentCampaign && (
        <ShareCampaignModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          campaignId={currentCampaign.id}
          campaignTitle={currentCampaign.title || campaignName || 'Untitled Campaign'}
          currentUserId={currentUser.id}
          currentUserRole={userRole}
        />
      )}
    </div>
  )
}
