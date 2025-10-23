import { create } from 'zustand'
import type { Node, Edge } from 'reactflow'

interface FlowState {
  nodes: Node[]
  edges: Edge[]
  sessionId: string | null
  isExecuting: boolean
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  setSessionId: (id: string | null) => void
  setIsExecuting: (executing: boolean) => void
  updateNode: (nodeId: string, updates: Partial<Node>) => void
  addNode: (node: Node) => void
  removeNode: (nodeId: string) => void
  reset: () => void
}

const initialNodes: Node[] = [
  {
    id: 'start',
    position: { x: 250, y: 100 },
    data: {
      label: 'start',
      description: 'workflow entry point',
    },
    type: 'input',
    style: {
      background: '#10b981',
      color: 'white',
      border: '2px solid #059669',
      borderRadius: '12px',
      padding: '10px',
    },
  },
]

export const useFlowStore = create<FlowState>((set) => ({
  nodes: initialNodes,
  edges: [],
  sessionId: null,
  isExecuting: false,

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  setSessionId: (id) => set({ sessionId: id }),

  setIsExecuting: (executing) => set({ isExecuting: executing }),

  updateNode: (nodeId, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) => (node.id === nodeId ? { ...node, ...updates } : node)),
    })),

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),

  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    })),

  reset: () =>
    set({
      nodes: initialNodes,
      edges: [],
      sessionId: null,
      isExecuting: false,
    }),
}))
