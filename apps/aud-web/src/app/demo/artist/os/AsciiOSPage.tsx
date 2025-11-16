'use client'

/**
 * ASCII OS Page - Terminal & Agent Commands (Phase 29 Polished)
 * Supports director typing and command execution
 * Uses design tokens for cohesive styling
 */

import { useEffect, useState, useRef } from 'react'
import { useDirector } from '@/components/demo/director/DirectorProvider'
import { useOptionalAmbient } from '@/components/ambient/AmbientEngineProvider'
import { Terminal } from 'lucide-react'
import { colours, spacing } from '@/styles/tokens'
import { duration, easing, prefersReducedMotion } from '@/styles/motion'

// ASCII OS specific colours (CRT green terminal aesthetic)
const ASCII_GREEN = '#00FF00'
const ASCII_GREEN_DIM = 'rgba(0, 255, 0, 0.6)'
const ASCII_GLOW = 'rgba(0, 255, 0, 0.15)'
const SCANLINE_OPACITY = 0.03

export function AsciiOSPage() {
  const director = useDirector()
  const ambient = useOptionalAmbient()
  const [inputValue, setInputValue] = useState('')
  const [output, setOutput] = useState<string[]>([
    '> aud-os v2.0.0',
    '> Type "help" for available commands',
    '',
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const shouldAnimate = !prefersReducedMotion()

  // Trigger entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Register director callbacks
  useEffect(() => {
    director.engine.setCallbacks({
      onTypeAscii: async (text: string, durationMs: number) => {
        // Play type sound at start
        if (ambient) {
          ambient.playEffect('type')
        }

        setIsTyping(true)
        setInputValue('')

        // Natural typing speed based on text length
        // Min speed: 18 chars/s (55ms per char), Max speed: 42 chars/s (24ms per char)
        const textLength = text.length
        const charsPerSecond = Math.max(18, Math.min(42, 30 + textLength / 10))
        const baseCharDelay = 1000 / charsPerSecond

        // Simulate typing character by character
        for (let i = 0; i <= text.length; i++) {
          setInputValue(text.slice(0, i))

          // Calculate delay for this character
          let charDelay = baseCharDelay

          // Add pause after punctuation (30-40ms)
          if (i > 0 && /[.,!?]/.test(text[i - 1])) {
            charDelay += 30 + Math.random() * 10
          }

          await new Promise((resolve) => setTimeout(resolve, charDelay))
        }

        setIsTyping(false)
      },

      onRunAsciiCommand: () => {
        handleSubmit()
      },
    })
  }, [director, ambient])

  const handleSubmit = () => {
    if (!inputValue.trim()) return

    const newOutput = [...output, `> ${inputValue}`]

    // Simple command parsing
    if (inputValue.startsWith('agent run coach')) {
      newOutput.push('⚡ Running agent: coach')
      newOutput.push('📤 Request sent to agent kernel')
      newOutput.push('⏳ Waiting for response...')
      newOutput.push('')

      // Simulate agent response after a delay
      setTimeout(() => {
        setOutput((prev) => [
          ...prev,
          '✅ Agent completed',
          '📊 View results in XP Agent Monitor',
          '',
        ])
      }, 2000)
    } else if (inputValue === 'help') {
      newOutput.push('Available commands:')
      newOutput.push('  agent run <type> "<prompt>" - Run an AI agent')
      newOutput.push('  help - Show this help message')
      newOutput.push('  clear - Clear terminal')
      newOutput.push('')
    } else if (inputValue === 'clear') {
      setOutput([])
      setInputValue('')
      return
    } else {
      newOutput.push(`Command not found: ${inputValue}`)
      newOutput.push('Type "help" for available commands')
      newOutput.push('')
    }

    setOutput(newOutput)
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div
      className="w-full h-full font-mono overflow-auto"
      style={{
        backgroundColor: colours.background,
        color: ASCII_GREEN,
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
        className="flex items-center"
        style={{
          gap: spacing[3],
          marginBottom: spacing[6],
        }}
      >
        <Terminal className="w-6 h-6" style={{ color: ASCII_GREEN }} />
        <div>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: ASCII_GREEN,
            }}
          >
            ASCII Terminal
          </h1>
          <p
            style={{
              fontSize: '12px',
              color: ASCII_GREEN_DIM,
              marginTop: spacing[1],
            }}
          >
            aud-os command interface
          </p>
        </div>
      </div>

      {/* Terminal output */}
      <div
        style={{
          marginBottom: spacing[4],
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[1],
        }}
      >
        {output.map((line, i) => (
          <div
            key={i}
            style={{
              fontSize: '14px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              color: ASCII_GREEN,
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Input line */}
      <div
        className="flex items-center"
        style={{
          gap: spacing[2],
        }}
      >
        <span style={{ color: ASCII_GREEN }}>{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => !isTyping && setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: ASCII_GREEN,
            fontFamily: 'ui-monospace, monospace',
            fontSize: '14px',
          }}
          placeholder={isTyping ? '' : 'Type a command...'}
          autoFocus
        />
        <span
          className="animate-pulse"
          style={{
            color: ASCII_GREEN,
            animation: `pulse ${duration.slow}s ${easing.smooth} infinite`,
          }}
        >
          _
        </span>
      </div>

      {/* CRT scan lines effect (reduced opacity for subtlety) */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: SCANLINE_OPACITY,
          background:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
        }}
      />

      {/* Glow effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 100px ${ASCII_GLOW}`,
          opacity: 0.6,
        }}
      />
    </div>
  )
}
