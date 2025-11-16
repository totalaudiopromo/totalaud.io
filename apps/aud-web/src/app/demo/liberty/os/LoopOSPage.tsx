'use client'

/**
 * LoopOS Page - Liberty Campaign Timeline (Phase 29 Polished)
 * Supports director camera panning and playback control
 * Uses design tokens for consistent styling
 */

import { useEffect, useState, useRef } from 'react'
import { useDirector } from '@/components/demo/director/DirectorProvider'
import { Play, Pause } from 'lucide-react'
import { spacing, radii, colours } from '@/styles/tokens'
import { duration, easing, prefersReducedMotion } from '@/styles/motion'

export function LoopOSPage() {
  const director = useDirector()
  const [isPlaying, setIsPlaying] = useState(false)
  const [playheadPosition, setPlayheadPosition] = useState(0)
  const [cameraTarget, setCameraTarget] = useState<'timeline' | 'inspector' | 'minimap'>(
    'timeline'
  )
  const [isVisible, setIsVisible] = useState(false)
  const playIntervalRef = useRef<number | null>(null)

  // Trigger entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Register director callbacks
  useEffect(() => {
    director.engine.setCallbacks({
      onPanCamera: async (target: string, durationMs: number) => {
        setCameraTarget(target as any)
        return new Promise((resolve) => setTimeout(resolve, durationMs))
      },

      onPlayLoopOS: async (durationMs: number) => {
        setIsPlaying(true)

        // Simulate playback
        const interval = window.setInterval(() => {
          setPlayheadPosition((prev) => Math.min(prev + 0.5, 100))
        }, 50)

        playIntervalRef.current = interval

        return new Promise((resolve) => {
          setTimeout(() => {
            if (playIntervalRef.current) {
              clearInterval(playIntervalRef.current)
              playIntervalRef.current = null
            }
            resolve()
          }, durationMs)
        })
      },

      onStopLoopOS: () => {
        setIsPlaying(false)
        if (playIntervalRef.current) {
          clearInterval(playIntervalRef.current)
          playIntervalRef.current = null
        }
      },
    })

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [director])

  // Calculate camera transform
  const getCameraTransform = () => {
    switch (cameraTarget) {
      case 'timeline':
        return 'translate3d(0, 0, 0) scale(1)'
      case 'inspector':
        return 'translate3d(-30%, 0, 0) scale(1.1)'
      case 'minimap':
        return 'translate3d(-10%, -20%, 0) scale(1.2)'
      default:
        return 'translate3d(0, 0, 0) scale(1)'
    }
  }

  // Calculate camera pan duration based on distance
  const getCameraPanDuration = () => {
    // Simple distance approximation (in practice, this could be more sophisticated)
    // Timeline → Inspector: medium distance (300ms)
    // Timeline → Minimap: short distance (250ms)
    // Inspector → Minimap: long distance (350ms)
    return duration.medium + 0.05 // 290ms
  }

  const shouldAnimate = !prefersReducedMotion()

  return (
    <div
      className="w-full h-full overflow-hidden"
      style={{
        backgroundColor: colours.background,
        // OS transition animation
        opacity: shouldAnimate ? (isVisible ? 1 : 0) : 1,
        transform: shouldAnimate ? (isVisible ? 'scale(1)' : 'scale(0.98)') : 'scale(1)',
        transition: shouldAnimate
          ? `opacity ${duration.medium}s ${easing.default}, transform ${duration.medium}s ${easing.default}`
          : 'none',
      }}
    >
      {/* Camera container with GPU-accelerated transform */}
      <div
        className="w-full h-full"
        style={{
          transform: getCameraTransform(),
          transition: shouldAnimate
            ? `transform ${getCameraPanDuration()}s ${easing.default}`
            : 'none',
          willChange: 'transform', // GPU acceleration hint
        }}
      >
        <div className="w-full h-full" style={{ padding: spacing[6] }}>
          {/* Header */}
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: spacing[6] }}
          >
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: colours.foreground }}>
                Liberty Campaign Timeline
              </h1>
              <p style={{ fontSize: '14px', color: colours.foreground, opacity: 0.6, marginTop: spacing[1] }}>
                UK Indie Launch — Radio & Press
              </p>
            </div>

            {/* Playback controls */}
            <div className="flex items-center" style={{ gap: spacing[3] }}>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={director.isPlaying}
                className="hover:scale-105"
                style={{
                  padding: spacing[2],
                  backgroundColor: colours.accent,
                  color: colours.background,
                  borderRadius: radii.md,
                  transition: `all ${duration.fast}s ${easing.default}`,
                  opacity: director.isPlaying ? 0.5 : 1,
                  cursor: director.isPlaying ? 'not-allowed' : 'pointer',
                }}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <span
                style={{
                  fontSize: '14px',
                  color: colours.foreground,
                  opacity: 0.6,
                  fontFamily: 'monospace',
                }}
              >
                {playheadPosition.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Timeline lanes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4], marginBottom: spacing[6] }}>
            {/* BBC Introducing lane */}
            <div
              style={{
                backgroundColor: `${colours.accent}0D`,
                border: `1px solid ${colours.border}`,
                borderRadius: radii.lg,
                padding: spacing[4],
              }}
            >
              <div className="flex items-center" style={{ gap: spacing[2], marginBottom: spacing[3] }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: colours.accent,
                    borderRadius: radii.full,
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: '700', color: colours.foreground }}>
                  BBC Introducing
                </span>
              </div>
              <div
                className="relative overflow-hidden"
                style={{
                  height: '48px',
                  backgroundColor: `${colours.background}80`,
                  borderRadius: radii.md,
                }}
              >
                <div
                  className="absolute"
                  style={{
                    left: '10%',
                    top: spacing[2],
                    bottom: spacing[2],
                    width: '15%',
                    backgroundColor: `${colours.accent}99`,
                    borderRadius: radii.sm,
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    left: '30%',
                    top: spacing[2],
                    bottom: spacing[2],
                    width: '20%',
                    backgroundColor: `${colours.accent}CC`,
                    borderRadius: radii.sm,
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    left: '55%',
                    top: spacing[2],
                    bottom: spacing[2],
                    width: '15%',
                    backgroundColor: `${colours.accent}99`,
                    borderRadius: radii.sm,
                  }}
                />

                {/* Playhead */}
                <div
                  className="absolute"
                  style={{
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    left: `${playheadPosition}%`,
                    backgroundColor: colours.accent,
                    boxShadow: colours.glow,
                    transition: `left ${duration.fast}s linear`,
                  }}
                />
              </div>
            </div>

            {/* Student Radio lane */}
            <div
              style={{
                backgroundColor: `${colours.accent}0D`,
                border: `1px solid ${colours.border}`,
                borderRadius: radii.lg,
                padding: spacing[4],
              }}
            >
              <div className="flex items-center" style={{ gap: spacing[2], marginBottom: spacing[3] }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: `${colours.accent}99`,
                    borderRadius: radii.full,
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: '700', color: colours.foreground }}>
                  Student Radio
                </span>
              </div>
              <div
                className="relative overflow-hidden"
                style={{
                  height: '48px',
                  backgroundColor: `${colours.background}80`,
                  borderRadius: radii.md,
                }}
              >
                <div
                  className="absolute"
                  style={{
                    left: '20%',
                    top: spacing[2],
                    bottom: spacing[2],
                    width: '25%',
                    backgroundColor: `${colours.accent}80`,
                    borderRadius: radii.sm,
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    left: '50%',
                    top: spacing[2],
                    bottom: spacing[2],
                    width: '30%',
                    backgroundColor: `${colours.accent}B3`,
                    borderRadius: radii.sm,
                  }}
                />

                {/* Playhead */}
                <div
                  className="absolute"
                  style={{
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    left: `${playheadPosition}%`,
                    backgroundColor: colours.accent,
                    boxShadow: colours.glow,
                    transition: `left ${duration.fast}s linear`,
                  }}
                />
              </div>
            </div>

            {/* Spotify Editorial lane */}
            <div
              style={{
                backgroundColor: `${colours.accent}0D`,
                border: `1px solid ${colours.border}`,
                borderRadius: radii.lg,
                padding: spacing[4],
              }}
            >
              <div className="flex items-center" style={{ gap: spacing[2], marginBottom: spacing[3] }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: `${colours.accent}66`,
                    borderRadius: radii.full,
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: '700', color: colours.foreground }}>
                  Spotify Editorial Pitch
                </span>
              </div>
              <div
                className="relative overflow-hidden"
                style={{
                  height: '48px',
                  backgroundColor: `${colours.background}80`,
                  borderRadius: radii.md,
                }}
              >
                <div
                  className="absolute"
                  style={{
                    left: '40%',
                    top: spacing[2],
                    bottom: spacing[2],
                    width: '35%',
                    backgroundColor: `${colours.accent}4D`,
                    borderRadius: radii.sm,
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    left: '80%',
                    top: spacing[2],
                    bottom: spacing[2],
                    width: '15%',
                    backgroundColor: `${colours.accent}66`,
                    borderRadius: radii.sm,
                  }}
                />

                {/* Playhead */}
                <div
                  className="absolute"
                  style={{
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    left: `${playheadPosition}%`,
                    backgroundColor: colours.accent,
                    boxShadow: colours.glow,
                    transition: `left ${duration.fast}s linear`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Inspector panel */}
          <div
            style={{
              backgroundColor: `${colours.accent}0D`,
              border: `1px solid ${colours.border}`,
              borderRadius: radii.lg,
              padding: spacing[4],
            }}
          >
            <h3
              style={{
                fontSize: '14px',
                fontWeight: '700',
                marginBottom: spacing[3],
                color: colours.foreground,
              }}
            >
              Campaign Inspector
            </h3>
            <div className="grid grid-cols-2" style={{ gap: spacing[4], fontSize: '12px' }}>
              <div>
                <span style={{ color: colours.foreground, opacity: 0.6 }}>Radio Targets:</span>
                <span style={{ marginLeft: spacing[2], fontFamily: 'monospace', color: colours.foreground }}>
                  24
                </span>
              </div>
              <div>
                <span style={{ color: colours.foreground, opacity: 0.6 }}>Duration:</span>
                <span style={{ marginLeft: spacing[2], fontFamily: 'monospace', color: colours.foreground }}>
                  4 weeks
                </span>
              </div>
              <div>
                <span style={{ color: colours.foreground, opacity: 0.6 }}>Press Outlets:</span>
                <span style={{ marginLeft: spacing[2], fontFamily: 'monospace', color: colours.foreground }}>
                  12
                </span>
              </div>
              <div>
                <span style={{ color: colours.foreground, opacity: 0.6 }}>Status:</span>
                <span
                  style={{
                    marginLeft: spacing[2],
                    color: colours.accent,
                    fontFamily: 'monospace',
                  }}
                >
                  Planning
                </span>
              </div>
            </div>
          </div>

          {/* Minimap */}
          <div
            className="absolute"
            style={{
              top: spacing[6],
              right: spacing[6],
              width: '192px',
              height: '128px',
              backgroundColor: `${colours.background}CC`,
              border: `1px solid ${colours.border}`,
              borderRadius: radii.lg,
              padding: spacing[2],
            }}
          >
            <div
              style={{
                fontSize: '10px',
                color: colours.foreground,
                opacity: 0.6,
                marginBottom: spacing[1],
              }}
            >
              Campaign Overview
            </div>
            <div
              className="relative"
              style={{
                height: 'calc(100% - 16px)',
                backgroundColor: `${colours.accent}0D`,
                borderRadius: radii.sm,
              }}
            >
              {/* Mini timeline bars */}
              <div
                className="absolute"
                style={{
                  left: '10%',
                  top: '20%',
                  width: '30%',
                  height: '4px',
                  backgroundColor: `${colours.accent}66`,
                  borderRadius: radii.sm,
                }}
              />
              <div
                className="absolute"
                style={{
                  left: '25%',
                  top: '40%',
                  width: '40%',
                  height: '4px',
                  backgroundColor: `${colours.accent}66`,
                  borderRadius: radii.sm,
                }}
              />
              <div
                className="absolute"
                style={{
                  left: '45%',
                  top: '60%',
                  width: '35%',
                  height: '4px',
                  backgroundColor: `${colours.accent}66`,
                  borderRadius: radii.sm,
                }}
              />

              {/* Mini playhead */}
              <div
                className="absolute"
                style={{
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  left: `${playheadPosition}%`,
                  backgroundColor: colours.accent,
                  transition: `left ${duration.fast}s linear`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
