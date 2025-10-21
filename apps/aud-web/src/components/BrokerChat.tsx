"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OSTheme, THEME_CONFIGS } from "@aud-web/types/themes"
import { audioEngine, getTheme } from "@total-audio/core-theme-engine"
import type { ThemeId } from "@total-audio/core-theme-engine"
import { brokerConversationFlow, getNextStep, brokerPersona, getRandomLine } from "@aud-web/lib/broker-persona"
import type { ConversationStep } from "@aud-web/lib/broker-persona"
import {
  getBrokerPersonality,
  getPersonalityLine,
  applyPersonalityTone,
  getQuirkAnimationClass,
  useBrokerMemoryLocal,
  getFlowTemplateForGoal,
  serializeFlowTemplate
} from "@total-audio/core-agent-executor/client"
import { generateUUID } from "@aud-web/lib/uuid"

interface Message {
  id: string
  from: "broker" | "user"
  content: string
  timestamp: Date
}

interface BrokerChatProps {
  selectedMode: OSTheme
  sessionId?: string
}

export default function BrokerChat({ selectedMode, sessionId }: BrokerChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentStep, setCurrentStep] = useState<ConversationStep | null>(null)
  const [userInput, setUserInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [userData, setUserData] = useState({
    artistName: "",
    genre: "",
    goals: "",
    experience: ""
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messageIdCounter = useRef(0) // Unique ID generator
  const hasInitialized = useRef(false) // Guard against double initialization
  const theme = THEME_CONFIGS[selectedMode]
  const themeManifest = getTheme(selectedMode as ThemeId)
  const personality = getBrokerPersonality(selectedMode)

  // Broker memory for saving conversation data
  const [localSessionId] = useState(() => sessionId || generateUUID())
  const memory = useBrokerMemoryLocal(localSessionId)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Start conversation
  useEffect(() => {
    // Prevent double initialization (React StrictMode runs effects twice)
    if (hasInitialized.current) return
    hasInitialized.current = true

    console.log('[BrokerChat] Initializing conversation with personality:', personality.themeId)

    // Add personality-specific opener
    const opener = personality.opener
    addBrokerMessage(opener, 500, false)

    // Add personality-specific opening line
    setTimeout(() => {
      const openingLine = getPersonalityLine(personality, 'openingLines')
      addBrokerMessage(openingLine, 1500, false)
    }, 1500)

    // Load first question
    setTimeout(() => {
      const firstStep = getNextStep("greeting")
      console.log('[BrokerChat] First step:', firstStep)
      if (firstStep) {
        setCurrentStep(firstStep)
        const needsOptions = firstStep.inputType === 'buttons' || firstStep.inputType === 'select'
        // Apply personality tone to message
        const styledMessage = applyPersonalityTone(firstStep.message, personality)
        addBrokerMessage(styledMessage, 3500, needsOptions)
      }
    }, 3500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Focus input when options are hidden
  useEffect(() => {
    console.log('[BrokerChat] State:', {
      currentStep: currentStep?.id,
      inputType: currentStep?.inputType,
      showOptions,
      isTyping
    })
    if (!showOptions && currentStep?.inputType === 'text') {
      inputRef.current?.focus()
    }
  }, [showOptions, currentStep, isTyping])

  const addBrokerMessage = (content: string, delay: number = 0, shouldShowOptions: boolean = false) => {
    setTimeout(() => {
      setIsTyping(true)
      // Play agent speak sound using Theme Engine
      audioEngine.play(themeManifest.sounds.agentSpeak)

      // Typewriter effect timing
      const typingDuration = content.length * 30 // 30ms per character
      
      setTimeout(() => {
        messageIdCounter.current += 1
        setMessages(prev => [...prev, {
          id: `broker-${messageIdCounter.current}`,
          from: "broker",
          content,
          timestamp: new Date()
        }])
        setIsTyping(false)
        
        // Show options after broker speaks if requested
        if (shouldShowOptions) {
          setTimeout(() => {
            setShowOptions(true)
          }, 100)
        }
      }, typingDuration)
    }, delay)
  }

  const addUserMessage = (content: string) => {
    messageIdCounter.current += 1
    setMessages(prev => [...prev, {
      id: `user-${messageIdCounter.current}`,
      from: "user",
      content,
      timestamp: new Date()
    }])
    
    // Play click sound using Theme Engine
    audioEngine.play(themeManifest.sounds.click)
  }

  const handleUserInput = (value: string) => {
    if (!value.trim() || !currentStep) return

    addUserMessage(value)
    setUserInput("")
    setShowOptions(false)

    // Save user data
    updateUserData(currentStep.id, value)

    // Add personality-specific confirmation
    const confirmation = getPersonalityLine(personality, 'confirmations')
    addBrokerMessage(confirmation, 500, false)

    // Move to next step
    setTimeout(() => {
      const nextStep = getNextStep(currentStep.id)
      if (nextStep) {
        setCurrentStep(nextStep)
        const needsOptions = nextStep.inputType === 'buttons' || nextStep.inputType === 'select'
        // Apply personality tone to next message
        const styledMessage = applyPersonalityTone(nextStep.message, personality)
        addBrokerMessage(styledMessage, 1500, needsOptions)
      }
    }, 1500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleUserInput(userInput)
  }

  const handleOptionClick = (option: string) => {
    handleUserInput(option)
  }

  const updateUserData = (stepId: string, value: string) => {
    setUserData(prev => {
      let memoryKey: string | null = null

      const updated = (() => {
        switch (stepId) {
          case "ask_name":
            memoryKey = "artist_name"
            return { ...prev, artistName: value }
          case "ask_genre":
            memoryKey = "genre"
            return { ...prev, genre: value }
          case "ask_goals":
            memoryKey = "goal"
            return { ...prev, goals: value }
          case "ask_experience":
            memoryKey = "experience"
            return { ...prev, experience: value }
          default:
            return prev
        }
      })()

      // Save to memory
      if (memoryKey) {
        memory.save(memoryKey as any, value)
        console.log(`[BrokerChat] Saved ${memoryKey} to memory:`, value)
      }

      return updated
    })
  }

  const handleCompletion = (choice: string) => {
    addUserMessage(choice)

    if (choice.includes("Yes")) {
      // Get personality-specific confirmation
      const confirmation = getPersonalityLine(personality, 'confirmations')
      setTimeout(() => {
        addBrokerMessage(`${confirmation} Let's build your first campaign flow.`, 500)
      }, 500)

      setTimeout(() => {
        // Play success sound
        audioEngine.play(themeManifest.sounds.success || themeManifest.sounds.click)

        // Mark onboarding as complete
        memory.complete()

        // Get all saved data
        const memoryData = memory.getAll()
        console.log('[BrokerChat] Onboarding complete. Memory data:', memoryData)

        // Generate flow template based on user's goal
        const flowTemplate = getFlowTemplateForGoal(memoryData.goal || '')

        if (flowTemplate) {
          const serialized = serializeFlowTemplate(flowTemplate)
          console.log('[BrokerChat] Generated flow template:', flowTemplate.name)

          // Redirect to Flow Canvas with prefilled nodes
          window.location.href = `/?welcome=true&flow=${serialized}`
        } else {
          // Fallback: redirect without prefill
          window.location.href = "/?welcome=true"
        }
      }, 2500)
    } else {
      setTimeout(() => {
        addBrokerMessage("No problem. I'll be around when you need me.", 500)
      }, 500)

      setTimeout(() => {
        window.location.href = "/"
      }, 2500)
    }
  }

  const getPrefix = () => {
    const prefixes: Record<OSTheme, string> = {
      ascii: "⟩",
      xp: "►",
      aqua: "•",
      daw: "●",
      analogue: "✦"
    }
    return prefixes[selectedMode] || "›"
  }

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col"
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.fontFamily,
        color: theme.colors.text
      }}
    >
      {/* Scanline effect for ASCII mode */}
      {selectedMode === 'ascii' && (
        <div className="absolute inset-0 scanline-effect opacity-10 pointer-events-none" />
      )}

      {/* Header */}
      <div
        className="border-b p-4 flex items-center gap-3"
        style={{
          borderColor: theme.colors.border,
          backgroundColor: `${theme.colors.background}ee`
        }}
      >
        <span className="text-2xl">🎙️</span>
        <div>
          <div className="font-bold" style={{ color: theme.colors.primary }}>
            Agent Broker
          </div>
          <div className="text-xs opacity-60">Your Audio Liaison</div>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: theme.colors.accent }}
          />
          <span className="text-xs font-mono opacity-60">ONLINE</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => {
            // Get animation config based on personality quirk
            const animationClass = message.from === 'broker' ? getQuirkAnimationClass(personality) : ''
            const quirk = personality.interactionQuirks

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: message.from === 'broker' && quirk.animationDuration
                    ? quirk.animationDuration / 1000
                    : 0.3
                }}
                className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl px-4 py-3 rounded-lg ${
                    message.from === 'broker' ? 'rounded-tl-none' : 'rounded-tr-none'
                  } ${message.from === 'broker' ? animationClass : ''}`}
                  style={{
                    backgroundColor: message.from === 'broker'
                      ? `${theme.colors.primary}20`
                      : `${theme.colors.accent}20`,
                    borderLeft: message.from === 'broker'
                      ? `3px solid ${theme.colors.primary}`
                      : 'none',
                    borderRight: message.from === 'user'
                      ? `3px solid ${theme.colors.accent}`
                      : 'none'
                  }}
                >
                  {message.from === 'broker' && (
                    <div className="font-mono text-xs opacity-60 mb-1">
                      {personality.messagePrefix || getPrefix()} Broker
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm opacity-60"
          >
            <span className="font-mono">{getPrefix()}</span>
            <span>Broker is typing</span>
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ...
            </motion.span>
          </motion.div>
        )}

        {/* Options (buttons) */}
        {showOptions && currentStep && currentStep.options && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 pt-4"
          >
            {currentStep.options.map((option: string, index: number) => (
              <motion.button
                key={index}
                onClick={() => {
                  if (currentStep.id === 'completion') {
                    handleCompletion(option)
                  } else {
                    handleOptionClick(option)
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: `${theme.colors.primary}30`,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: theme.colors.primary,
                  color: theme.colors.text
                }}
              >
                {option}
              </motion.button>
            ))}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field - Show for text questions when not typing */}
      {currentStep && currentStep.inputType === 'text' && !showOptions && !isTyping ? (
        <form
          onSubmit={handleSubmit}
          className="border-t p-4 bg-opacity-95"
          style={{ 
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background
          }}
        >
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your response..."
              autoFocus
              className="flex-1 px-4 py-3 rounded-lg outline-none transition-all"
              style={{
                backgroundColor: `${theme.colors.background}`,
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: theme.colors.border,
                color: theme.colors.text
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.primary
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.border
              }}
            />
            <button
              type="submit"
              disabled={!userInput.trim()}
              className="px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-30"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.background
              }}
            >
              Send
            </button>
          </div>
          <div className="mt-2 text-xs opacity-40 font-mono">
            Press Enter to send
          </div>
        </form>
      ) : null}
    </div>
  )
}

