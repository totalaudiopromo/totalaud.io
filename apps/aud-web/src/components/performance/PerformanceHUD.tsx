/**
 * Performance HUD
 * Phase 16: Overlay UI for performance mode
 */

'use client'

import { useRouter } from 'next/navigation'
import { Play, Pause, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePerformance } from './PerformanceCanvas'
import { generateLiveCaption } from './liveCaptioner'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'

/**
 * Performance HUD overlay
 */
export function PerformanceHUD() {
  const router = useRouter()
  const { performanceState, clockState, clock } = usePerformance()

  // Get active OSs (speaking or thinking or charged)
  const activeOSs = Array.from(performanceState.osStates.entries())
    .filter(([, state]) => state.isSpeaking || state.isThinking || state.isCharged)
    .map(([os]) => os.toUpperCase())

  // Get current emotion labels
  const { cohesion, tension, energy } = performanceState.globalAtmosphere
  const emotionLabels = getEmotionLabels(cohesion, tension, energy)

  // Generate live caption from recent events
  const caption = generateLiveCaption(performanceState.recentEvents)

  // Toggle play/pause
  const handlePlayPause = () => {
    if (!clock) return
    if (clockState.isRunning) {
      clock.stop()
    } else {
      clock.start()
    }
  }

  // Exit performance mode
  const handleExit = () => {
    router.push('/dashboard')
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {/* Top-left: BPM and beat indicator */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: `${flowCoreColours.matteBlack}cc`,
            border: `1px solid ${flowCoreColours.slateCyan}60`,
            borderRadius: '8px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: flowCoreColours.slateCyan,
              marginBottom: '4px',
            }}
          >
            {clockState.bpm} BPM
          </div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: flowCoreColours.textSecondary,
            }}
          >
            Bar {clockState.bar} • Beat {clockState.beatInBar}/4
          </div>
        </div>
      </div>

      {/* Top-right: Active OSs */}
      {activeOSs.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              padding: '12px 20px',
              backgroundColor: `${flowCoreColours.matteBlack}cc`,
              border: `1px solid ${flowCoreColours.borderSubtle}`,
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: flowCoreColours.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '6px',
              }}
            >
              Active
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: flowCoreColours.textPrimary,
              }}
            >
              {activeOSs.join(' • ')}
            </div>
          </div>
        </div>
      )}

      {/* Bottom-left: Emotion labels */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: `${flowCoreColours.matteBlack}cc`,
            border: `1px solid ${flowCoreColours.borderSubtle}`,
            borderRadius: '8px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: flowCoreColours.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '6px',
            }}
          >
            Atmosphere
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: flowCoreColours.textPrimary,
              lineHeight: 1.6,
            }}
          >
            {emotionLabels.join(' • ')}
          </div>
        </div>
      </div>

      {/* Bottom-center: Live caption */}
      {caption && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '600px',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              padding: '16px 24px',
              backgroundColor: `${flowCoreColours.matteBlack}e6`,
              border: `1px solid ${flowCoreColours.slateCyan}40`,
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '15px',
                fontWeight: 500,
                color: flowCoreColours.slateCyan,
                lineHeight: 1.5,
              }}
            >
              {caption}
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom-right: Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          gap: '12px',
          pointerEvents: 'auto',
        }}
      >
        <button
          onClick={handlePlayPause}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: `${flowCoreColours.slateCyan}20`,
            border: `1px solid ${flowCoreColours.slateCyan}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 120ms ease',
            backdropFilter: 'blur(10px)',
          }}
        >
          {clockState.isRunning ? (
            <Pause size={20} strokeWidth={2} style={{ color: flowCoreColours.slateCyan }} />
          ) : (
            <Play size={20} strokeWidth={2} style={{ color: flowCoreColours.slateCyan }} />
          )}
        </button>

        <button
          onClick={handleExit}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: `${flowCoreColours.matteBlack}cc`,
            border: `1px solid ${flowCoreColours.borderSubtle}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 120ms ease',
            backdropFilter: 'blur(10px)',
          }}
        >
          <X size={20} strokeWidth={2} style={{ color: flowCoreColours.textSecondary }} />
        </button>
      </div>
    </div>
  )
}

/**
 * Get emotion labels based on atmosphere values
 */
function getEmotionLabels(cohesion: number, tension: number, energy: number): string[] {
  const labels: string[] = []

  // Cohesion label
  if (cohesion > 0.7) labels.push('Harmonious')
  else if (cohesion > 0.4) labels.push('Balanced')
  else labels.push('Fragmented')

  // Tension label
  if (tension > 0.7) labels.push('Intense')
  else if (tension > 0.4) labels.push('Dynamic')
  else labels.push('Calm')

  // Energy label
  if (energy > 0.7) labels.push('Energised')
  else if (energy > 0.4) labels.push('Active')
  else labels.push('Resting')

  return labels
}
