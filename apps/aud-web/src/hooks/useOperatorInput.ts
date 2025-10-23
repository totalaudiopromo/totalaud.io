'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface OperatorLine {
  text: string
  delay: number
}

const BOOT_SEQUENCE: OperatorLine[] = [
  { text: 'booting patchbay...', delay: 800 },
  { text: 'checking signal path...', delay: 1200 },
  { text: 'line check complete.', delay: 1000 },
  { text: 'welcome to totalaud.io', delay: 1400 },
  { text: 'what are we working on today?', delay: 0 },
]

interface UseOperatorInputReturn {
  lines: string[]
  userInput: string
  isComplete: boolean
  handleKeyPress: (e: KeyboardEvent) => void
  resetInput: () => void
}

interface EasterEgg {
  trigger: string
  response: string
}

const EASTER_EGGS: EasterEgg[] = [
  { trigger: 'who are you?', response: "depends who's asking." },
  { trigger: 'who are you', response: "depends who's asking." },
  { trigger: 'play the demo', response: 'unlocking daw mode...' },
  { trigger: 'make it louder', response: 'increasing signal by 10%...' },
  { trigger: 'total audio promo', response: 'ah, you know the name. welcome back.' },
]

/**
 * Handles operator terminal text playback and user input capture.
 * Plays boot sequence line-by-line, then accepts user input.
 */
export function useOperatorInput(onComplete: () => void): UseOperatorInputReturn {
  const [lines, setLines] = useState<string[]>([])
  const [userInput, setUserInput] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [sequenceComplete, setSequenceComplete] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const onCompleteRef = useRef(onComplete)

  // Keep onComplete ref up to date
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // Play boot sequence on mount
  useEffect(() => {
    let currentIndex = 0

    const playNextLine = () => {
      if (currentIndex < BOOT_SEQUENCE.length) {
        const line = BOOT_SEQUENCE[currentIndex]
        setLines((prev) => [...prev, `operator> ${line.text}`])
        currentIndex++

        if (currentIndex < BOOT_SEQUENCE.length) {
          timeoutRef.current = setTimeout(playNextLine, line.delay)
        } else {
          setSequenceComplete(true)
        }
      }
    }

    playNextLine()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (!sequenceComplete || isComplete) return

      if (e.key === 'Enter' && userInput.trim().length > 0) {
        const input = userInput.trim().toLowerCase()

        // Check for easter eggs
        const easterEgg = EASTER_EGGS.find((egg) => egg.trigger === input)
        if (easterEgg) {
          setLines((prev) => [...prev, `> ${userInput}`, `operator> ${easterEgg.response}`])
          setUserInput('')

          // Special handling for "make it louder"
          if (input === 'make it louder') {
            // Dispatch custom event for volume increase
            window.dispatchEvent(
              new CustomEvent('operator-volume-boost', { detail: { increase: 0.1 } })
            )
          }

          // Special handling for "play the demo" - unlock daw theme
          if (input === 'play the demo') {
            window.dispatchEvent(new CustomEvent('operator-unlock-daw'))
          }

          return
        }

        // Normal input - display and complete
        setLines((prev) => [...prev, `> ${userInput}`])
        setUserInput('')
        setIsComplete(true)

        // Trigger completion after brief delay
        setTimeout(() => {
          onCompleteRef.current()
        }, 600)
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        setUserInput((prev) => prev.slice(0, -1))
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setUserInput((prev) => prev + e.key)
      }
    },
    [sequenceComplete, isComplete, userInput]
  )

  const resetInput = useCallback(() => {
    setLines([])
    setUserInput('')
    setIsComplete(false)
    setSequenceComplete(false)
  }, [])

  return {
    lines,
    userInput,
    isComplete,
    handleKeyPress,
    resetInput,
  }
}
