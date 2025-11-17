'use client'

/**
 * Phase 33: Global Command Palette - Main Component
 *
 * Superhuman/Linear-style command palette for totalaud.io.
 * British tone, calm design, cross-surface creative switcher.
 */

import { useEffect, useMemo } from 'react'
import { useCommandPalette } from '@/hooks/palette/useCommandPalette'
import { PaletteInput } from './PaletteInput'
import { PaletteResults } from './PaletteResults'
import { getDefaultCommands, getVisibleCommands } from '@/lib/palette/registry'
import { filterCommands, groupResults } from '@/lib/palette/search'
import type { SearchResult } from '@/lib/palette/types'

export function CommandPalette() {
  const {
    isOpen,
    query,
    setQuery,
    context,
    closePalette,
    registerCommand,
  } = useCommandPalette()

  // Register default commands on mount
  useEffect(() => {
    const defaultCommands = getDefaultCommands()
    defaultCommands.forEach((cmd) => registerCommand(cmd))
  }, [registerCommand])

  // Get all registered commands
  const allCommands = useMemo(() => getDefaultCommands(), [])

  // Filter by context visibility
  const visibleCommands = useMemo(
    () => getVisibleCommands(allCommands, context),
    [allCommands, context]
  )

  // Filter and score by query
  const results = useMemo(
    () => filterCommands(visibleCommands, query),
    [visibleCommands, query]
  )

  // Group results
  const groups = useMemo(() => groupResults(results), [results])

  // Handle result selection
  function handleSelect(result: SearchResult) {
    result.action()
    closePalette()
  }

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      closePalette()
    }
  }

  if (!isOpen) return null

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '10vh 1rem 1rem 1rem',
        zIndex: 9999,
        animation: 'fadeIn 240ms ease-out',
      }}
    >
      {/* Modal */}
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: 'var(--colour-surface)',
          borderRadius: '16px',
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1), 0 20px 60px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          animation: 'slideDown 240ms ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <PaletteInput
          value={query}
          onChange={setQuery}
          placeholder="Search or type a command..."
          autoFocus
        />

        {/* Results */}
        <PaletteResults
          groups={groups}
          onSelect={handleSelect}
          query={query}
        />

        {/* Footer Hint */}
        <div
          style={{
            padding: '0.75rem 1rem',
            borderTop: '1px solid var(--colour-border)',
            display: 'flex',
            gap: '1rem',
            fontSize: '11px',
            color: 'var(--colour-muted)',
          }}
        >
          <div>
            <kbd
              style={{
                padding: '0.125rem 0.375rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(var(--colour-accent-rgb), 0.1)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              ↑↓
            </kbd>{' '}
            Navigate
          </div>
          <div>
            <kbd
              style={{
                padding: '0.125rem 0.375rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(var(--colour-accent-rgb), 0.1)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              ↵
            </kbd>{' '}
            Select
          </div>
          <div>
            <kbd
              style={{
                padding: '0.125rem 0.375rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(var(--colour-accent-rgb), 0.1)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Esc
            </kbd>{' '}
            Close
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          div {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
