/**
 * Broker Command Bridge Hook
 *
 * Enables natural language command parsing and agent workflow orchestration.
 * Broker acts as the conductor, interpreting user intent and delegating to agents.
 *
 * Design Principle: "Running your campaign should feel like pressing play."
 */

import { useCallback } from 'react'
import { goalToFlowMap, type FlowTemplate } from '../config/goalToFlowMap'
import { getAgentBySkill } from '../config/agentRoles'
import type { UseAgentExecutionReturn } from './useAgentExecution'
import type { BrokerMemoryData } from './types'

export interface CommandBridgeOptions {
  /** Agent execution hook instance */
  agentExecution: UseAgentExecutionReturn
  /** Broker memory data */
  memory?: BrokerMemoryData
  /** Theme-specific sound functions (optional) */
  themeSounds?: {
    start?: (agentId: string) => void
    complete?: (agentId: string) => void
    error?: (agentId: string) => void
  }
  /** Callback when command is recognized */
  onCommandRecognized?: (command: string, intent: CommandIntent) => void
  /** Callback when flow starts */
  onFlowStart?: (template: FlowTemplate) => void
  /** Callback when flow completes */
  onFlowComplete?: (results: FlowExecutionResult) => void
  /** Callback when flow fails */
  onFlowError?: (error: Error) => void
}

export interface CommandIntent {
  action: 'execute_flow' | 'pause_flow' | 'resume_flow' | 'cancel_flow' | 'retry_node' | 'unknown'
  target?: string
  parameters?: Record<string, any>
}

export interface FlowExecutionResult {
  template: FlowTemplate
  startedAt: Date
  completedAt: Date
  durationMs: number
  nodesExecuted: number
  nodesSucceeded: number
  nodesFailed: number
  results: Record<string, any>
}

export interface UseCommandBridgeReturn {
  /** Parse natural language command and execute workflow */
  parseCommand: (message: string) => Promise<CommandIntent | null>
  /** Execute a complete flow template */
  runFlow: (goal: string, parallel?: boolean) => Promise<FlowExecutionResult | null>
  /** Execute specific nodes in sequence */
  runSequence: (nodeIds: string[]) => Promise<void>
  /** Cancel current flow execution */
  cancelFlow: () => Promise<void>
  /** Retry failed nodes */
  retryFailedNodes: () => Promise<void>
  /** Get current execution status */
  isExecuting: boolean
}

/**
 * Hook for parsing natural language commands and orchestrating agent workflows
 */
