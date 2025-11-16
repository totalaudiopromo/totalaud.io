'use client'

/**
 * Aqua OS Page - Coach Agent Interface (Phase 29 Polished)
 * Supports director-triggered agent interactions
 * Uses design tokens with glassy Aqua aesthetic
 */

import { useEffect, useState } from 'react'
import { useDirector } from '@/components/demo/director/DirectorProvider'
import { Sparkles, Send } from 'lucide-react'
import { spacing, radii, colours } from '@/styles/tokens'
import { duration, easing } from '@/styles/motion'

// Aqua OS specific colours (glassy macOS Aqua aesthetic)
const AQUA_BG_FROM = '#E8F4F8'
const AQUA_BG_TO = '#D4E8F0'
const AQUA_TEXT = '#1A3A4A'
const AQUA_TEXT_DIM = 'rgba(26, 58, 74, 0.6)'
const AQUA_GLASS_BG = 'rgba(255, 255, 255, 0.4)'
const AQUA_GLASS_BORDER = 'rgba(255, 255, 255, 0.6)'
const AQUA_MESSAGE_USER_BG = colours.accent
const AQUA_MESSAGE_ASSISTANT_BG = 'rgba(255, 255, 255, 0.6)'
const AQUA_BLUR = '16px' // Standardized blur radius

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content: `Hello! I'm your Coach agent. I can help you with:

• Strategic planning for releases
• Marketing and promotion guidance
• Creative direction and positioning
• Industry insights and best practices

What would you like to explore today?`,
    timestamp: new Date(Date.now() - 120000),
  },
]

