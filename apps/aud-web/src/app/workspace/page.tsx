/**
 * Workspace Page
 *
 * Phase 6: MVP Pivot - Unified Workspace
 *
 * A calm, modern workspace with mode-switching tabs:
 * - Scout (discovery)
 * - Ideas (canvas)
 * - Timeline (planner)
 * - Pitch (story builder)
 * - Analytics (dashboard)
 */

'use client'

import { useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { IdeasCanvas, IdeasToolbar } from '@/components/workspace/ideas'

type WorkspaceMode = 'scout' | 'ideas' | 'timeline' | 'pitch' | 'analytics'

const MODES: { key: WorkspaceMode; label: string; icon: string; available: boolean }[] = [
  { key: 'scout', label: 'Scout', icon: '🔍', available: false },
  { key: 'ideas', label: 'Ideas', icon: '💡', available: true },
  { key: 'timeline', label: 'Timeline', icon: '📅', available: false },
  { key: 'pitch', label: 'Pitch', icon: '📝', available: false },
  { key: 'analytics', label: 'Analytics', icon: '📊', available: false },
]

function WorkspaceContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get mode from URL or default to 'ideas'
  const modeParam = searchParams?.get('mode') as WorkspaceMode | null
  const [mode, setMode] = useState<WorkspaceMode>(
    modeParam && MODES.find((m) => m.key === modeParam)?.available ? modeParam : 'ideas'
  )

  const handleModeChange = useCallback(
    (newMode: WorkspaceMode) => {
      const modeConfig = MODES.find((m) => m.key === newMode)
      if (!modeConfig?.available) return

      setMode(newMode)
      router.push(`/workspace?mode=${newMode}`, { scroll: false })
    },
    [router]
  )

  const renderModeContent = () => {
    switch (mode) {
      case 'ideas':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <IdeasToolbar />
            <div style={{ flex: 1, minHeight: 0 }}>
              <IdeasCanvas />
            </div>
          </div>
        )

      case 'scout':
      case 'timeline':
      case 'pitch':
      case 'analytics':
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(58, 169, 190, 0.1)',
                border: '1px dashed rgba(58, 169, 190, 0.3)',
                borderRadius: 16,
                fontSize: 28,
              }}
            >
              {MODES.find((m) => m.key === mode)?.icon}
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
                }}
              >
                {MODES.find((m) => m.key === mode)?.label} Mode
              </h2>
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: 14,
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
                }}
              >
                Coming soon
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#0F1113',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: 56,
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: 'rgba(15, 17, 19, 0.95)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#3AA9BE',
              fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
            }}
          >
            totalaud.io
          </span>
          <span
            style={{
              fontSize: 11,
              padding: '2px 8px',
              backgroundColor: 'rgba(58, 169, 190, 0.15)',
              border: '1px solid rgba(58, 169, 190, 0.2)',
              borderRadius: 4,
              color: '#3AA9BE',
              fontWeight: 500,
              textTransform: 'lowercase',
              fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
            }}
          >
            workspace
          </span>
        </div>

        {/* Mode tabs */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {MODES.map((modeConfig) => (
            <button
              key={modeConfig.key}
              onClick={() => handleModeChange(modeConfig.key)}
              disabled={!modeConfig.available}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                backgroundColor:
                  mode === modeConfig.key ? 'rgba(58, 169, 190, 0.15)' : 'transparent',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: mode === modeConfig.key ? 500 : 400,
                color: !modeConfig.available
                  ? 'rgba(255, 255, 255, 0.25)'
                  : mode === modeConfig.key
                    ? '#3AA9BE'
                    : 'rgba(255, 255, 255, 0.6)',
                cursor: modeConfig.available ? 'pointer' : 'not-allowed',
                transition: 'all 0.12s ease',
                fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
                position: 'relative',
              }}
            >
              {modeConfig.label}
              {mode === modeConfig.key && (
                <motion.div
                  layoutId="mode-indicator"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 24,
                    height: 2,
                    backgroundColor: '#3AA9BE',
                    borderRadius: 1,
                  }}
                  transition={{ duration: 0.12 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Spacer for balance */}
        <div style={{ width: 120 }} />
      </header>

      {/* Main content */}
      <main style={{ flex: 1, minHeight: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{ height: '100%' }}
          >
            {renderModeContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#0F1113',
            color: 'rgba(255, 255, 255, 0.5)',
            fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
          }}
        >
          Loading workspace...
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  )
}
