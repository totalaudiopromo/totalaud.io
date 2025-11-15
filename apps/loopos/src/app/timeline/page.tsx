'use client'

import { PageHeader } from '@/components/PageHeader'
import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
} from 'reactflow'
import 'reactflow/dist/style.css'

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    data: { label: 'Research Target Stations' },
    position: { x: 100, y: 100 },
  },
  {
    id: '2',
    type: 'default',
    data: { label: 'Find Station Contacts' },
    position: { x: 100, y: 200 },
  },
  {
    id: '3',
    type: 'default',
    data: { label: 'Send Initial Pitch' },
    position: { x: 100, y: 300 },
  },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
]

export default function TimelinePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [showMiniMap, setShowMiniMap] = useState(true)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const addNode = () => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type: 'default',
      data: { label: 'New Node' },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    }
    setNodes((nds) => [...nds, newNode])
  }

  return (
    <div className="min-h-screen bg-matte-black">
      <PageHeader
        title="Timeline"
        description="Cinematic canvas for campaign sequencing"
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setShowMiniMap(!showMiniMap)}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colours"
            >
              {showMiniMap ? 'Hide' : 'Show'} Minimap
            </button>
            <button
              onClick={addNode}
              className="flex items-center gap-2 px-4 py-2 bg-slate-cyan hover:bg-slate-cyan/90 text-white rounded-lg text-sm font-medium transition-colours"
            >
              <Plus className="w-4 h-4" />
              Add Node
            </button>
          </div>
        }
      />

      <div className="h-[calc(100vh-73px)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          className="bg-matte-black"
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#1a1d1f" />
          <Controls className="bg-gray-900 border-gray-800" />
          {showMiniMap && (
            <MiniMap
              className="bg-gray-900 border border-gray-800"
              nodeColor="#3AA9BE"
              maskColor="rgba(15, 17, 19, 0.8)"
            />
          )}
        </ReactFlow>
      </div>
    </div>
  )
}
