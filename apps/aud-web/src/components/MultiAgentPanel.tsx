"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { motion, AnimatePresence } from "framer-motion"

interface AgentMessage {
  id: string
  from_agent: string
  to_agent: string
  content: string
  message_type: string
  created_at: string
}

interface MultiAgentPanelProps {
  sessionId: string
}

export default function MultiAgentPanel({ sessionId }: MultiAgentPanelProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [agents] = useState([
    { name: "Scout", emoji: "🧭", color: "#10b981" },
    { name: "Coach", emoji: "🎙️", color: "#6366f1" },
    { name: "Tracker", emoji: "📊", color: "#f59e0b" },
    { name: "Insight", emoji: "💡", color: "#8b5cf6" }
  ])
  const [content, setContent] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("Scout")

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Fetch existing messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("agent_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
      
      if (data) setMessages(data)
    }

    fetchMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel(`agent_messages_${sessionId}`)
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "agent_messages",
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as AgentMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  async function sendMessage(toAgent: string) {
    if (!content.trim()) return

    try {
      await fetch("/api/agents/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_agent: "user",
          to_agent: toAgent.toLowerCase(),
          content,
          session_id: sessionId,
          message_type: "request"
        })
      })
      setContent("")
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  function getAgentColor(agentName: string) {
    const agent = agents.find(a => agentName.toLowerCase().includes(a.name.toLowerCase()))
    return agent?.color || "#6366f1"
  }

  function getAgentEmoji(agentName: string) {
    const agent = agents.find(a => agentName.toLowerCase().includes(a.name.toLowerCase()))
    return agent?.emoji || "🤖"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/70 backdrop-blur-xl rounded-xl p-4 border border-slate-700 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-200 flex items-center gap-2">
          <span className="text-2xl">💬</span>
          Multi-Agent Chat
        </h2>
        <span className="text-xs text-slate-500 bg-slate-900/50 px-2 py-1 rounded">
          {messages.length} messages
        </span>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2 bg-slate-900/30 rounded-lg p-3">
        <AnimatePresence>
          {messages.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-4">
              No messages yet. Send one to start the conversation!
            </p>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm bg-slate-800/50 rounded-lg p-2 border border-slate-700/50"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{getAgentEmoji(msg.from_agent)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="font-medium"
                        style={{ color: getAgentColor(msg.from_agent) }}
                      >
                        {msg.from_agent}
                      </span>
                      <span className="text-slate-500">→</span>
                      <span 
                        className="font-medium"
                        style={{ color: getAgentColor(msg.to_agent) }}
                      >
                        {msg.to_agent}
                      </span>
                      <span className="text-xs text-slate-600 ml-auto">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-300 break-words">{msg.content}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-2">
        <div className="flex gap-1 flex-wrap">
          {agents.map((agent) => (
            <button
              key={agent.name}
              onClick={() => setSelectedAgent(agent.name)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                selectedAgent === agent.name
                  ? "ring-2 ring-offset-2 ring-offset-slate-800"
                  : "opacity-60 hover:opacity-100"
              }`}
              style={{
                backgroundColor: agent.color + "20",
                color: agent.color,
                ...(selectedAgent === agent.name && {
                  '--tw-ring-color': agent.color
                } as any)
              }}
            >
              {agent.emoji} {agent.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage(selectedAgent)
              }
            }}
            placeholder={`Message ${selectedAgent}...`}
            className="flex-1 bg-slate-900 rounded-lg px-3 py-2 text-sm outline-none border border-slate-700 focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={() => sendMessage(selectedAgent)}
            disabled={!content.trim()}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </motion.div>
  )
}

