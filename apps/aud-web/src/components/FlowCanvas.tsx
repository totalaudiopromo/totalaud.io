"use client"

import { useCallback, useEffect, useState } from "react"
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  NodeTypes
} from "reactflow"
import "reactflow/dist/style.css"
import { motion } from "framer-motion"
import { useFlowStore } from "@/stores/flowStore"
import { useFlowRealtime } from "@/hooks/useFlowRealtime"
import { FlowNode } from "./FlowNode"

const nodeTypes: NodeTypes = {
  skill: FlowNode
}

const skillNodes = [
  { 
    name: "research-contacts", 
    label: "🔍 Research Contacts",
    color: "#3b82f6"
  },
  { 
    name: "score-contacts", 
    label: "⭐ Score Contacts",
    color: "#f59e0b"
  },
  { 
    name: "generate-pitch", 
    label: "✍️ Generate Pitch",
    color: "#8b5cf6"
  }
]

export function FlowCanvas() {
  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    isExecuting
  } = useFlowStore()

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)

  // Sync with store
  useEffect(() => {
    setStoreNodes(nodes)
  }, [nodes, setStoreNodes])

  useEffect(() => {
    setStoreEdges(edges)
  }, [edges, setStoreEdges])

  // Handle connections
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => addEdge(params, eds))
    },
    [setEdges]
  )

  // Add skill node on canvas click
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (!selectedSkill) return

      const skill = skillNodes.find((s) => s.name === selectedSkill)
      if (!skill) return

      const reactFlowBounds = event.currentTarget.getBoundingClientRect()
      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 30
      }

      const newNode: Node = {
        id: `skill-${Date.now()}`,
        type: "skill",
        position,
        data: {
          label: skill.label,
          skillName: skill.name,
          status: "pending"
        }
      }

      setNodes((nds) => [...nds, newNode])
      setSelectedSkill(null)
    },
    [selectedSkill, setNodes]
  )

  // Real-time status updates
  const updateNodeStatus = useCallback(
    (nodeId: string, status: string, output?: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const statusColors = {
              pending: "#6b7280",
              running: "#3b82f6",
              completed: "#10b981",
              failed: "#ef4444"
            }

            return {
              ...node,
              data: {
                ...node.data,
                status,
                output
              },
              style: {
                ...node.style,
                borderColor: statusColors[status as keyof typeof statusColors] || "#6b7280",
                borderWidth: "3px"
              }
            }
          }
          return node
        })
      )
    },
    [setNodes]
  )

  // Enable real-time updates
  useFlowRealtime(updateNodeStatus)

  return (
    <div className="relative h-full w-full">
      {/* Skill Palette */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4 z-10 bg-slate-800/90 backdrop-blur-xl rounded-xl border border-slate-700 p-4 shadow-2xl"
      >
        <h3 className="text-sm font-bold text-white mb-3">
          Skills Palette
        </h3>
        <div className="space-y-2">
          {skillNodes.map((skill) => (
            <button
              key={skill.name}
              onClick={() => setSelectedSkill(skill.name)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedSkill === skill.name
                  ? "bg-blue-500 text-white ring-2 ring-blue-400"
                  : "bg-slate-700 text-slate-200 hover:bg-slate-600"
              }`}
            >
              {skill.label}
            </button>
          ))}
        </div>
        {selectedSkill && (
          <p className="mt-3 text-xs text-slate-400">
            Click on canvas to add
          </p>
        )}
      </motion.div>

      {/* Execution Status */}
      {isExecuting && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 z-10 bg-blue-500/90 backdrop-blur-xl rounded-xl border border-blue-400 px-4 py-2 shadow-2xl"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium text-white">
              Executing workflow...
            </span>
          </div>
        </motion.div>
      )}

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-900"
      >
        <Controls className="bg-slate-800 border-slate-700" />
        <MiniMap
          nodeColor={(node) => {
            if (node.data.status === "completed") return "#10b981"
            if (node.data.status === "running") return "#3b82f6"
            if (node.data.status === "failed") return "#ef4444"
            return "#6b7280"
          }}
          className="bg-slate-800 border-slate-700"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1}
          color="#475569"
        />
        
        {/* Legend Panel */}
        <Panel position="bottom-right" className="bg-slate-800/90 backdrop-blur-xl rounded-lg border border-slate-700 p-3">
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-slate-300">Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-300">Running</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-slate-300">Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-slate-300">Failed</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}

