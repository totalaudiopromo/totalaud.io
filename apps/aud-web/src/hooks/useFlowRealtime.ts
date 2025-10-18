"use client"

import { useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { useFlowStore } from "@/stores/flowStore"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key"
)

export function useFlowRealtime(
  updateNodeStatus: (nodeId: string, status: string, output?: any) => void
) {
  const { sessionId } = useFlowStore()

  useEffect(() => {
    if (!sessionId) return

    // Subscribe to agent_session_steps for this session
    const channel = supabase
      .channel(`flow_session_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agent_session_steps",
          filter: `session_id=eq.${sessionId}`
        },
        (payload: any) => {
          console.log("Flow step update:", payload)

          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const { step_number, status, skill_name, output } = payload.new

            // Update node status based on step number
            const nodeId = `skill-${step_number}`
            updateNodeStatus(nodeId, status, output)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, updateNodeStatus])
}

export function useFlowSessionSync(flowId?: string) {
  const { setNodes, setEdges, setSessionId } = useFlowStore()

  useEffect(() => {
    if (!flowId) return

    // Load flow from API
    fetch(`/api/flows/${flowId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.flow) {
          setSessionId(data.flow.id)
          
          // Convert steps to nodes/edges if needed
          if (data.flow.agent_session_steps) {
            // TODO: Convert database steps to React Flow nodes
          }
        }
      })
      .catch((error) => {
        console.error("Failed to load flow:", error)
      })
  }, [flowId, setNodes, setEdges, setSessionId])
}

