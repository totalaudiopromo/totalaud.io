"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  role: "user" | "agent" | "system"
  content: string
  data?: any
  timestamp: Date
}

interface AgentChatProps {
  agentName?: string
  agentEmoji?: string
  agentColor?: string
  onClose?: () => void
}

export default function AgentChat({
  agentName = "promo-coach",
  agentEmoji = "🎙️",
  agentColor = "#6366f1",
  onClose
}: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: `Hi! I'm your ${agentName.replace("-", " ")} ${agentEmoji}. Ask me to find contacts, create pitches, or analyze campaigns!`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch(`/api/agents/${agentName}/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer demo-token"
        },
        body: JSON.stringify({
          steps: [
            {
              skill: "research-contacts",
              description: "Find relevant contacts",
              input: {
                query: input,
                type: "radio",
                genres: ["indie", "electronic"],
                regions: ["UK"],
                max_results: 3
              }
            }
          ]
        })
      })

      if (!response.body) {
        throw new Error("No response body")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n\n")

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i]
          if (line.startsWith("event:")) {
            const eventMatch = line.match(/event: (\w+)\ndata: (.+)/)
            if (eventMatch) {
              const [, event, dataStr] = eventMatch
              
              try {
                const data = JSON.parse(dataStr)
                
                if (event === "start") {
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: "system",
                      content: "🔄 Starting workflow...",
                      timestamp: new Date()
                    }
                  ])
                } else if (event === "update") {
                  // Show step updates
                  if (data.status === "running") {
                    setMessages((prev) => [
                      ...prev,
                      {
                        role: "system",
                        content: `⚙️ ${data.description}...`,
                        timestamp: new Date()
                      }
                    ])
                  } else if (data.status === "completed" && data.output) {
                    setMessages((prev) => [
                      ...prev,
                      {
                        role: "agent",
                        content: formatOutput(data.output),
                        data: data.output,
                        timestamp: new Date()
                      }
                    ])
                  }
                } else if (event === "complete") {
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: "system",
                      content: `✅ Completed in ${data.duration_ms}ms`,
                      timestamp: new Date()
                    }
                  ])
                } else if (event === "error") {
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: "system",
                      content: `❌ Error: ${data.message}`,
                      timestamp: new Date()
                    }
                  ])
                }
              } catch (parseError) {
                console.error("Failed to parse SSE data:", parseError)
              }
            }
          }
        }

        buffer = lines[lines.length - 1]
      }
    } catch (error) {
      console.error("Agent chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `❌ Failed to connect: ${error instanceof Error ? error.message : "Unknown error"}`,
          timestamp: new Date()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  function formatOutput(output: any): string {
    if (output.contacts && Array.isArray(output.contacts)) {
      const count = output.contacts.length
      const names = output.contacts.map((c: any) => c.name).join(", ")
      return `Found ${count} contact${count !== 1 ? "s" : ""}: ${names}`
    }
    return JSON.stringify(output, null, 2)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 flex flex-col w-96 h-[600px] bg-slate-800/95 backdrop-blur-xl border-2 rounded-2xl shadow-2xl overflow-hidden"
      style={{ borderColor: agentColor }}
    >
      {/* Header */}
      <div
        className="p-4 border-b border-slate-700 flex items-center justify-between"
        style={{ backgroundColor: `${agentColor}15` }}
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl">{agentEmoji}</div>
          <div>
            <h3 className="font-bold text-white capitalize">
              {agentName.replace("-", " ")}
            </h3>
            <p className="text-xs text-slate-400">
              {loading ? "Thinking..." : "Online"}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-br-sm"
                    : msg.role === "agent"
                    ? "text-white rounded-bl-sm"
                    : "bg-slate-700/50 text-slate-300 text-sm italic"
                }`}
                style={
                  msg.role === "agent"
                    ? { backgroundColor: agentColor }
                    : undefined
                }
              >
                {msg.content}
                {msg.data?.contacts && (
                  <div className="mt-2 space-y-2">
                    {msg.data.contacts.map((contact: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white/10 rounded-lg p-2 text-sm"
                      >
                        <div className="font-bold">{contact.name}</div>
                        <div className="text-xs opacity-80">{contact.outlet}</div>
                        <div className="text-xs opacity-60">{contact.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700 bg-slate-900/50">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={`Ask ${agentName.replace("-", " ")}...`}
            disabled={loading}
            className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-xl outline-none focus:ring-2 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: agentColor,
              color: "white"
            }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
        <div className="mt-2 text-xs text-slate-500 text-center">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </motion.div>
  )
}