export function AquaOSPage() {
  const director = useDirector()
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)

  // Register director callback
  useEffect(() => {
    director.engine.setCallbacks({
      onOpenAquaAgent: () => {
        askCoachAboutPitch()
      },
    })
  }, [director])

  const askCoachAboutPitch = () => {
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content:
        'I want to pitch the "Midnight Signals" EP to playlist curators. What should I emphasize?',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsThinking(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: `Great question! Here's what to emphasize when pitching "Midnight Signals":

**🎯 Core Identity**
• Late-night creative energy and urban solitude themes
• Unique neon/nostalgic aesthetic (differentiates from standard lo-fi)
• Authentic artist journey and creative process

**📊 Playlist Fit**
• Target: late-night study, chill beats, indie electronic playlists
• Mention any Spotify for Artists stats showing listener retention
• Highlight if you have existing playlist placements

**🎨 Visual Hook**
• Lead with the striking midnight/neon visual direction
• Curators love cohesive aesthetic + sound packages
• Share mood board or cover art to create instant impression

**💡 Pitch Template**:
"Midnight Signals explores late-night creative isolation through lo-fi beats with a neon-soaked, nostalgic aesthetic. Perfect for [specific playlist name] listeners who appreciate atmospheric, introspective electronic music."

Would you like me to help draft specific pitch emails for your target playlists?`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsThinking(false)
    }, 3000)
  }

  const handleSendMessage = () => {
    if (!inputValue.trim() || isThinking) return

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsThinking(true)

    // Simulate response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: `I can help with that! Let me provide some strategic guidance...`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsThinking(false)
    }, 2000)
  }

  return (
    <div
      className="w-full h-full overflow-hidden"
      style={{
        background: `linear-gradient(to bottom right, ${AQUA_BG_FROM}, ${AQUA_BG_TO})`,
        color: AQUA_TEXT,
      }}
    >
      {/* Glassy header */}
      <div
        style={{
          backdropFilter: `blur(${AQUA_BLUR})`,
          backgroundColor: AQUA_GLASS_BG,
          borderBottom: `1px solid ${AQUA_GLASS_BORDER}`,
          padding: `${spacing[4]} ${spacing[6]}`,
        }}
      >
        <div className="flex items-center" style={{ gap: spacing[3] }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: '40px',
              height: '40px',
              background: `linear-gradient(to bottom right, ${colours.accent}, #2A8AA0)`,
              borderRadius: radii.full,
            }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700' }}>Coach Agent</h1>
            <p style={{ fontSize: '14px', color: AQUA_TEXT_DIM, marginTop: spacing[0] }}>
              Strategic guidance & creative direction
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="overflow-auto"
        style={{
          height: 'calc(100% - 180px)',
          padding: spacing[6],
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[4],
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className="flex"
            style={{ justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <div
              style={{
                maxWidth: '80%',
                borderRadius: radii.xl,
                padding: `${spacing[3]} ${spacing[4]}`,
                backdropFilter: `blur(${AQUA_BLUR})`,
                backgroundColor: message.role === 'user' ? AQUA_MESSAGE_USER_BG : AQUA_MESSAGE_ASSISTANT_BG,
                border: message.role === 'user' ? 'none' : `1px solid ${AQUA_GLASS_BORDER}`,
                color: message.role === 'user' ? '#FFFFFF' : AQUA_TEXT,
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                }}
              >
                {message.content}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  marginTop: spacing[1],
                  opacity: message.role === 'user' ? 0.6 : 0.4,
                }}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex" style={{ justifyContent: 'flex-start' }}>
            <div
              style={{
                backgroundColor: AQUA_MESSAGE_ASSISTANT_BG,
                backdropFilter: `blur(${AQUA_BLUR})`,
                border: `1px solid ${AQUA_GLASS_BORDER}`,
                borderRadius: radii.xl,
                padding: `${spacing[3]} ${spacing[4]}`,
              }}
            >
              <div className="flex items-center" style={{ gap: spacing[2] }}>
                <div className="flex" style={{ gap: spacing[1] }}>
                  <div
                    className="animate-bounce"
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: colours.accent,
                      borderRadius: radii.full,
                    }}
                  />
                  <div
                    className="animate-bounce"
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: colours.accent,
                      borderRadius: radii.full,
                      animationDelay: '0.2s',
                    }}
                  />
                  <div
                    className="animate-bounce"
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: colours.accent,
                      borderRadius: radii.full,
                      animationDelay: '0.4s',
                    }}
                  />
                </div>
                <span style={{ fontSize: '12px', color: AQUA_TEXT_DIM }}>Coach is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          backdropFilter: `blur(${AQUA_BLUR})`,
          backgroundColor: AQUA_GLASS_BG,
          borderTop: `1px solid ${AQUA_GLASS_BORDER}`,
          padding: spacing[6],
        }}
      >
        <div className="flex items-center" style={{ gap: spacing[3] }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isThinking}
            placeholder="Ask Coach anything..."
            style={{
              flex: 1,
              backgroundColor: AQUA_MESSAGE_ASSISTANT_BG,
              backdropFilter: `blur(${AQUA_BLUR})`,
              border: `1px solid ${AQUA_GLASS_BORDER}`,
              borderRadius: radii.full,
              padding: `${spacing[3]} ${spacing[4]}`,
              fontSize: '14px',
              outline: 'none',
              transition: `all ${duration.fast}s ${easing.default}`,
              opacity: isThinking ? 0.5 : 1,
              color: AQUA_TEXT,
            }}
            className="focus:ring-2"
            onFocus={(e) => {
              e.target.style.boxShadow = `0 0 0 2px ${colours.accent}80`
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isThinking}
            className="flex items-center justify-center hover:scale-105"
            style={{
              width: '48px',
              height: '48px',
              background: `linear-gradient(to bottom right, ${colours.accent}, #2A8AA0)`,
              borderRadius: radii.full,
              color: '#FFFFFF',
              transition: `transform ${duration.fast}s ${easing.default}`,
              opacity: !inputValue.trim() || isThinking ? 0.5 : 1,
              cursor: !inputValue.trim() || isThinking ? 'not-allowed' : 'pointer',
            }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Aqua glassy orbs decoration (ambient bloom) */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: '80px',
          right: '80px',
          width: '256px',
          height: '256px',
          background: `linear-gradient(to bottom right, ${colours.accent}33, #2A8AA019)`,
          borderRadius: radii.full,
          filter: 'blur(64px)',
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: '80px',
          left: '80px',
          width: '192px',
          height: '192px',
          background: `linear-gradient(to bottom right, ${colours.accent}1A, #2A8AA00D)`,
          borderRadius: radii.full,
          filter: 'blur(64px)',
        }}
      />
    </div>
  )
}
