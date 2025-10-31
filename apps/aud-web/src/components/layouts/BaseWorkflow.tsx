/**
 * BaseWorkflow Component
 *
 * Shared logic layer for all OS Studios.
 * Handles agents, realtime state, and workflow execution.
 * Each Studio wraps this with OS-specific UI/UX.
 *
 * Phase 6: OS Studio Refactor
 */

'use client'

import { useCallback, useEffect, useState, useRef, ReactNode, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useFlowStore } from '@aud-web/stores/flowStore'
import { useFlowRealtime } from '@aud-web/hooks/useFlowRealtime'
import { FlowNode } from '../features/flow/FlowNode'
import type { FlowTemplate, AgentStatus } from '@total-audio/core-agent-executor/client'
import {
  useAgentExecution,
  getStatusColor,
  getAgent,
} from '@total-audio/core-agent-executor/client'
import { playAgentSound } from '@total-audio/core-theme-engine'
import { supabase } from '@aud-web/lib/supabase'
import { generateUUID } from '@aud-web/lib/uuid'
import { useUserPrefs } from '@aud-web/hooks/useUserPrefs'
import { deserializeFlowTemplate } from '@total-audio/core-agent-executor/client'
import { useTheme } from '../themes/ThemeResolver'

const nodeTypes: NodeTypes = {
  skill: FlowNode,
  agent: FlowNode,
  decision: FlowNode,
}

export interface WorkflowState {
  nodes: Node[]
  edges: Edge[]
  isExecuting: boolean
  executionLogs: string[]
  agentStatuses: Record<string, AgentStatus>
  sessionId: string
}

export interface BaseWorkflowProps {
  /** Initial flow template to load */
  initialTemplate?: FlowTemplate | null

  /** Render function for the workflow UI */
  children: (state: WorkflowState, actions: WorkflowActions) => ReactNode

  /** Optional callback when execution completes */
  onExecutionComplete?: () => void

  /** Optional callback when flow changes */
  onFlowChange?: (nodes: Node[], edges: Edge[]) => void
}

export interface WorkflowActions {
  onNodesChange: (changes: any) => void
  onEdgesChange: (changes: any) => void
  onConnect: (connection: Connection) => void
  executeFlow: () => void
  stopExecution: () => void
  resetFlow: () => void
  addNode: (type: string, position: { x: number; y: number }) => void
  deleteNode: (nodeId: string) => void
}

/**
 * Internal component that uses useSearchParams
 * Must be wrapped in Suspense boundary
 */
function BaseWorkflowInternal({
  initialTemplate,
  children,
  onExecutionComplete,
  onFlowChange,
}: BaseWorkflowProps) {
  const { currentTheme } = useTheme()
  const searchParams = useSearchParams()
  const flowParam = searchParams.get('flow')

  // Store state
  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    isExecuting,
  } = useFlowStore()

  // Node/Edge state
  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges)
  const hasInitialized = useRef(false)

  // Execution state
  const [executionLogs, setExecutionLogs] = useState<string[]>([])
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({})
  const sessionId = useRef(generateUUID())

  // Previous statuses for sound effects
  const previousStatuses = useRef<Record<string, string>>({})

  // Initialize from template
  useEffect(() => {
    if (hasInitialized.current) return

    let template = initialTemplate

    // Try to load from URL parameter if no template provided
    if (!template && flowParam) {
      template = deserializeFlowTemplate(flowParam)
    }

    if (template) {
      // Convert template to nodes and edges
      const templateNodes: Node[] = []
      const templateEdges: Edge[] = []

      // Add template nodes
      template.nodes?.forEach((node, index) => {
        templateNodes.push({
          id: node.id || `node-${index}`,
          type: 'skill',
          position: { x: index * 250, y: 100 },
          data: {
            label: node.name,
            color: '#6366f1',
            status: 'idle',
          },
        })
      })

      // Add template edges
      template.edges?.forEach((edge, index) => {
        templateEdges.push({
          id: `edge-${index}`,
          source: edge.source,
          target: edge.target,
          animated: true,
        })
      })

      setNodes(templateNodes)
      setEdges(templateEdges)
      setStoreNodes(templateNodes)
      setStoreEdges(templateEdges)

      hasInitialized.current = true
    }
  }, [initialTemplate, flowParam, setNodes, setEdges, setStoreNodes, setStoreEdges])

  // Sync nodes/edges to store
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      setStoreNodes(nodes)
      setStoreEdges(edges)
      onFlowChange?.(nodes, edges)
    }
  }, [nodes, edges, setStoreNodes, setStoreEdges, onFlowChange])

  // Handle node connections
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = addEdge(connection, edges)
      setEdges(newEdge as Edge[])
    },
    [edges, setEdges]
  )

  // Execute flow
  const executeFlow = useCallback(() => {
    console.log('[BaseWorkflow] Executing flow with nodes:', nodes.length)
    setExecutionLogs((prev) => [...prev, `[${new Date().toISOString()}] Flow execution started`])

    // TODO: Implement actual flow execution with agent-executor
    // For now, just update node statuses
    const updatedNodes = nodes.map((node) => ({
      ...node,
      data: { ...node.data, status: 'running' },
    }))

    setNodes(updatedNodes)

    // Play execution sound
    playAgentSound(currentTheme, 'activate')
  }, [nodes, setNodes, currentTheme])

  // Stop execution
  const stopExecution = useCallback(() => {
    console.log('[BaseWorkflow] Stopping execution')
    setExecutionLogs((prev) => [...prev, `[${new Date().toISOString()}] Flow execution stopped`])

    const updatedNodes = nodes.map((node) => ({
      ...node,
      data: { ...node.data, status: 'idle' },
    }))

    setNodes(updatedNodes)
    onExecutionComplete?.()
  }, [nodes, setNodes, onExecutionComplete])

  // Reset flow
  const resetFlow = useCallback(() => {
    setNodes([])
    setEdges([])
    setExecutionLogs([])
    setAgentStatuses({})
    setStoreNodes([])
    setStoreEdges([])
  }, [setNodes, setEdges, setStoreNodes, setStoreEdges])

  // Add node
  const addNode = useCallback(
    (type: string, position: { x: number; y: number }) => {
      const newNode: Node = {
        id: generateUUID(),
        type: 'skill',
        position,
        data: {
          label: type,
          color: '#6366f1',
          status: 'idle',
        },
      }

      setNodes((nds) => [...nds, newNode])
      playAgentSound(currentTheme, 'spawn')
    },
    [setNodes, currentTheme]
  )

  // Delete node
  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId))
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
      playAgentSound(currentTheme, 'dismiss')
    },
    [setNodes, setEdges, currentTheme]
  )

  // Workflow state
  const state: WorkflowState = {
    nodes,
    edges,
    isExecuting,
    executionLogs,
    agentStatuses,
    sessionId: sessionId.current,
  }

  // Workflow actions
  const actions: WorkflowActions = {
    onNodesChange,
    onEdgesChange,
    onConnect,
    executeFlow,
    stopExecution,
    resetFlow,
    addNode,
    deleteNode,
  }

  return <>{children(state, actions)}</>
}

/**
 * BaseWorkflow - Main export with Suspense boundary
 * Wraps BaseWorkflowInternal to satisfy Next.js 15 requirements
 */
export function BaseWorkflow(props: BaseWorkflowProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">Loading workflow...</div>
      }
    >
      <BaseWorkflowInternal {...props} />
    </Suspense>
  )
}
