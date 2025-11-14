import { create } from 'zustand'
import type { Edge, Node } from 'reactflow'

type NodesUpdater = Node[] | ((nodes: Node[]) => Node[])
type EdgesUpdater = Edge[] | ((edges: Edge[]) => Edge[])

interface FlowCanvasState {
  nodes: Node[]
  edges: Edge[]
  setNodes: (updater: NodesUpdater) => void
  setEdges: (updater: EdgesUpdater) => void
  addNode: (node: Node) => void
  reset: () => void
}

export const useFlowCanvasStore = create<FlowCanvasState>((set) => ({
  nodes: [],
  edges: [],
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
  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),
  reset: () => set({ nodes: [], edges: [] }),
}))

