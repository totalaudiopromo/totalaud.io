'use client'

/**
 * XP OS Page - Agent Monitor (Phase 29 Polished)
 * Supports director focus on agent runs
 * Uses design tokens with Windows XP glossy aesthetic
 */

import { useEffect, useState } from 'react'
import { useDirector } from '@/components/demo/director/DirectorProvider'
import { useOptionalAmbient } from '@/components/ambient/AmbientEngineProvider'
import { Activity, CheckCircle2, Clock } from 'lucide-react'
import { spacing, radii, shadows } from '@/styles/tokens'
import { duration, easing, prefersReducedMotion } from '@/styles/motion'

// XP OS specific colours (glossy Windows XP aesthetic)
const XP_BG_FROM = '#3A6EA5'
const XP_BG_TO = '#004E8C'
const XP_TASKBAR_FROM = '#245EDC'
const XP_TASKBAR_TO = '#3A8BF5'
const XP_PANEL_BG = 'rgba(255, 255, 255, 0.1)'
const XP_PANEL_BG_HOVER = 'rgba(255, 255, 255, 0.15)'
const XP_PANEL_BORDER = 'rgba(255, 255, 255, 0.1)'
const XP_PANEL_ACTIVE_BG = 'rgba(255, 255, 255, 0.2)'
const XP_PANEL_ACTIVE_BORDER = 'rgba(255, 255, 255, 0.4)'
const XP_TEXT = '#FFFFFF'
const XP_TEXT_DIM = 'rgba(255, 255, 255, 0.6)'
const XP_SUCCESS = '#4ADE80'
const XP_WARNING = '#FBBF24'
const XP_ERROR = '#9CA3AF'

interface AgentRun {
  id: string
  agent: string
  prompt: string
  status: 'running' | 'done' | 'pending'
  result?: string
  timestamp: Date
}

const DEMO_RUNS: AgentRun[] = [
  {
    id: 'run-1',
    agent: 'coach',
    prompt: 'Suggest an announcement plan for the "Midnight Signals" EP.',
    status: 'done',
    result: `# EP Announcement Strategy

**Pre-Launch (2 weeks before)**
- Teaser campaign on social media (midnight-themed visuals)
- Share behind-the-scenes studio moments
- Build anticipation with countdown posts

**Launch Day**
- Full EP release across all platforms
- Instagram/TikTok premiere event
- Email announcement to mailing list

**Post-Launch (Week 1-2)**
- Track-by-track breakdown content
- Fan reactions and reviews sharing
- Playlist submissions to curators

**Key Themes**: Urban nightscapes, creative solitude, neon aesthetics`,
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: 'run-2',
    agent: 'scout',
    prompt: 'Find similar artists and playlists',
    status: 'running',
    timestamp: new Date(Date.now() - 30000),
  },
]

