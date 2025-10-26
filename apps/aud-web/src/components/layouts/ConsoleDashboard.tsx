'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { Settings } from 'lucide-react'
import { ToolSwitcher, type Tool } from '@aud-web/components/ui/ToolSwitcher'
import { ThemeSelectorV2 } from '@aud-web/components/ui/ThemeSelectorV2'
import { PlanTab } from '@aud-web/components/features/workspace/PlanTab'
import { DoTab } from '@aud-web/components/features/workspace/DoTab'
import { TrackTab } from '@aud-web/components/features/workspace/TrackTab'
import { LearnTab } from '@aud-web/components/features/workspace/LearnTab'
import { InsightPanel } from '@aud-web/components/console/InsightPanel'
import { PresenceAvatars } from '@aud-web/components/ui/PresenceAvatars'
import { usePresence } from '@aud-web/hooks/usePresence'
import { getSupabaseClient } from '@aud-web/lib/supabaseClient'
import { playSound } from '@aud-web/tokens/sounds'
import type { OSTheme } from '@aud-web/types/themes'

type WorkspaceMode = 'plan' | 'do' | 'track' | 'learn'

/**
 * ConsoleDashboard - Unified Workspace
 *
 * Design Principles:
 * - Slate Cyan (#3AA9BE) accent throughout
 * - Matte Black (#0F1113) background
 * - Sharp 2px borders, minimal rounded corners
 * - 120/240/400ms motion rhythm
 * - Ambient pulse matching landing page
 * - No white flash, no cheap effects
 *
 * Layout:
 * - Left: Navigation Stack (Plan | Do | Track | Learn) + ToolSwitcher
 * - Center: Active Tool Viewport
 * - Right: Insights / Presence Pane
 * - Top-right: Theme selector button → inline modal
 */
