'use client'

/**
 * Aqua OS Page - Coach Agent Interface
 * Supports director-triggered agent interactions
 */

import { useEffect, useState } from 'react'
import { useDirector } from '@/components/demo/director/DirectorProvider'
import { MessageCircle, Sparkles, Send } from 'lucide-react'

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
    <div className="w-full h-full bg-gradient-to-br from-[#E8F4F8] to-[#D4E8F0] text-[#1A3A4A] overflow-hidden">
      {/* Glassy header */}
      <div className="backdrop-blur-xl bg-white/40 border-b border-white/60 px-6 py-4">
        <div className="flex items-centre gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#3AA9BE] to-[#2A8AA0] rounded-full flex items-centre justify-centre">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Coach Agent</h1>
            <p className="text-sm text-[#1A3A4A]/60">Strategic guidance & creative direction</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-[calc(100%-180px)] overflow-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[80%] rounded-2xl px-4 py-3 backdrop-blur-sm
                ${
                  message.role === 'user'
                    ? 'bg-[#3AA9BE] text-white'
                    : 'bg-white/60 text-[#1A3A4A] border border-white/60'
                }
              `}
            >
              <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
              <div
                className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-white/60' : 'text-[#1A3A4A]/40'}`}
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
          <div className="flex justify-start">
            <div className="bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl px-4 py-3">
              <div className="flex items-centre gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#3AA9BE] rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-[#3AA9BE] rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className="w-2 h-2 bg-[#3AA9BE] rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
                <span className="text-xs text-[#1A3A4A]/60">Coach is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="absolute bottom-0 left-0 right-0 backdrop-blur-xl bg-white/40 border-t border-white/60 p-6">
        <div className="flex items-centre gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isThinking}
            placeholder="Ask Coach anything..."
            className="flex-1 bg-white/60 backdrop-blur-sm border border-white/60 rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3AA9BE]/50 transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isThinking}
            className="w-12 h-12 bg-gradient-to-br from-[#3AA9BE] to-[#2A8AA0] rounded-full flex items-centre justify-centre text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Aqua glassy orbs decoration */}
      <div className="fixed top-20 right-20 w-64 h-64 bg-gradient-to-br from-[#3AA9BE]/20 to-[#2A8AA0]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-[#3AA9BE]/10 to-[#2A8AA0]/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  )
}
