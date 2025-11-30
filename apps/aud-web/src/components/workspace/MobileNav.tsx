/**
 * MobileNav Component
 *
 * Fixed bottom navigation bar for mobile devices.
 * iOS/Android app-style navigation with four workspace modes.
 * Hidden on desktop (md breakpoint and above).
 */

'use client'

import { motion } from 'framer-motion'

type WorkspaceMode = 'ideas' | 'scout' | 'timeline' | 'pitch'

interface MobileNavProps {
  mode: WorkspaceMode
  onModeChange: (mode: WorkspaceMode) => void
}

const MODES: { key: WorkspaceMode; label: string; icon: React.ReactNode }[] = [
  {
    key: 'ideas',
    label: 'Ideas',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 2C6.13 2 3 5.13 3 9c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm2 13H8v-1h4v1zm1.21-3.39l-.71.5V14H7.5v-1.89l-.71-.5A5.01 5.01 0 015 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-1.79 4.11z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    key: 'scout',
    label: 'Scout',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 3a5 5 0 100 10A5 5 0 008 3zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    key: 'timeline',
    label: 'Timeline',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    key: 'pitch',
    label: 'Pitch',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6zm2 2h4v2H8V6zm0 4h4v2H8v-2z"
          fill="currentColor"
        />
      </svg>
    ),
  },
]

export function MobileNav({ mode, onModeChange }: MobileNavProps) {
  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(15, 17, 19, 0.98)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {MODES.map((modeConfig) => {
        const isActive = mode === modeConfig.key

        return (
          <button
            key={modeConfig.key}
            onClick={() => onModeChange(modeConfig.key)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              minWidth: 64,
            }}
          >
            <span
              style={{
                color: isActive ? '#3AA9BE' : 'rgba(255, 255, 255, 0.5)',
                transition: 'color 0.12s ease',
              }}
            >
              {modeConfig.icon}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#3AA9BE' : 'rgba(255, 255, 255, 0.5)',
                fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
                transition: 'color 0.12s ease',
              }}
            >
              {modeConfig.label}
            </span>

            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="mobile-nav-indicator"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32,
                  height: 2,
                  backgroundColor: '#3AA9BE',
                  borderRadius: 1,
                }}
                transition={{ duration: 0.12 }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
