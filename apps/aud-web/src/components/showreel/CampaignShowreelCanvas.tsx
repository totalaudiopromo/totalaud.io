/**
 * Campaign Showreel Canvas
 * Phase 17: Main showreel visualization container
 */

'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PerformanceClock } from '@totalaud/performance'
import { ShowreelPlayer, type ShowreelScript, type ShowreelScene } from '@totalaud/showreel'
import { useLiveEventBus } from '@totalaud/os-state/live'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'

// Import performance components
import { OSPerformers } from '@aud-web/components/performance/OSPerformers'
import { SocialGraphLive } from '@aud-web/components/performance/SocialGraphLive'
import { LoopOrbits } from '@aud-web/components/performance/LoopOrbits'
import { EmotionalAtmosphere } from '@aud-web/components/performance/EmotionalAtmosphere'
import { EvolutionSparks } from '@aud-web/components/performance/EvolutionSparks'
import { ShowreelControls } from './ShowreelControls'
import { ShowreelChapterList } from './ShowreelChapterList'
import { ShowreelCaptionBar } from './ShowreelCaptionBar'
import { PerformanceEngine } from '@totalaud/performance'
import type { PerformanceState } from '@totalaud/performance'

interface CampaignShowreelCanvasProps {
  script: ShowreelScript
}

const DEFAULT_BPM = 120

export function CampaignShowreelCanvas({ script }: CampaignShowreelCanvasProps) {
  const liveEventBus = useLiveEventBus()

  // Refs for clock, player, and engine
  const clockRef = useRef<PerformanceClock | null>(null)
  const playerRef = useRef<ShowreelPlayer | null>(null)
  const engineRef = useRef<PerformanceEngine | null>(null)

  // Player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [sceneElapsedSeconds, setSceneElapsedSeconds] = useState(0)
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0)
  const [currentScene, setCurrentScene] = useState<ShowreelScene>(script.scenes[0])

  // Performance state for visualizations
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    osStates: new Map(),
    edgeStates: new Map(),
    globalAtmosphere: { cohesion: 0, tension: 0, energy: 0 },
    recentEvents: [],
    lastEventAt: 0,
  })

  // Initialize clock, player, and engine
  useEffect(() => {
    // Create clock
    const clock = new PerformanceClock(DEFAULT_BPM)
    clockRef.current = clock

    // Create player
    const player = new ShowreelPlayer(script, clock)
    playerRef.current = player

    // Create performance engine
    const engine = new PerformanceEngine(clock, liveEventBus)
    engineRef.current = engine

    // Subscribe to player state
    const playerUnsubscribe = player.subscribe((state) => {
      setIsPlaying(state.isPlaying)
      setCurrentSceneIndex(state.currentSceneIndex)
      setSceneElapsedSeconds(state.sceneElapsedSeconds)
      setTotalElapsedSeconds(state.totalElapsedSeconds)
      setCurrentScene(script.scenes[state.currentSceneIndex] || script.scenes[0])
    })

    // Subscribe to performance state
    const engineUnsubscribe = engine.subscribe((state) => {
      setPerformanceState(state)
    })

    // Start clock
    clock.start()

    // Cleanup
    return () => {
      clock.stop()
      playerUnsubscribe()
      engineUnsubscribe()
    }
  }, [script, liveEventBus])

  // Control handlers
  const handlePlay = () => {
    playerRef.current?.play()
  }

  const handlePause = () => {
    playerRef.current?.pause()
  }

  const handleRestart = () => {
    playerRef.current?.stop()
    playerRef.current?.play()
  }

  const handleGoToScene = (index: number) => {
    playerRef.current?.goToScene(index)
  }

  const handleExit = () => {
    // Navigate back to campaign
    window.location.href = `/campaigns/${script.campaignId}`
  }

  // Render scene-specific overlays
  const renderSceneOverlay = () => {
    if (!currentScene) return null

    const shouldShowOSPerformers =
      currentScene.type !== 'social_graph' && currentScene.type !== 'cohesion_arc'

    const shouldShowSocialGraph = currentScene.type === 'social_graph' || currentScene.type === 'performance_peak'

    const shouldShowLoops = currentScene.type === 'performance_peak'

    return (
      <>
        {/* Scene title overlay */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute',
              top: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 700,
                color: flowCoreColours.slateCyan,
                textShadow: `0 0 20px ${flowCoreColours.slateCyan}40`,
                marginBottom: '8px',
              }}
            >
              {currentScene.title}
            </div>
            {currentScene.subtitle && (
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 500,
                  color: flowCoreColours.textSecondary,
                }}
              >
                {currentScene.subtitle}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Conditional visualizations based on scene */}
        {shouldShowOSPerformers && <OSPerformers />}
        {shouldShowSocialGraph && <SocialGraphLive />}
        {shouldShowLoops && <LoopOrbits />}
      </>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: flowCoreColours.matteBlack,
        overflow: 'hidden',
      }}
    >
      {/* Emotional atmosphere (always shown) */}
      <EmotionalAtmosphere />

      {/* Scene camera wrapper */}
      <SceneCamera scene={currentScene} performanceState={performanceState}>
        {renderSceneOverlay()}

        {/* Evolution sparks */}
        <EvolutionSparks />
      </SceneCamera>

      {/* Showreel controls (bottom) */}
      <ShowreelControls
        isPlaying={isPlaying}
        totalDuration={script.totalDurationSeconds}
        currentTime={totalElapsedSeconds}
        onPlay={handlePlay}
        onPause={handlePause}
        onRestart={handleRestart}
        onExit={handleExit}
      />

      {/* Chapter list (right side) */}
      <ShowreelChapterList
        scenes={script.scenes}
        currentSceneIndex={currentSceneIndex}
        onGoToScene={handleGoToScene}
      />

      {/* Caption bar (bottom center) */}
      <ShowreelCaptionBar
        scene={currentScene}
        sceneElapsed={sceneElapsedSeconds}
      />
    </div>
  )
}

/**
 * Scene Camera - applies transforms based on scene camera settings
 */
interface SceneCameraProps {
  scene: ShowreelScene
  performanceState: PerformanceState
  children: React.ReactNode
}

function SceneCamera({ scene, performanceState, children }: SceneCameraProps) {
  const { energy } = performanceState.globalAtmosphere
  const cameraMode = scene.camera?.mode || 'wide'
  const intensity = scene.camera?.intensity || 'normal'

  // Intensity multipliers
  const intensityMultiplier = intensity === 'subtle' ? 0.5 : intensity === 'dramatic' ? 1.5 : 1.0

  // Camera animations based on mode
  const getCameraAnimation = () => {
    switch (cameraMode) {
      case 'orbit':
        return {
          rotateZ: [0, 360],
          scale: [1.0, 1.0 + 0.05 * intensityMultiplier, 1.0],
        }
      case 'focus_os':
        return {
          scale: 1.1 + 0.1 * intensityMultiplier,
        }
      case 'graph':
        return {
          scale: [1.0, 1.05, 1.0],
          rotateZ: [0, 5 * intensityMultiplier, 0, -5 * intensityMultiplier, 0],
        }
      case 'timeline':
        return {
          scale: 1.05,
        }
      case 'wide':
      default:
        return {
          scale: 1.0,
        }
    }
  }

  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        transformStyle: 'preserve-3d',
      }}
      animate={getCameraAnimation()}
      transition={{
        duration: cameraMode === 'orbit' ? 30 / intensityMultiplier : 12,
        repeat: cameraMode === 'orbit' || cameraMode === 'graph' ? Infinity : 0,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  )
}
