/**
 * Demo Caption
 * Phase 13E: Hero Demo Mode
 *
 * Apple-style type-on captions
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'

interface DemoCaptionProps {
  text: string
  visible: boolean
  colour?: string
  size?: 'small' | 'medium' | 'large'
  position?: 'top' | 'center' | 'bottom'
  typeSpeed?: number // milliseconds per character
}

export function DemoCaption({
  text,
  visible,
  colour = flowCoreColours.slateCyan,
  size = 'medium',
  position = 'bottom',
  typeSpeed = 30,
}: DemoCaptionProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!visible) {
      setDisplayedText('')
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex))
        currentIndex++
      } else {
        setIsTyping(false)
        clearInterval(interval)
      }
    }, typeSpeed)

    return () => clearInterval(interval)
  }, [text, visible, typeSpeed])

  const fontSize =
    size === 'small' ? '18px' : size === 'medium' ? '28px' : '42px'

  const positionStyles =
    position === 'top'
      ? { top: '120px' }
      : position === 'center'
        ? { top: '50%', transform: 'translate(-50%, -50%)' }
        : { bottom: '120px' }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: position === 'bottom' ? 20 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'bottom' ? 20 : -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            maxWidth: '80%',
            textAlign: 'center',
            ...positionStyles,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize,
              fontWeight: 600,
              color: colour,
              textShadow: `0 0 40px ${colour}40`,
              lineHeight: 1.4,
              letterSpacing: '-0.02em',
            }}
          >
            {displayedText}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{ color: colour, marginLeft: '2px' }}
              >
                |
              </motion.span>
            )}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Chapter Title Component
 */
interface DemoChapterTitleProps {
  title: string
  subtitle?: string
  visible: boolean
  colour?: string
}

export function DemoChapterTitle({
  title,
  subtitle,
  visible,
  colour = flowCoreColours.slateCyan,
}: DemoChapterTitleProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 200,
            textAlign: 'center',
            maxWidth: '80%',
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            style={{
              margin: 0,
              fontSize: '64px',
              fontWeight: 700,
              color: colour,
              textShadow: `0 0 60px ${colour}60`,
              letterSpacing: '-0.03em',
              marginBottom: subtitle ? '16px' : 0,
            }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 400,
                color: `${colour}cc`,
                textShadow: `0 0 30px ${colour}40`,
              }}
            >
              {subtitle}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
