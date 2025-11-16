/**
 * Demo Mode Player
 * Phase 13E: Hero Demo Mode
 *
 * Main player component with progress bar, chapters, and speed control
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  Square,
  ChevronLeft,
  ChevronRight,
  Gauge,
  X,
} from 'lucide-react'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { DemoScriptEngine, type DemoScript, type DemoAction } from '@totalaud/demo'
import { DemoCinematicFrame } from './DemoCinematicFrame'
import { DemoCaption, DemoChapterTitle } from './DemoCaption'
import { useRouter } from 'next/navigation'

interface DemoModePlayerProps {
  script: DemoScript
}

export function DemoModePlayer({ script }: DemoModePlayerProps) {
  const router = useRouter()
  const [engine] = useState(() => new DemoScriptEngine(script))
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [currentAction, setCurrentAction] = useState<DemoAction | null>(null)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [showControls, setShowControls] = useState(true)

  // Caption state
  const [captionText, setCaptionText] = useState('')
  const [captionVisible, setCaptionVisible] = useState(false)

  // Chapter title state
  const [chapterTitle, setChapterTitle] = useState('')
  const [chapterSubtitle, setChapterSubtitle] = useState<string | undefined>()
  const [chapterTitleVisible, setChapterTitleVisible] = useState(false)

  // Fade state
  const [fadeVisible, setFadeVisible] = useState(false)

  // Listen to engine events
  useEffect(() => {
    const unsubscribe = engine.on((event) => {
      if (event.type === 'chapter_start') {
        setCurrentChapterIndex(engine.getState().currentChapterIndex)
        if (event.chapter) {
          setChapterTitle(event.chapter.title)
          setChapterSubtitle(event.chapter.subtitle)
          setChapterTitleVisible(true)
          setTimeout(() => setChapterTitleVisible(false), 2000)
        }
      } else if (event.type === 'action_start' && event.action) {
        setCurrentAction(event.action)

        // Handle action-specific UI
        if (event.action.type === 'caption') {
          setCaptionText(event.action.text)
          setCaptionVisible(true)
        } else if (event.action.type === 'fadeOut') {
          setFadeVisible(true)
        } else if (event.action.type === 'fadeIn') {
          setFadeVisible(false)
        }
      } else if (event.type === 'action_complete' && event.action) {
        if (event.action.type === 'caption') {
          setCaptionVisible(false)
        }
      } else if (event.type === 'script_complete') {
        setIsPlaying(false)
        setIsPaused(false)
      }

      // Update player state
      const state = engine.getState()
      setIsPlaying(state.isPlaying)
      setIsPaused(state.isPaused)
      setPlaybackSpeed(state.playbackSpeed)
    })

    return () => unsubscribe()
  }, [engine])

  const handlePlay = useCallback(() => {
    if (!isPlaying) {
      engine.play()
    } else if (isPaused) {
      engine.resume()
    } else {
      engine.pause()
    }
  }, [engine, isPlaying, isPaused])

  const handleStop = useCallback(() => {
    engine.stop()
    setCurrentChapterIndex(0)
    setCurrentAction(null)
    setCaptionVisible(false)
    setChapterTitleVisible(false)
    setFadeVisible(false)
  }, [engine])

  const handleSpeedChange = useCallback(() => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]
    const currentIndex = speeds.indexOf(playbackSpeed)
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]
    engine.setSpeed(nextSpeed)
    setPlaybackSpeed(nextSpeed)
  }, [engine, playbackSpeed])

  const handleExit = useCallback(() => {
    engine.stop()
    router.push('/')
  }, [engine, router])

  return (
    <DemoCinematicFrame showLetterbox={true}>
      {/* Main Demo Content */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Placeholder content - will be replaced with actual demo visuals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '40px',
          }}
        >
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 600,
              color: flowCoreColours.slateCyan,
              marginBottom: '16px',
            }}
          >
            {script.title}
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: flowCoreColours.textSecondary,
              maxWidth: '600px',
            }}
          >
            {script.description}
          </p>
          <p
            style={{
              fontSize: '14px',
              color: flowCoreColours.textTertiary,
              marginTop: '32px',
            }}
          >
            Current Chapter: {currentChapterIndex + 1} / {script.chapters.length}
          </p>
        </motion.div>

        {/* Captions */}
        <DemoCaption
          text={captionText}
          visible={captionVisible}
          position="bottom"
        />

        {/* Chapter Titles */}
        <DemoChapterTitle
          title={chapterTitle}
          subtitle={chapterSubtitle}
          visible={chapterTitleVisible}
        />

        {/* Fade Overlay */}
        <AnimatePresence>
          {fadeVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: flowCoreColours.matteBlack,
                zIndex: 150,
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.24 }}
            style={{
              position: 'absolute',
              bottom: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px 24px',
              background: `${flowCoreColours.matteBlack}f5`,
              backdropFilter: 'blur(12px)',
              border: `1px solid ${flowCoreColours.borderSubtle}`,
              borderRadius: '12px',
              boxShadow: `0 8px 32px ${flowCoreColours.matteBlack}80`,
            }}
          >
            {/* Play/Pause */}
            <button
              onClick={handlePlay}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: flowCoreColours.slateCyan,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 120ms ease',
              }}
              aria-label={isPlaying && !isPaused ? 'Pause' : 'Play'}
            >
              {isPlaying && !isPaused ? (
                <Pause size={24} strokeWidth={2} style={{ color: flowCoreColours.matteBlack }} />
              ) : (
                <Play size={24} strokeWidth={2} style={{ color: flowCoreColours.matteBlack }} />
              )}
            </button>

            {/* Stop */}
            <button
              onClick={handleStop}
              disabled={!isPlaying}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'transparent',
                border: `1px solid ${flowCoreColours.borderSubtle}`,
                cursor: isPlaying ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isPlaying ? 1 : 0.4,
                transition: 'all 120ms ease',
              }}
              aria-label="Stop"
            >
              <Square size={18} strokeWidth={2} style={{ color: flowCoreColours.textPrimary }} />
            </button>

            {/* Divider */}
            <div
              style={{
                width: '1px',
                height: '32px',
                background: flowCoreColours.borderSubtle,
              }}
            />

            {/* Speed Control */}
            <button
              onClick={handleSpeedChange}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'transparent',
                border: `1px solid ${flowCoreColours.borderSubtle}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 120ms ease',
              }}
              aria-label={`Playback speed ${playbackSpeed}x`}
            >
              <Gauge size={16} strokeWidth={2} style={{ color: flowCoreColours.slateCyan }} />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: flowCoreColours.textPrimary,
                }}
              >
                {playbackSpeed}x
              </span>
            </button>

            {/* Divider */}
            <div
              style={{
                width: '1px',
                height: '32px',
                background: flowCoreColours.borderSubtle,
              }}
            />

            {/* Chapter Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: flowCoreColours.textSecondary,
                }}
              >
                Chapter {currentChapterIndex + 1} / {script.chapters.length}
              </span>
            </div>

            {/* Divider */}
            <div
              style={{
                width: '1px',
                height: '32px',
                background: flowCoreColours.borderSubtle,
              }}
            />

            {/* Exit */}
            <button
              onClick={handleExit}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'transparent',
                border: `1px solid ${flowCoreColours.borderSubtle}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 120ms ease',
              }}
              aria-label="Exit demo"
            >
              <X size={18} strokeWidth={2} style={{ color: flowCoreColours.textPrimary }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </DemoCinematicFrame>
  )
}
