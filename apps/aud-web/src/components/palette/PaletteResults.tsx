'use client'

/**
 * Phase 33: Global Command Palette - Results Component
 *
 * Handles keyboard navigation and rendering grouped results.
 * Arrow keys, Enter to select, smooth scrolling.
 */

import { useState, useEffect, useRef } from 'react'
import { PaletteSection } from './PaletteSection'
import { PaletteActionItem } from './PaletteActionItem'
import type { SearchResult } from '@/lib/palette/types'

interface PaletteResultsProps {
  groups: Array<{
    label: string
    results: SearchResult[]
  }>
  onSelect: (result: SearchResult) => void
  query: string
}

export function PaletteResults({ groups, onSelect, query }: PaletteResultsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  // Flatten results for keyboard navigation
  const flatResults = groups.flatMap((group) => group.results)

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (flatResults.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = flatResults[selectedIndex]
        if (selected) {
          onSelect(selected)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [flatResults, selectedIndex, onSelect])

  // Scroll selected item into view
  useEffect(() => {
    const selectedButton = itemRefs.current.get(selectedIndex)
    if (selectedButton && scrollRef.current) {
      const container = scrollRef.current
      const button = selectedButton

      const containerTop = container.scrollTop
      const containerBottom = containerTop + container.clientHeight
      const buttonTop = button.offsetTop
      const buttonBottom = buttonTop + button.clientHeight

      if (buttonTop < containerTop) {
        container.scrollTop = buttonTop - 8
      } else if (buttonBottom > containerBottom) {
        container.scrollTop = buttonBottom - container.clientHeight + 8
      }
    }
  }, [selectedIndex])

  // Empty state
  if (flatResults.length === 0) {
    return (
      <div
        style={{
          padding: '3rem 1rem',
          textAlign: 'center',
          color: 'var(--colour-muted)',
          fontSize: '14px',
        }}
      >
        {query ? `No results for "${query}"` : 'Start typing to search...'}
      </div>
    )
  }

  // Render grouped results
  let currentFlatIndex = 0

  return (
    <div
      ref={scrollRef}
      style={{
        maxHeight: '400px',
        overflowY: 'auto',
        padding: '0.5rem 0',
      }}
    >
      {groups.map((group, groupIndex) => (
        <PaletteSection key={group.label} label={group.label}>
          {group.results.map((result, resultIndex) => {
            const flatIndex = currentFlatIndex++
            return (
              <div
                key={result.id}
                ref={(el) => {
                  if (el) {
                    itemRefs.current.set(flatIndex, el as any)
                  } else {
                    itemRefs.current.delete(flatIndex)
                  }
                }}
              >
                <PaletteActionItem
                  title={result.title}
                  subtitle={result.subtitle}
                  icon={result.icon}
                  isSelected={flatIndex === selectedIndex}
                  onClick={() => onSelect(result)}
                  onMouseEnter={() => setSelectedIndex(flatIndex)}
                />
              </div>
            )
          })}
        </PaletteSection>
      ))}
    </div>
  )
}
