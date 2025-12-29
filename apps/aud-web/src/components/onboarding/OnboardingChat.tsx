/**
 * OnboardingChat Component
 *
 * Conversational onboarding experience with "Audio" personality.
 * Collects artist name, genre, project details, release date, and goals
 * through a natural chat interface.
 *
 * Uses Claude API for intelligent responses and data extraction.
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, ArrowRight } from 'lucide-react'
import {
  useUserProfileStore,
  type PrimaryGoal,
  type ProjectType,
} from '@/stores/useUserProfileStore'
import { logger } from '@/lib/logger'

const log = logger.scope('Onboarding Chat')

interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: Date
  quickReplies?: QuickReply[]
}

interface QuickReply {
  label: string
  value: string
}

interface OnboardingData {
  artistName?: string
  genre?: string
  vibe?: string
  projectType?: ProjectType
  projectTitle?: string
  releaseDate?: string
  primaryGoal?: PrimaryGoal
  isComplete?: boolean
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hey! I'm Audio, here to help you get your music heard. What's your artist or project name?",
  timestamp: new Date(),
}

export function OnboardingChat() {
  const router = useRouter()
  const { setProfile, completeOnboarding } = useUserProfileStore()

  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [collectedData, setCollectedData] = useState<OnboardingData>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Handle completion and redirect
  const handleComplete = useCallback(
    async (data: OnboardingData) => {
      // Save profile
      setProfile({
        artistName: data.artistName || '',
        genre: data.genre || '',
        vibe: data.vibe || '',
        projectType: data.projectType || 'none',
        projectTitle: data.projectTitle || '',
        releaseDate: data.releaseDate || null,
        primaryGoal: data.primaryGoal || 'explore',
        goals: [],
      })
      completeOnboarding()

      // Send welcome email (fire and forget - don't block redirect)
      fetch('/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistName: data.artistName || 'Artist',
          primaryGoal: data.primaryGoal || 'explore',
        }),
      }).catch((err) => {
        log.warn('Failed to trigger welcome email', err)
      })

      // Redirect based on goal
      const modeMap: Record<PrimaryGoal, string> = {
        discover: 'scout',
        plan: 'timeline',
        pitch: 'pitch',
        explore: 'ideas',
      }
      const mode = modeMap[data.primaryGoal || 'explore']

      // Small delay for the final message to be read
      setTimeout(() => {
        router.push(`/workspace?mode=${mode}`)
      }, 1500)
    },
    [setProfile, completeOnboarding, router]
  )

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/onboarding/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          collectedData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      // Update collected data
      if (data.extractedData) {
        setCollectedData((prev) => ({ ...prev, ...data.extractedData }))
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        quickReplies: data.quickReplies,
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Check if onboarding is complete
      if (data.isComplete) {
        handleComplete({ ...collectedData, ...data.extractedData })
      }
    } catch (error) {
      log.error('Chat error', error)
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Hmm, something went wrong on my end. Could you try that again?',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleQuickReply = (value: string) => {
    sendMessage(value)
  }

  const handleSkip = () => {
    // Set minimal profile and go to workspace
    setProfile({
      artistName: collectedData.artistName || 'Artist',
      primaryGoal: 'explore',
    })
    completeOnboarding()
    router.push('/workspace')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0F1113',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3AA9BE 0%, #2D8A9C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 600,
              color: '#0F1113',
            }}
          >
            A
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#F7F8F9' }}>Audio</span>
        </div>
        <button
          onClick={handleSkip}
          className="skip-button"
          style={{
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.5)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            cursor: 'pointer',
            padding: '8px 14px',
            transition: 'all 0.15s ease',
          }}
        >
          Skip →
        </button>
      </header>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          maxWidth: 640,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 8,
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  padding: '14px 18px',
                  borderRadius:
                    message.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  backgroundColor:
                    message.role === 'user'
                      ? 'rgba(58, 169, 190, 0.15)'
                      : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${
                    message.role === 'user'
                      ? 'rgba(58, 169, 190, 0.3)'
                      : 'rgba(255, 255, 255, 0.08)'
                  }`,
                }}
              >
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.5,
                    color: message.role === 'user' ? '#3AA9BE' : '#F7F8F9',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {message.content}
                </p>
              </div>

              {/* Quick replies */}
              {message.quickReplies && message.quickReplies.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {message.quickReplies.map((reply) => (
                    <button
                      key={reply.value}
                      onClick={() => handleQuickReply(reply.value)}
                      disabled={isLoading}
                      style={{
                        padding: '10px 16px',
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#3AA9BE',
                        backgroundColor: 'rgba(58, 169, 190, 0.1)',
                        border: '1px solid rgba(58, 169, 190, 0.3)',
                        borderRadius: 20,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                        opacity: isLoading ? 0.5 : 1,
                      }}
                    >
                      {reply.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 18px',
              maxWidth: '85%',
              borderRadius: '18px 18px 18px 4px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Loader2
              size={16}
              style={{ color: 'rgba(255, 255, 255, 0.5)', animation: 'spin 1s linear infinite' }}
            />
            <span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.5)' }}>
              Audio is typing...
            </span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Continue to Workspace button - shown after first response */}
      {messages.length > 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            padding: '0 24px 16px',
            maxWidth: 640,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <button
            onClick={handleSkip}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px 20px',
              fontSize: 14,
              fontWeight: 500,
              color: '#3AA9BE',
              backgroundColor: 'rgba(58, 169, 190, 0.1)',
              border: '1px solid rgba(58, 169, 190, 0.25)',
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Continue to Workspace
            <ArrowRight size={16} />
          </button>
        </motion.div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '16px 24px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          maxWidth: 640,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 12,
            padding: '4px 4px 4px 18px',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: '#F7F8F9',
              padding: '12px 0',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: input.trim() ? '#3AA9BE' : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <Send
              size={18}
              style={{ color: input.trim() ? '#0F1113' : 'rgba(255, 255, 255, 0.3)' }}
            />
          </button>
        </div>
        <p
          style={{
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.3)',
            textAlign: 'center',
            marginTop: 12,
          }}
        >
          Press Enter to send
        </p>
      </form>

      {/* Animations and hover effects */}
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .skip-button:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          color: rgba(255, 255, 255, 0.7) !important;
        }
      `}</style>
    </div>
  )
}
