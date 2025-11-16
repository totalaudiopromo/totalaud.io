/**
 * Showreel Chapter List
 * Phase 17: Scene navigation sidebar
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ShowreelScene } from '@totalaud/showreel'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'

interface ShowreelChapterListProps {
  scenes: ShowreelScene[]
  currentSceneIndex: number
  onGoToScene: (index: number) => void
}

export function ShowreelChapterList({
  scenes,
  currentSceneIndex,
  onGoToScene,
}: ShowreelChapterListProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        right: isExpanded ? '0' : '-280px',
        transform: 'translateY(-50%)',
        transition: 'right 240ms ease',
        pointerEvents: 'auto',
      }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          position: 'absolute',
          left: '-40px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '80px',
          backgroundColor: `${flowCoreColours.matteBlack}e6`,
          border: `1px solid ${flowCoreColours.borderSubtle}`,
          borderRight: 'none',
          borderTopLeftRadius: '8px',
          borderBottomLeftRadius: '8px',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 120ms ease',
        }}
        aria-label={isExpanded ? 'Collapse chapters' : 'Expand chapters'}
      >
        {isExpanded ? (
          <ChevronRight size={20} strokeWidth={2} style={{ color: flowCoreColours.textSecondary }} />
        ) : (
          <ChevronLeft size={20} strokeWidth={2} style={{ color: flowCoreColours.textSecondary }} />
        )}
      </button>

      {/* Chapter list */}
      <div
        style={{
          width: '280px',
          maxHeight: '70vh',
          overflowY: 'auto',
          backgroundColor: `${flowCoreColours.matteBlack}e6`,
          border: `1px solid ${flowCoreColours.borderSubtle}`,
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          padding: '16px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: flowCoreColours.textTertiary,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '12px',
          }}
        >
          Chapters
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {scenes.map((scene, index) => (
            <button
              key={scene.id}
              onClick={() => onGoToScene(index)}
              style={{
                padding: '12px 16px',
                backgroundColor:
                  index === currentSceneIndex
                    ? `${flowCoreColours.slateCyan}20`
                    : 'transparent',
                border: `1px solid ${
                  index === currentSceneIndex
                    ? flowCoreColours.slateCyan
                    : flowCoreColours.borderSubtle
                }`,
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
              aria-label={`Go to ${scene.title}`}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor:
                      index === currentSceneIndex
                        ? flowCoreColours.slateCyan
                        : `${flowCoreColours.textTertiary}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    color:
                      index === currentSceneIndex
                        ? flowCoreColours.matteBlack
                        : flowCoreColours.textSecondary,
                  }}
                >
                  {index + 1}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color:
                      index === currentSceneIndex
                        ? flowCoreColours.slateCyan
                        : flowCoreColours.textPrimary,
                  }}
                >
                  {scene.title}
                </div>
              </div>
              {scene.subtitle && (
                <div
                  style={{
                    fontSize: '12px',
                    color: flowCoreColours.textSecondary,
                    paddingLeft: '36px',
                  }}
                >
                  {scene.subtitle}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
