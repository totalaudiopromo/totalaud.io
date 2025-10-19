/**
 * Agent Execution Hook
 *
 * Provides real-time agent execution tracking for Flow Canvas.
 * Subscribes to agent_activity_log and provides executeNode function.
 *
 * Design Principle: "Each agent is a performer. Broker conducts. The user directs."
 */

import { useState, useEffect, useCallback } from 'react'
import type { SupabaseClient, RealtimeChannel } from '@total-audio/core-supabase'
import type { AgentActivity } from '../config/agentRoles'

export interface UseAgentExecutionOptions {
  /** Supabase client instance */
  supabaseClient: SupabaseClient
  /** Session ID to filter activity logs */
  sessionId: string
  /** Enable realtime subscriptions (default: true) */
  enableRealtime?: boolean
}

export interface UseAgentExecutionReturn {
  /** Execute a node with a specific agent */
  executeNode: (agent: string, nodeId: string, payload?: any) => Promise<void>
  /** All activity updates for this session */
  updates: AgentActivity[]
  /** Activity updates grouped by node ID */
  updatesByNode: Record<string, AgentActivity[]>
  /** Latest status for each node */
  nodeStatuses: Record<string, AgentActivity>
  /** Cancel execution of a node */
  cancelNode: (nodeId: string) => Promise<void>
  /** Clear all activity logs for this session */
  clearLogs: () => Promise<void>
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: Error | null
}

/**
 * Hook for managing agent execution with real-time updates
 */
export function useAgentExecution({
  supabaseClient,
  sessionId,
  enableRealtime = true,
}: UseAgentExecutionOptions): UseAgentExecutionReturn {
  const [updates, setUpdates] = useState<AgentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch initial activity logs
  useEffect(() => {
    const fetchInitialLogs = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabaseClient
          .from('agent_activity_log')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true })

        if (fetchError) throw fetchError

        setUpdates((data as AgentActivity[]) || [])
      } catch (err) {
        setError(err as Error)
        console.error('[useAgentExecution] Failed to fetch initial logs:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (sessionId) {
      fetchInitialLogs()
    }
  }, [supabaseClient, sessionId])

  // Subscribe to realtime updates
  useEffect(() => {
    if (!enableRealtime || !sessionId) return

    let channel: RealtimeChannel | null = null

    const setupRealtimeSubscription = async () => {
      try {
        channel = supabaseClient
          .channel(`agent-activity-${sessionId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'agent_activity_log',
              filter: `session_id=eq.${sessionId}`,
            },
            (payload: any) => {
              const newActivity = payload.new as AgentActivity
              setUpdates((prev) => [...prev, newActivity])
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'agent_activity_log',
              filter: `session_id=eq.${sessionId}`,
            },
            (payload: any) => {
              const updatedActivity = payload.new as AgentActivity
              setUpdates((prev) =>
                prev.map((activity) =>
                  activity.id === updatedActivity.id ? updatedActivity : activity
                )
              )
            }
          )
          .subscribe()
      } catch (err) {
        console.error('[useAgentExecution] Failed to setup realtime subscription:', err)
        setError(err as Error)
      }
    }

    setupRealtimeSubscription()

    return () => {
      if (channel) {
        supabaseClient.removeChannel(channel)
      }
    }
  }, [supabaseClient, sessionId, enableRealtime])

  // Execute a node with a specific agent
  const executeNode = useCallback(
    async (agent: string, nodeId: string, payload?: any) => {
      try {
        // Insert "running" status
        const { error: insertError } = await supabaseClient
          .from('agent_activity_log')
          .insert({
            agent_name: agent,
            session_id: sessionId,
            node_id: nodeId,
            status: 'running',
            message: `Agent ${agent} executing ${nodeId}`,
            metadata: payload || {},
            started_at: new Date().toISOString(),
          })

        if (insertError) throw insertError

        // Simulate agent execution (replace with actual agent orchestration)
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Insert "complete" status
        const { error: completeError } = await supabaseClient
          .from('agent_activity_log')
          .insert({
            agent_name: agent,
            session_id: sessionId,
            node_id: nodeId,
            status: 'complete',
            message: `Agent ${agent} completed ${nodeId}`,
            result: { success: true, timestamp: new Date().toISOString() },
            completed_at: new Date().toISOString(),
          })

        if (completeError) throw completeError
      } catch (err) {
        console.error('[useAgentExecution] Failed to execute node:', err)

        // Insert "error" status
        await supabaseClient.from('agent_activity_log').insert({
          agent_name: agent,
          session_id: sessionId,
          node_id: nodeId,
          status: 'error',
          message: `Agent ${agent} failed: ${(err as Error).message}`,
          metadata: { error: (err as Error).message },
          completed_at: new Date().toISOString(),
        })

        throw err
      }
    },
    [supabaseClient, sessionId]
  )

  // Cancel execution of a node
  const cancelNode = useCallback(
    async (nodeId: string) => {
      try {
        const { error: cancelError } = await supabaseClient
          .from('agent_activity_log')
          .insert({
            session_id: sessionId,
            node_id: nodeId,
            agent_name: 'system',
            status: 'cancelled',
            message: `Node ${nodeId} cancelled by user`,
            completed_at: new Date().toISOString(),
          })

        if (cancelError) throw cancelError
      } catch (err) {
        console.error('[useAgentExecution] Failed to cancel node:', err)
        throw err
      }
    },
    [supabaseClient, sessionId]
  )

  // Clear all activity logs for this session
  const clearLogs = useCallback(async () => {
    try {
      const { error: deleteError } = await supabaseClient
        .from('agent_activity_log')
        .delete()
        .eq('session_id', sessionId)

      if (deleteError) throw deleteError

      setUpdates([])
    } catch (err) {
      console.error('[useAgentExecution] Failed to clear logs:', err)
      throw err
    }
  }, [supabaseClient, sessionId])

  // Compute derived state: updates grouped by node ID
  const updatesByNode: Record<string, AgentActivity[]> = {}
  for (const activity of updates) {
    if (!updatesByNode[activity.node_id]) {
      updatesByNode[activity.node_id] = []
    }
    updatesByNode[activity.node_id].push(activity)
  }

  // Compute derived state: latest status for each node
  const nodeStatuses: Record<string, AgentActivity> = {}
  for (const activity of updates) {
    const existing = nodeStatuses[activity.node_id]
    if (
      !existing ||
      new Date(activity.created_at) > new Date(existing.created_at)
    ) {
      nodeStatuses[activity.node_id] = activity
    }
  }

  return {
    executeNode,
    updates,
    updatesByNode,
    nodeStatuses,
    cancelNode,
    clearLogs,
    isLoading,
    error,
  }
}
