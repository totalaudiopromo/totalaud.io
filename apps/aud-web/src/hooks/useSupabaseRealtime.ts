"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key"
)

export interface SkillExecution {
  id: string
  skill_name: string
  input: any
  output: any
  duration_ms: number
  tokens_used: number
  cost_usd: number
  status: string
  user_id: string
  started_at: string
  completed_at: string
}

export function useSupabaseRealtime(userId?: string) {
  const [executions, setExecutions] = useState<SkillExecution[]>([])
  const [latestExecution, setLatestExecution] = useState<SkillExecution | null>(null)

  useEffect(() => {
    // Subscribe to skill_executions table
    const channel = supabase
      .channel("skill_executions_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "skill_executions",
          filter: userId ? `user_id=eq.${userId}` : undefined
        },
        (payload: any) => {
          console.log("Realtime update:", payload)

          if (payload.eventType === "INSERT") {
            const newExecution = payload.new as SkillExecution
            setLatestExecution(newExecution)
            setExecutions((prev) => [newExecution, ...prev])
          } else if (payload.eventType === "UPDATE") {
            const updatedExecution = payload.new as SkillExecution
            setLatestExecution(updatedExecution)
            setExecutions((prev) =>
              prev.map((exec) =>
                exec.id === updatedExecution.id ? updatedExecution : exec
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return { executions, latestExecution }
}

export function useAgentSessionRealtime(sessionId?: string) {
  const [session, setSession] = useState<any>(null)
  const [steps, setSteps] = useState<any[]>([])

  useEffect(() => {
    if (!sessionId) return

    // Subscribe to agent_sessions
    const sessionChannel = supabase
      .channel(`agent_session_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "agent_sessions",
          filter: `id=eq.${sessionId}`
        },
        (payload: any) => {
          console.log("Session update:", payload)
          setSession(payload.new)
        }
      )
      .subscribe()

    // Subscribe to agent_session_steps
    const stepsChannel = supabase
      .channel(`agent_session_steps_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agent_session_steps",
          filter: `session_id=eq.${sessionId}`
        },
        (payload: any) => {
          console.log("Step update:", payload)
          
          if (payload.eventType === "INSERT") {
            setSteps((prev) => [...prev, payload.new])
          } else if (payload.eventType === "UPDATE") {
            setSteps((prev) =>
              prev.map((step) =>
                step.id === payload.new.id ? payload.new : step
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sessionChannel)
      supabase.removeChannel(stepsChannel)
    }
  }, [sessionId])

  return { session, steps }
}

