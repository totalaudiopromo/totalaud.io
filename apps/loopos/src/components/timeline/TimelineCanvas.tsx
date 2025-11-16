'use client'

import { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  Node as FlowNode,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useWorkspace } from '@/hooks/useWorkspace'
import { nodesDb, type Node, type NodeType } from '@total-audio/loopos-db'
import { toast } from 'sonner'
import { CampaignNode } from './CampaignNode'
import { NodeCreator } from './NodeCreator'

const nodeTypes: NodeTypes = {
  campaign: CampaignNode,
}

interface TimelineCanvasProps {
  workspaceId: string
}

export function TimelineCanvas({ workspaceId }: TimelineCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(true)
  const [showCreator, setShowCreator] = useState(false)
  const [creatorPosition, setCreatorPosition] = useState({ x: 0, y: 0 })

  // Load nodes from database
  useEffect(() => {
    loadNodes()
  }, [workspaceId])

  const loadNodes = async () => {
    try {
      setLoading(true)
      const dbNodes = await nodesDb.list(workspaceId)

      // Convert DB nodes to React Flow nodes
      const flowNodes: FlowNode[] = dbNodes.map((node) => ({
        id: node.id,
        type: 'campaign',
        position: { x: node.position_x, y: node.position_y },
        data: {
          title: node.title,
          content: node.content,
          colour: node.colour,
          nodeType: node.type,
          metadata: node.metadata,
        },
      }))

      setNodes(flowNodes)
    } catch (error) {
      console.error('Failed to load nodes:', error)
      toast.error('Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  )

  const handleNodeDragStop = useCallback(
    async (event: any, node: FlowNode) => {
      try {
        await nodesDb.update(node.id, {
          position_x: node.position.x,
          position_y: node.position.y,
        })
      } catch (error) {
        console.error('Failed to update node position:', error)
      }
    },
    []
  )

  const handleCanvasDoubleClick = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.classList.contains('react-flow__pane')) {
      // Get canvas coordinates
      const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top

      setCreatorPosition({ x, y })
      setShowCreator(true)
    }
  }, [])

  const handleCreateNode = async (data: {
    type: NodeType
    title: string
    content: string
    colour: string
  }) => {
    try {
      const node = await nodesDb.create(workspaceId, 'current-user-id', {
        ...data,
        position_x: creatorPosition.x,
        position_y: creatorPosition.y,
      })

      // Add to canvas
      const newFlowNode: FlowNode = {
        id: node.id,
        type: 'campaign',
        position: { x: node.position_x, y: node.position_y },
        data: {
          title: node.title,
          content: node.content,
          colour: node.colour,
          nodeType: node.type,
          metadata: node.metadata,
        },
      }

      setNodes((nds) => [...nds, newFlowNode])
      setShowCreator(false)
      toast.success('Node created!')
    } catch (error) {
      console.error('Failed to create node:', error)
      toast.error('Failed to create node')
    }
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-centre justify-centre">
        <div className="text-centre">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground/60">Loading timeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative" onDoubleClick={handleCanvasDoubleClick}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#3AA9BE', strokeWidth: 2 },
        }}
      >
        <Controls className="bg-background border border-border rounded-lg" />
        <Background color="#2A2D30" gap={16} />
      </ReactFlow>

      {showCreator && (
        <NodeCreator
          position={creatorPosition}
          onCreate={handleCreateNode}
          onCancel={() => setShowCreator(false)}
        />
      )}

      {nodes.length === 0 && !showCreator && (
        <div className="absolute inset-0 flex items-centre justify-centre pointer-events-none">
          <div className="text-centre max-w-md">
            <h3 className="text-xl font-semibold mb-2">Double-click to create a node</h3>
            <p className="text-foreground/60">
              Start mapping your campaign by adding nodes to the timeline
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