export function XPOSPage() {
  const director = useDirector()
  const ambient = useOptionalAmbient()
  const [runs, setRuns] = useState<AgentRun[]>(DEMO_RUNS)
  const [activeRunId, setActiveRunId] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const shouldAnimate = !prefersReducedMotion()

  // Trigger entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Register director callback
  useEffect(() => {
    director.engine.setCallbacks({
      onFocusXpAgentRun: () => {
        // Play highlight sound
        if (ambient) {
          ambient.playEffect('highlight')
        }

        // Find last completed run
        const lastCompleted = runs.find((run) => run.status === 'done')
        if (lastCompleted) {
          setActiveRunId(lastCompleted.id)
        }
      },
    })
  }, [director, ambient, runs])

  const activeRun = runs.find((run) => run.id === activeRunId)

  return (
    <div
      className="w-full h-full overflow-auto"
      style={{
        background: `linear-gradient(to bottom right, ${XP_BG_FROM}, ${XP_BG_TO})`,
        color: XP_TEXT,
        padding: spacing[8],
        // OS transition animation
        opacity: shouldAnimate ? (isVisible ? 1 : 0) : 1,
        transform: shouldAnimate ? (isVisible ? 'scale(1)' : 'scale(0.98)') : 'scale(1)',
        transition: shouldAnimate
          ? `opacity ${duration.medium}s ${easing.default}, transform ${duration.medium}s ${easing.default}`
          : 'none',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{
          backgroundColor: XP_PANEL_BG,
          backdropFilter: 'blur(12px)',
          borderTopLeftRadius: radii.lg,
          borderTopRightRadius: radii.lg,
          padding: `${spacing[2]} ${spacing[4]}`,
          marginBottom: spacing[4],
        }}
      >
        <div className="flex items-center" style={{ gap: spacing[2] }}>
          <Activity className="w-5 h-5" />
          <span style={{ fontWeight: '700' }}>Agent Monitor</span>
        </div>
        <span
          style={{
            fontSize: '12px',
            opacity: 0.6,
          }}
        >
          {runs.length} runs
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: spacing[4] }}>
        {/* Runs list */}
        <div className="lg:col-span-1" style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          <h2
            style={{
              fontSize: '14px',
              fontWeight: '700',
              marginBottom: spacing[3],
              opacity: 0.6,
              letterSpacing: '0.05em',
            }}
          >
            AGENT RUNS
          </h2>
          {runs.map((run) => {
            const isActive = run.id === activeRunId

            return (
              <button
                key={run.id}
                onClick={() => setActiveRunId(run.id)}
                className="w-full text-left hover:scale-[1.02]"
                style={{
                  padding: spacing[3],
                  borderRadius: radii.lg,
                  // Fade in active state over duration.fast with smooth scale
                  transition: shouldAnimate
                    ? `background-color ${duration.fast}s ${easing.default},
                       border-color ${duration.fast}s ${easing.default},
                       box-shadow ${duration.fast}s ${easing.default},
                       transform ${duration.fast}s ${easing.default}`
                    : 'none',
                  backgroundColor: isActive ? XP_PANEL_ACTIVE_BG : XP_PANEL_BG,
                  border: isActive ? `2px solid ${XP_PANEL_ACTIVE_BORDER}` : `1px solid ${XP_PANEL_BORDER}`,
                  boxShadow: isActive ? shadows.medium : 'none',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {/* Status icon */}
                <div className="flex items-center" style={{ gap: spacing[2], marginBottom: spacing[2] }}>
                  {run.status === 'done' && <CheckCircle2 className="w-4 h-4" style={{ color: XP_SUCCESS }} />}
                  {run.status === 'running' && (
                    <Clock
                      className="w-4 h-4 animate-spin"
                      style={{
                        color: XP_WARNING,
                        animation: `spin ${duration.slow * 2}s linear infinite`,
                      }}
                    />
                  )}
                  {run.status === 'pending' && <Clock className="w-4 h-4" style={{ color: XP_ERROR }} />}
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {run.agent}
                  </span>
                </div>

                {/* Prompt preview */}
                <p
                  className="line-clamp-2"
                  style={{
                    fontSize: '12px',
                    opacity: 0.7,
                    lineHeight: '1.4',
                  }}
                >
                  {run.prompt}
                </p>

                {/* Timestamp */}
                <p
                  style={{
                    fontSize: '10px',
                    opacity: 0.5,
                    marginTop: spacing[1],
                  }}
                >
                  {run.timestamp.toLocaleTimeString()}
                </p>
              </button>
            )
          })}
        </div>

        {/* Run details */}
        <div className="lg:col-span-2">
          {activeRun ? (
            <div
              style={{
                backgroundColor: XP_PANEL_BG,
                backdropFilter: 'blur(12px)',
                borderRadius: radii.lg,
                padding: spacing[6],
              }}
            >
              <div
                className="flex items-start justify-between"
                style={{
                  marginBottom: spacing[4],
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: '700',
                    }}
                  >
                    {activeRun.agent} Agent
                  </h3>
                  <p
                    style={{
                      fontSize: '14px',
                      opacity: 0.6,
                      marginTop: spacing[1],
                    }}
                  >
                    {activeRun.prompt}
                  </p>
                </div>
                <div className="flex items-center" style={{ gap: spacing[2] }}>
                  {activeRun.status === 'done' && (
                    <span
                      style={{
                        padding: `${spacing[1]} ${spacing[2]}`,
                        backgroundColor: 'rgba(74, 222, 128, 0.2)',
                        color: XP_SUCCESS,
                        fontSize: '12px',
                        borderRadius: radii.sm,
                      }}
                    >
                      ✓ Complete
                    </span>
                  )}
                  {activeRun.status === 'running' && (
                    <span
                      style={{
                        padding: `${spacing[1]} ${spacing[2]}`,
                        backgroundColor: 'rgba(251, 191, 36, 0.2)',
                        color: XP_WARNING,
                        fontSize: '12px',
                        borderRadius: radii.sm,
                      }}
                    >
                      ⏳ Processing
                    </span>
                  )}
                </div>
              </div>

              {/* Result */}
              {activeRun.result && (
                <div
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: radii.lg,
                    padding: spacing[4],
                  }}
                >
                  <pre
                    style={{
                      fontSize: '14px',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'system-ui, sans-serif',
                      lineHeight: '1.6',
                    }}
                  >
                    {activeRun.result}
                  </pre>
                </div>
              )}

              {activeRun.status === 'running' && (
                <div
                  className="flex items-center"
                  style={{
                    gap: spacing[3],
                    fontSize: '14px',
                    opacity: 0.6,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: radii.full,
                      height: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      className="animate-pulse"
                      style={{
                        height: '100%',
                        backgroundColor: XP_WARNING,
                        width: '66%',
                        animation: `pulse ${duration.slow}s ${easing.smooth} infinite`,
                      }}
                    />
                  </div>
                  <span>Processing...</span>
                </div>
              )}
            </div>
          ) : (
            <div
              className="text-center"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: radii.lg,
                padding: spacing[12],
              }}
            >
              <Activity className="w-12 h-12 mx-auto" style={{ marginBottom: spacing[4], opacity: 0.3 }} />
              <p
                style={{
                  fontSize: '14px',
                  opacity: 0.6,
                }}
              >
                Select an agent run to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* XP-style taskbar hint */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center"
        style={{
          height: '40px',
          background: `linear-gradient(to right, ${XP_TASKBAR_FROM}, ${XP_TASKBAR_TO})`,
          padding: `0 ${spacing[4]}`,
        }}
      >
        <div className="flex items-center" style={{ gap: spacing[2] }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: radii.sm,
              fontSize: '12px',
              fontWeight: '700',
            }}
          >
            A
          </div>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '700',
            }}
          >
            Agent Monitor
          </span>
        </div>
      </div>
    </div>
  )
}
