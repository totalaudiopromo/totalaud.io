/**
 * WorkflowProgress Component
 *
 * Visual indicator showing the suggested workflow path:
 * Ideas → Scout → Timeline → Pitch
 *
 * - Shows which modes have data (filled dot)
 * - Clickable to navigate between modes
 * - Subtle, doesn't block UI
 * - Responsive (collapses on mobile)
 */

'use client'

import { motion } from 'framer-motion'
import { useIdeasStore } from '@/stores/useIdeasStore'
import { useScoutStore } from '@/stores/useScoutStore'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { usePitchStore } from '@/stores/usePitchStore'

type WorkspaceMode = 'ideas' | 'scout' | 'timeline' | 'pitch'

interface WorkflowProgressProps {
  currentMode: WorkspaceMode
  onModeChange: (mode: WorkspaceMode) => void
}

interface ModeStep {
  key: WorkspaceMode
  label: string
  shortLabel: string
}

const WORKFLOW_STEPS: ModeStep[] = [
  { key: 'ideas', label: 'Ideas', shortLabel: 'Ideas' },
  { key: 'scout', label: 'Scout', shortLabel: 'Scout' },
  { key: 'timeline', label: 'Timeline', shortLabel: 'Plan' },
  { key: 'pitch', label: 'Pitch', shortLabel: 'Pitch' },
]

export function WorkflowProgress({ currentMode, onModeChange }: WorkflowProgressProps) {
  // Check each store for data
  const ideasCards = useIdeasStore((state) => state.cards)
  const scoutAddedToTimeline = useScoutStore((state) => state.addedToTimeline)
  const timelineEvents = useTimelineStore((state) => state.events)
  const pitchDrafts = usePitchStore((state) => state.drafts)

  // Determine which modes have meaningful data
  // Ideas: has non-starter cards
  const hasIdeasData = ideasCards.some((card) => !card.isStarter)
  // Scout: has opportunities added to timeline
  const hasScoutData = scoutAddedToTimeline.size > 0
  // Timeline: has non-sample events
  const hasTimelineData = timelineEvents.some((event) => !event.id.startsWith('sample-'))
  // Pitch: has drafts with content
  const hasPitchData = pitchDrafts.some((draft) =>
    draft.sections.some((section) => section.content.trim().length > 0)
  )

  const modeHasData: Record<WorkspaceMode, boolean> = {
    ideas: hasIdeasData,
    scout: hasScoutData,
    timeline: hasTimelineData,
    pitch: hasPitchData,
  }

  // Calculate progress percentage
  const completedSteps = Object.values(modeHasData).filter(Boolean).length
  const progressPercentage = (completedSteps / WORKFLOW_STEPS.length) * 100

  return (
    <div
      className="workflow-progress-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '8px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
      }}
    >
      {/* Progress bar background (hidden on very small screens) */}
      <div
        className="workflow-progress-bar"
        style={{
          position: 'absolute',
          top: '50%',
          left: 60,
          right: 60,
          height: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          borderRadius: 1,
          transform: 'translateY(-50%)',
          display: 'none', // Shown via CSS on larger screens
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: '100%',
            backgroundColor: 'rgba(58, 169, 190, 0.4)',
            borderRadius: 1,
          }}
        />
      </div>

      {/* Mode steps */}
      {WORKFLOW_STEPS.map((step, index) => {
        const hasData = modeHasData[step.key]
        const isCurrent = currentMode === step.key
        const isLast = index === WORKFLOW_STEPS.length - 1

        return (
          <div
            key={step.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <button
              onClick={() => onModeChange(step.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                backgroundColor: isCurrent ? 'rgba(58, 169, 190, 0.12)' : 'transparent',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              {/* Status dot */}
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: hasData
                    ? '#3AA9BE'
                    : isCurrent
                      ? 'rgba(58, 169, 190, 0.5)'
                      : 'rgba(255, 255, 255, 0.15)',
                  border: isCurrent && !hasData ? '1px solid rgba(58, 169, 190, 0.5)' : 'none',
                  transition: 'all 0.12s ease',
                  flexShrink: 0,
                }}
              />

              {/* Label */}
              <span
                className="workflow-step-label"
                style={{
                  fontSize: 12,
                  fontWeight: isCurrent ? 500 : 400,
                  color: isCurrent
                    ? '#3AA9BE'
                    : hasData
                      ? 'rgba(255, 255, 255, 0.7)'
                      : 'rgba(255, 255, 255, 0.4)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  transition: 'color 0.12s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </button>

            {/* Arrow connector (not on last item) */}
            {!isLast && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                style={{
                  color: 'rgba(255, 255, 255, 0.2)',
                  flexShrink: 0,
                }}
                className="workflow-arrow"
              >
                <path
                  d="M4.5 2.5L8 6L4.5 9.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        )
      })}

      {/* Responsive styles */}
      <style>{`
        .workflow-progress-container {
          position: relative;
        }

        /* Hide arrows and shorten labels on small screens */
        @media (max-width: 480px) {
          .workflow-arrow {
            display: none;
          }
          .workflow-step-label {
            font-size: 11px !important;
          }
        }

        /* Show progress bar on larger screens */
        @media (min-width: 640px) {
          .workflow-progress-bar {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}
