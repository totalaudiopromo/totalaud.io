/**
 * FlowCanvas Store
 * Phase 18: Added node duplication support
 */

import { create } from 'zustand'
import type { Edge, Node } from 'reactflow'

type NodesUpdater = Node[] | ((nodes: Node[]) => Node[])
type EdgesUpdater = Edge[] | ((edges: Edge[]) => Edge[])

interface FlowCanvasState {
  nodes: Node[]
  edges: Edge[]
  selectedNodeIds: string[]
  setNodes: (updater: NodesUpdater) => void
  setEdges: (updater: EdgesUpdater) => void
  setSelectedNodeIds: (ids: string[]) => void
  addNode: (node: Node) => void
  duplicateNode: (nodeId: string) => Node | null
  reset: () => void
}

export const useFlowCanvasStore = create<FlowCanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeIds: [],
  setNodes: (updater) =>
    set((state) => ({
      nodes:
        typeof updater === 'function'
          ? (updater as (nodes: Node[]) => Node[])(state.nodes)
          : updater,
    })),
  setEdges: (updater) =>
    set((state) => ({
      edges:
        typeof updater === 'function'
          ? (updater as (edges: Edge[]) => Edge[])(state.edges)
          : updater,
    })),
  setSelectedNodeIds: (ids) => set({ selectedNodeIds: ids }),
  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),
  duplicateNode: (nodeId) => {
    const state = get()
    const sourceNode = state.nodes.find((n) => n.id === nodeId)
    if (!sourceNode) return null

    const newNode: Node = {
      ...sourceNode,
      id: `${sourceNode.id}-copy-${Date.now()}`,
      position: {
        x: sourceNode.position.x + 32,
        y: sourceNode.position.y + 32,
      },
      selected: false,
    }

    set((state) => ({
      nodes: [...state.nodes, newNode],
    }))

    return newNode
  },
  reset: () => set({ nodes: [], edges: [], selectedNodeIds: [] }),
}))
