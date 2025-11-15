'use client'

import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node as FlowNode,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useLoopStore } from '@/state/loopStore'
import type { Node } from '@total-audio/loopos-db'

// Node type colors
const NODE_COLORS: Record<string, { bg: string; border: string }> = {
  create: { bg: '#10B981', border: '#059669' },
  promote: { bg: '#F59E0B', border: '#D97706' },
  analyse: { bg: '#8B5CF6', border: '#7C3AED' },
  refine: { bg: '#3AA9BE', border: '#2C8A9A' },
}

export function LoopCanvas() {
  const { nodes: loopNodes } = useLoopStore()

  // Convert LoopOS nodes to React Flow nodes
  const initialNodes: FlowNode[] = useMemo(() => {
    return loopNodes.map((node: Node) => ({
      id: node.id,
      type: 'default',
      position: { x: node.position_x, y: node.position_y },
      data: {
        label: (
          <div className="p-2">
            <div className="mb-1 text-xs font-semibold uppercase opacity-70">
              {node.type}
            </div>
            <div className="font-medium">{node.title}</div>
            <div className="mt-1 flex gap-2 text-xs">
              <span>P: {node.priority}</span>
              <span>F: {node.friction}</span>
            </div>
          </div>
        ),
      },
      style: {
        background: NODE_COLORS[node.type]?.bg || '#6B7280',
        borderColor: NODE_COLORS[node.type]?.border || '#4B5563',
        borderWidth: 2,
        borderRadius: 8,
        color: '#FFFFFF',
        fontSize: 12,
        padding: 0,
        minWidth: 180,
      },
    }))
  }, [loopNodes])

  // No edges for now - nodes are independent
  const initialEdges: Edge[] = []

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // Update React Flow nodes when loopNodes change
  useMemo(() => {
    const flowNodes = loopNodes.map((node: Node) => ({
      id: node.id,
      type: 'default',
      position: { x: node.position_x, y: node.position_y },
      data: {
        label: (
          <div className="p-2">
            <div className="mb-1 text-xs font-semibold uppercase opacity-70">
              {node.type}
            </div>
            <div className="font-medium">{node.title}</div>
            <div className="mt-1 flex gap-2 text-xs">
              <span>P: {node.priority}</span>
              <span>F: {node.friction}</span>
            </div>
          </div>
        ),
      },
      style: {
        background: NODE_COLORS[node.type]?.bg || '#6B7280',
        borderColor: NODE_COLORS[node.type]?.border || '#4B5563',
        borderWidth: 2,
        borderRadius: 8,
        color: '#FFFFFF',
        fontSize: 12,
        padding: 0,
        minWidth: 180,
      },
    }))

    setNodes(flowNodes)
  }, [loopNodes, setNodes])

  return (
    <div className="h-full w-full rounded-lg border border-foreground/10 bg-background/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node: any) => {
            const loopNode = loopNodes.find((n: Node) => n.id === node.id)
            return loopNode
              ? NODE_COLORS[loopNode.type]?.bg || '#6B7280'
              : '#6B7280'
          }}
          maskColor="rgba(15, 17, 19, 0.8)"
        />
      </ReactFlow>
    </div>
  )
}
