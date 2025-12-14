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
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { useIdeasStore } from '@/stores/useIdeasStore'
import { UserMenu } from '@/components/workspace/UserMenu'
import { MobileNav } from '@/components/workspace/MobileNav'
import { SidebarToggle } from '@/components/workspace/SidebarToggle'
import { SidebarOverlay } from '@/components/shared/SidebarOverlay'
import { TipBanner } from '@/components/onboarding'

// Dynamic imports for code splitting - each mode loads only when needed
const IdeasCanvas = dynamic(
  () => import('@/components/workspace/ideas').then((m) => ({ default: m.IdeasCanvas })),
  { ssr: false }
)
const IdeasList = dynamic(
  () => import('@/components/workspace/ideas').then((m) => ({ default: m.IdeasList })),
  { ssr: false }
)
const IdeasToolbar = dynamic(
  () => import('@/components/workspace/ideas').then((m) => ({ default: m.IdeasToolbar })),
  { ssr: false }
)
const TimelineCanvas = dynamic(
  () => import('@/components/workspace/timeline').then((m) => ({ default: m.TimelineCanvas })),
  { ssr: false }
)
const TimelineToolbar = dynamic(
  () => import('@/components/workspace/timeline').then((m) => ({ default: m.TimelineToolbar })),
  { ssr: false }
)
const NextSteps = dynamic(
  () => import('@/components/workspace/timeline').then((m) => ({ default: m.NextSteps })),
  { ssr: false }
)
const PitchCanvas = dynamic(
  () => import('@/components/workspace/pitch').then((m) => ({ default: m.PitchCanvas })),
  { ssr: false }
)
const PitchToolbar = dynamic(
  () => import('@/components/workspace/pitch').then((m) => ({ default: m.PitchToolbar })),
  { ssr: false }
)
const ScoutCalmToolbar = dynamic(
  () => import('@/components/workspace/scout').then((m) => ({ default: m.ScoutCalmToolbar })),
  { ssr: false }
)
const ScoutCalmGrid = dynamic(
  () => import('@/components/workspace/scout').then((m) => ({ default: m.ScoutCalmGrid })),
  { ssr: false }
)

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
            <TipBanner tipId="ideas" className="mx-4 mt-3" />
            <div style={{ flex: 1, minHeight: 0 }}>
              {ideasViewMode === 'canvas' ? <IdeasCanvas /> : <IdeasList />}
            </div>
          </div>
        )

      case 'timeline':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <TimelineToolbar />
            <TipBanner tipId="timeline" className="mx-4 mt-3" />
            <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 0 }}>
              {/* Main canvas */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <TimelineCanvas />
              </div>
              {/* Next Steps sidebar - hidden on mobile */}
              <div
                style={{
                  width: 280,
                  flexShrink: 0,
                  borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
                  padding: 16,
                  overflowY: 'auto',
                  display: 'none', // Hidden by default (mobile)
                }}
                className="timeline-sidebar"
              >
                <NextSteps maxItems={5} />
              </div>
              {/* CSS for responsive sidebar */}
              <style>{`
                @media (min-width: 1024px) {
                  .timeline-sidebar {
                    display: block !important;
                  }
                }
              `}</style>
            </div>
          </div>
        )

      case 'pitch':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <PitchToolbar />
            <TipBanner tipId="pitch" className="mx-4 mt-3" />
            <div style={{ flex: 1, minHeight: 0 }}>
              <PitchCanvas />
            </div>
          </div>
        )

      case 'scout':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <ScoutCalmToolbar />
            <TipBanner tipId="scout" className="mx-5 mt-3" />
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              <ScoutCalmGrid />
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
        {/* Logo - horizontal lockup with wordmark */}
        <Link href="/console" className="flex items-center gap-2 flex-shrink-0">
          <Image
            src="/brand/svg/lockup-horizontal-cyan.svg"
            alt="totalaud.io"
            width={160}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Mode tabs - hidden on mobile, visible on md+ */}
        <nav
          className="workspace-nav"
          style={{
            display: 'none', // Hidden by default (mobile)
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: 4,
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

        {/* User menu */}
        <div style={{ flexShrink: 0 }}>
          <UserMenu />
        </div>
      </header>

      {/* Main content - add bottom padding on mobile for MobileNav */}
      <main style={{ flex: 1, minHeight: 0 }} className="pb-14 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ height: '100%' }}
          >
            {renderModeContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom navigation */}
      <MobileNav mode={mode} onModeChange={handleModeChange} />

      {/* Floating sidebar toggle button */}
      <SidebarToggle />

      {/* Sidebar overlay */}
      <SidebarOverlay />

      {/* Responsive styles for nav */}
      <style>{`
        @media (min-width: 768px) {
          .workspace-nav {
            display: flex !important;
          }
        }
      `}</style>
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