export function useCommandBridge({
  agentExecution,
  memory,
  themeSounds,
  onCommandRecognized,
  onFlowStart,
  onFlowComplete,
  onFlowError,
}: CommandBridgeOptions): UseCommandBridgeReturn {
  const { executeNode, nodeStatuses, cancelNode, clearLogs } = agentExecution

  // Track execution state
  const isExecuting = Object.values(nodeStatuses).some(
    (status) => status.status === 'running' || status.status === 'queued'
  )

  /**
   * Execute a complete flow template
   */
  const runFlow = useCallback(
    async (goal: string, parallel = false): Promise<FlowExecutionResult | null> => {
      const goalKey = goal.toLowerCase().trim()
      const template = goalToFlowMap[goalKey]

      if (!template) {
        console.warn('[useCommandBridge] No template found for goal:', goal)
        return null
      }

      const startedAt = new Date()
      onFlowStart?.(template)

      const results: Record<string, any> = {}
      let nodesSucceeded = 0
      let nodesFailed = 0

      try {
        if (parallel) {
          // Execute all nodes in parallel
          await Promise.all(
            template.steps.map(async (step) => {
              const agent = getAgentBySkill(step.skillId || '')
              const agentId = agent?.id || 'broker'

              try {
                themeSounds?.start?.(agentId)
                await executeNode(agentId, step.id, step.input || {})
                themeSounds?.complete?.(agentId)

                const nodeStatus = nodeStatuses[step.id]
                if (nodeStatus?.result) {
                  results[step.id] = nodeStatus.result
                }
                nodesSucceeded++
              } catch (err) {
                themeSounds?.error?.(agentId)
                console.error(`[useCommandBridge] Node ${step.id} failed:`, err)
                nodesFailed++
              }
            })
          )
        } else {
          // Execute nodes sequentially
          for (const step of template.steps) {
            const agent = getAgentBySkill(step.skillId || '')
            const agentId = agent?.id || 'broker'

            try {
              themeSounds?.start?.(agentId)
              await executeNode(agentId, step.id, step.input || {})
              themeSounds?.complete?.(agentId)

              const nodeStatus = nodeStatuses[step.id]
              if (nodeStatus?.result) {
                results[step.id] = nodeStatus.result
              }
              nodesSucceeded++
            } catch (err) {
              themeSounds?.error?.(agentId)
              console.error(`[useCommandBridge] Node ${step.id} failed:`, err)
              nodesFailed++

              // Stop on first error in sequential mode
              throw err
            }
          }
        }

        const completedAt = new Date()
        const durationMs = completedAt.getTime() - startedAt.getTime()

        const result: FlowExecutionResult = {
          template,
          startedAt,
          completedAt,
          durationMs,
          nodesExecuted: template.steps.length,
          nodesSucceeded,
          nodesFailed,
          results,
        }

        onFlowComplete?.(result)
        return result
      } catch (err) {
        onFlowError?.(err as Error)
        throw err
      }
    },
    [executeNode, nodeStatuses, themeSounds, onFlowStart, onFlowComplete, onFlowError]
  )

  /**
   * Execute specific nodes in sequence
   */
  const runSequence = useCallback(
    async (nodeIds: string[]) => {
      for (const nodeId of nodeIds) {
        const nodeStatus = nodeStatuses[nodeId]
        if (!nodeStatus) {
          console.warn('[useCommandBridge] Node not found:', nodeId)
          continue
        }

        const agent = nodeStatus.agent_name || 'broker'
        themeSounds?.start?.(agent)

        try {
          await executeNode(agent, nodeId, {})
          themeSounds?.complete?.(agent)
        } catch (err) {
          themeSounds?.error?.(agent)
          throw err
        }
      }
    },
    [executeNode, nodeStatuses, themeSounds]
  )

  /**
   * Cancel current flow execution
   */
  const cancelFlow = useCallback(async () => {
    const runningNodes = Object.entries(nodeStatuses)
      .filter(([, status]) => status.status === 'running' || status.status === 'queued')
      .map(([nodeId]) => nodeId)

    for (const nodeId of runningNodes) {
      await cancelNode(nodeId)
    }
  }, [nodeStatuses, cancelNode])

  /**
   * Retry failed nodes
   */
  const retryFailedNodes = useCallback(async () => {
    const failedNodes = Object.entries(nodeStatuses)
      .filter(([, status]) => status.status === 'error')
      .map(([nodeId]) => nodeId)

    await runSequence(failedNodes)
  }, [nodeStatuses, runSequence])

  /**
   * Parse natural language command and determine intent
   */
  const parseCommand = useCallback(
    async (message: string): Promise<CommandIntent | null> => {
      const normalizedMessage = message.toLowerCase().trim()

      // Intent: Execute flow
      if (
        /\b(run|execute|start|begin|launch)\b/i.test(normalizedMessage) &&
        /\b(flow|campaign|project|workflow)\b/i.test(normalizedMessage)
      ) {
        const intent: CommandIntent = {
          action: 'execute_flow',
          parameters: {
            parallel: /\b(parallel|simultaneously|all at once)\b/i.test(normalizedMessage),
          },
        }

        onCommandRecognized?.('execute_flow', intent)

        // Get goal from memory or default to 'radio'
        const goal = memory?.goal || 'radio'

        try {
          await runFlow(goal, intent.parameters?.parallel)
        } catch (err) {
          console.error('[useCommandBridge] Flow execution failed:', err)
        }

        return intent
      }

      // Intent: Pause flow
      if (/\b(pause|stop|halt)\b/i.test(normalizedMessage)) {
        const intent: CommandIntent = { action: 'pause_flow' }
        onCommandRecognized?.('pause_flow', intent)
        await cancelFlow()
        return intent
      }

      // Intent: Cancel flow
      if (/\b(cancel|abort|quit)\b/i.test(normalizedMessage)) {
        const intent: CommandIntent = { action: 'cancel_flow' }
        onCommandRecognized?.('cancel_flow', intent)
        await cancelFlow()
        await clearLogs()
        return intent
      }

      // Intent: Retry
      if (/\b(retry|try again|redo)\b/i.test(normalizedMessage)) {
        const intent: CommandIntent = { action: 'retry_node' }
        onCommandRecognized?.('retry_node', intent)
        await retryFailedNodes()
        return intent
      }

      // Intent: Unknown
      return { action: 'unknown' }
    },
    [
      memory,
      runFlow,
      cancelFlow,
      clearLogs,
      retryFailedNodes,
      onCommandRecognized,
    ]
  )

  return {
    parseCommand,
    runFlow,
    runSequence,
    cancelFlow,
    retryFailedNodes,
    isExecuting,
  }
}
