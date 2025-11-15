'use client'

import { PageHeader } from '@/components/PageHeader'
import { Send, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface Message {
  id: string
  role: 'user' | 'coach'
  content: string
  created_at: string
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'coach',
      content: 'Hello! I'm your campaign coach. I can help you plan your next steps, refine your strategy, or answer questions about your workflow. What's on your mind today?',
      created_at: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: String(messages.length + 1),
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    }

    setMessages([...messages, userMessage])
    setInput('')
    setIsThinking(true)

    // Simulate AI response
    setTimeout(() => {
      const coachMessage: Message = {
        id: String(messages.length + 2),
        role: 'coach',
        content: `I understand you're thinking about "${input}". Here's my suggestion: Focus on one actionable step at a time. Would you like me to help you break this down into concrete tasks?`,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, coachMessage])
      setIsThinking(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-matte-black flex flex-col">
      <PageHeader
        title="Coach"
        description="AI-powered campaign guidance"
      />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-3xl flex flex-col">
        {/* Messages */}
        <div className="flex-1 space-y-4 mb-6 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-slate-cyan text-white'
                    : 'bg-gray-900/50 border border-gray-800 text-gray-300'
                }`}
              >
                {message.role === 'coach' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-slate-cyan" />
                    <span className="text-xs font-medium text-slate-cyan">Coach</span>
                  </div>
                )}
                <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-60 mt-2 block">
                  {new Date(message.created_at).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-cyan animate-pulse" />
                  <span className="text-sm text-gray-400">Coach is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach anything... (Press Enter to send)"
            className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:outline-none resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isThinking}
              className="flex items-center gap-2 px-4 py-2 bg-slate-cyan hover:bg-slate-cyan/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colours"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
