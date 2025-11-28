/**
 * Workspace Page
 *
 * Calm Creative Workspace (November 2025 Pivot)
 *
 * A calm, minimal workspace with four core modes:
 * - Ideas (capture and organise creative/marketing ideas)
 * - Scout (discover real opportunities - playlists, blogs, radio, press)
 * - Timeline (plan release and creative actions visually)
 * - Pitch (craft narratives, descriptions, and bios)
 */

'use client'

import { useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { IdeasCanvas, IdeasList, IdeasToolbar } from '@/components/workspace/ideas'
import { useIdeasStore } from '@/stores/useIdeasStore'
import { TimelineCanvas, TimelineToolbar } from '@/components/workspace/timeline'
import { PitchCanvas, PitchToolbar } from '@/components/workspace/pitch'
import { ScoutToolbar, ScoutGrid } from '@/components/workspace/scout'

type WorkspaceMode = 'ideas' | 'scout' | 'timeline' | 'pitch'

const MODES: { key: WorkspaceMode; label: string; available: boolean }[] = [
  { key: 'ideas', label: 'Ideas', available: true },
  { key: 'scout', label: 'Scout', available: true },
  { key: 'timeline', label: 'Timeline', available: true },
  { key: 'pitch', label: 'Pitch', available: true },
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

  // Get view mode from Ideas store
  const ideasViewMode = useIdeasStore((state) => state.viewMode)

  const renderModeContent = () => {
    switch (mode) {
      case 'ideas':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <IdeasToolbar />
            <div style={{ flex: 1, minHeight: 0 }}>
              {ideasViewMode === 'canvas' ? <IdeasCanvas /> : <IdeasList />}
            </div>
          </div>
        )

      case 'timeline':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <TimelineToolbar />
            <div style={{ flex: 1, minHeight: 0 }}>
              <TimelineCanvas />
            </div>
          </div>
        )

      case 'pitch':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <PitchToolbar />
            <div style={{ flex: 1, minHeight: 0 }}>
              <PitchCanvas />
            </div>
          </div>
        )

      case 'scout':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <ScoutToolbar />
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              <ScoutGrid />
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
          padding: '0 16px',
          height: 56,
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: 'rgba(15, 17, 19, 0.95)',
          backdropFilter: 'blur(8px)',
          gap: 12,
        }}
      >
        {/* Logo - hidden on mobile to save space */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#3AA9BE',
              fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
            }}
          >
            totalaud.io
          </span>
        </div>

        {/* Mode tabs - scrollable on mobile */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            flex: 1,
            justifyContent: 'center',
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
                padding: '8px 12px',
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
                whiteSpace: 'nowrap',
                flexShrink: 0,
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