export function ConsoleDashboard() {
  const prefersReducedMotion = useReducedMotion()
  const supabase = getSupabaseClient()

  // State
  const [currentTheme, setCurrentTheme] = useState<OSTheme>('operator')
  const [activeTool, setActiveTool] = useState<Tool>('intel')
  const [activeMode, setActiveMode] = useState<WorkspaceMode>('plan')
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<{
    id: string
    email?: string
    name?: string
  } | null>(null)

  // Ambient pulse (12s cycle like landing page)
  const [pulsePhase, setPulsePhase] = useState(0)
  useEffect(() => {
    if (prefersReducedMotion) return

    const interval = setInterval(() => {
      setPulsePhase((p) => (p + 1) % 360)
    }, 12000 / 360)
    return () => clearInterval(interval)
  }, [prefersReducedMotion])

  const bgOpacity = prefersReducedMotion
    ? 0.04
    : 0.04 + Math.sin((pulsePhase * Math.PI) / 180) * 0.02

  // Get theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('selected_theme') as OSTheme
      if (savedTheme) {
        setCurrentTheme(savedTheme)
      }
    }
  }, [])

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setCurrentUser({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Operator',
        })
      }
    }

    fetchUser()
  }, [])

  // Presence tracking
  const { collaborators, isConnected } = usePresence(null, currentUser?.id || null, {
    theme: currentTheme,
    mode: activeMode === 'do' ? 'track' : activeMode,
    calm_mode: false,
    user_email: currentUser?.email,
    user_name: currentUser?.name,
  })

  // Handle mode change
  const handleModeChange = useCallback((mode: WorkspaceMode) => {
    setActiveMode(mode)
    playSound('task-armed', { volume: 0.08 })
  }, [])

  // Handle tool change
  const handleToolChange = useCallback((tool: Tool) => {
    setActiveTool(tool)
  }, [])

  // Handle theme selection
  const handleThemeSelect = useCallback((theme: OSTheme) => {
    setCurrentTheme(theme)
    localStorage.setItem('selected_theme', theme)
    setIsThemeSelectorOpen(false)
    playSound('success-soft', { volume: 0.12 })
  }, [])

  // Mode tabs
  const modes: Array<{ id: WorkspaceMode; label: string }> = [
    { id: 'plan', label: 'Plan' },
    { id: 'do', label: 'Do' },
    { id: 'track', label: 'Track' },
    { id: 'learn', label: 'Learn' },
  ]

  // Render active tab content
  const renderActiveContent = () => {
    // Note: Tool prop not currently used by tabs, but passed for future enhancement
    switch (activeMode) {
      case 'plan':
        return <PlanTab />
      case 'do':
        return <DoTab />
      case 'track':
        return <TrackTab />
      case 'learn':
        return <LearnTab />
    }
  }

  return (
    <div
      className="console-dashboard"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: '#0F1113', // Matte Black
        color: '#ffffff',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glow (12s pulse) */}
      <motion.div
        className="ambient-glow"
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 50%, rgba(58, 169, 190, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        animate={{
          opacity: bgOpacity,
        }}
        transition={{
          duration: 12,
          ease: 'linear',
          repeat: Infinity,
        }}
      />

      {/* Main layout grid */}
      <div
        className="layout-grid"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: '280px 1fr 320px',
          gridTemplateRows: '64px 1fr 48px',
          height: '100vh',
          gap: '0.75rem',
          padding: '0.75rem',
        }}
      >
        {/* ========================================
            HEADER
            ======================================== */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '2px solid rgba(58, 169, 190, 0.1)',
          }}
        >
          {/* Brand */}
          <div
            style={{
              fontSize: '1.125rem',
              fontWeight: 500,
              letterSpacing: '0.5px',
              color: '#3AA9BE',
            }}
          >
            totalaud.io
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Presence avatars */}
            {collaborators.length > 0 && (
              <PresenceAvatars collaborators={collaborators} maxVisible={4} />
            )}

            {/* Connection indicator */}
            {isConnected && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#3AA9BE',
                    boxShadow: '0 0 8px rgba(58, 169, 190, 0.6)',
                  }}
                />
                <span>Live</span>
              </div>
            )}

            {/* Theme selector button */}
            <motion.button
              onClick={() => setIsThemeSelectorOpen(true)}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '2px solid rgba(58, 169, 190, 0.15)',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.875rem',
                fontWeight: 500,
                letterSpacing: '0.3px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              whileHover={{
                borderColor: 'rgba(58, 169, 190, 0.4)',
                color: '#3AA9BE',
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.12 }}
            >
              <Settings size={16} />
              Theme
            </motion.button>
          </div>
        </motion.header>

        {/* ========================================
            LEFT SIDEBAR - Navigation + Tools
            ======================================== */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            gridColumn: '1',
            gridRow: '2 / 3',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            overflow: 'auto',
          }}
        >
          {/* Mode navigation */}
          <div
            style={{
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '2px solid rgba(58, 169, 190, 0.1)',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.4)',
                marginBottom: '1rem',
              }}
            >
              Workspace
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {modes.map((mode) => {
                const isActive = mode.id === activeMode

                return (
                  <motion.button
                    key={mode.id}
                    onClick={() => handleModeChange(mode.id)}
                    style={{
                      padding: '0.75rem 1rem',
                      background: isActive ? 'rgba(58, 169, 190, 0.08)' : 'transparent',
                      border: `2px solid ${isActive ? 'rgba(58, 169, 190, 0.3)' : 'transparent'}`,
                      borderLeft: isActive ? '3px solid #3AA9BE' : '3px solid transparent',
                      color: isActive ? '#3AA9BE' : 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 500 : 400,
                      letterSpacing: '0.4px',
                      textAlign: 'left',
                      cursor: isActive ? 'default' : 'pointer',
                    }}
                    whileHover={
                      !isActive
                        ? {
                            x: 4,
                            backgroundColor: 'rgba(58, 169, 190, 0.04)',
                            borderColor: 'rgba(58, 169, 190, 0.15)',
                          }
                        : {}
                    }
                    whileTap={!isActive ? { scale: 0.98 } : {}}
                    transition={{ duration: 0.12 }}
                  >
                    {mode.label}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Tool switcher */}
          <ToolSwitcher activeTool={activeTool} onToolChange={handleToolChange} />
        </motion.aside>

        {/* ========================================
            CENTER - Active Tool Viewport
            ======================================== */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            gridColumn: '2',
            gridRow: '2 / 3',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '2px solid rgba(58, 169, 190, 0.15)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Tool viewport header */}
          <div
            style={{
              padding: '1rem 1.5rem',
              borderBottom: '2px solid rgba(58, 169, 190, 0.1)',
              background: 'rgba(255, 255, 255, 0.01)',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              {activeMode} Mode — {activeTool}
            </div>
          </div>

          {/* Active content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeMode}-${activeTool}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.24 }}
                style={{ height: '100%' }}
              >
                {renderActiveContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.main>

        {/* ========================================
            RIGHT SIDEBAR - Insights / Presence
            ======================================== */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          style={{
            gridColumn: '3',
            gridRow: '2 / 3',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '2px solid rgba(58, 169, 190, 0.1)',
            overflow: 'auto',
            padding: '1.5rem',
          }}
        >
          <h2
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              letterSpacing: '0.5px',
              color: '#3AA9BE',
              marginBottom: '1.5rem',
            }}
          >
            Insights
          </h2>
          <InsightPanel />
        </motion.aside>

        {/* ========================================
            FOOTER - Status Bar
            ======================================== */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '2px solid rgba(58, 169, 190, 0.1)',
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.4)',
            letterSpacing: '0.3px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
              <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>Session Active</span>
            </div>
            <div>
              <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>Theme:</span>{' '}
              <span style={{ color: '#3AA9BE', fontWeight: 500 }}>{currentTheme}</span>
            </div>
          </div>
          <div>
            {new Date().toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </motion.footer>
      </div>

      {/* ========================================
          THEME SELECTOR MODAL
          ======================================== */}
      <AnimatePresence>
        {isThemeSelectorOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                zIndex: 100,
              }}
              onClick={() => setIsThemeSelectorOpen(false)}
            />

            {/* Theme selector */}
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 101,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  pointerEvents: 'auto',
                }}
              >
                <ThemeSelectorV2
                  onSelect={handleThemeSelect}
                  initialTheme={currentTheme}
                  autoFocus={true}
                />
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
