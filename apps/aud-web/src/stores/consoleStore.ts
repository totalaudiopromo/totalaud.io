/**
 * Console Store - State Management
 *
 * Manages view state, filters, and active campaign for Console Environment.
 */

import { create } from 'zustand'
import type { CampaignEvent } from '@/lib/supabaseClient'
import type { Node, Edge } from 'reactflow'

export type ConsolePaneView = 'mission' | 'activity' | 'insight'
export type MissionView = 'plan' | 'do' | 'track' | 'learn'
export type ActiveMode = 'plan' | 'do' | 'track' | 'learn'

// Workflow types
export interface WorkflowNode extends Node {
  data: {
    label: string
    skillName: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    agentName?: string
    message?: string
    result?: any
    startedAt?: string
    completedAt?: string
    onExecute?: () => void
  }
}

interface ConsoleState {
  // Active campaign
  activeCampaignId: string | null
  campaignName: string | null

  // View states
  activePane: ConsolePaneView
  missionView: MissionView
  activeMode: ActiveMode // Current mode - changes center pane content
  showOperatorPalette: boolean

  // Filters
  activityFilter: 'all' | 'agents' | 'workflows' | 'errors'
  timeRange: '1h' | '24h' | '7d' | '30d'

  // Realtime events
  events: CampaignEvent[]
  addEvent: (event: CampaignEvent) => void
  clearEvents: () => void

  // Workflow state (for Flow Pane)
  workflowNodes: WorkflowNode[]
  workflowEdges: Edge[]
  setWorkflowNodes: (nodes: WorkflowNode[]) => void
  setWorkflowEdges: (edges: Edge[]) => void
  updateNodeStatus: (nodeId: string, status: WorkflowNode['data']['status'], result?: any) => void

  // Actions
  setActiveCampaign: (id: string | null, name: string | null) => void
  setActivePane: (pane: ConsolePaneView) => void
  setMissionView: (view: MissionView) => void
  setActiveMode: (mode: ActiveMode) => void
  toggleOperatorPalette: () => void
  setActivityFilter: (filter: ConsoleState['activityFilter']) => void
  setTimeRange: (range: ConsoleState['timeRange']) => void
}

export const useConsoleStore = create<ConsoleState>((set) => ({
  // Initial state
  activeCampaignId: null,
  campaignName: 'Untitled Campaign',
  activePane: 'mission',
  missionView: 'plan',
  activeMode: 'plan', // Start in plan mode
  showOperatorPalette: false,
  activityFilter: 'all',
  timeRange: '24h',
  events: [],
  workflowNodes: [],
  workflowEdges: [],

  // Realtime event actions
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 200), // Keep latest 200 events
    })),

  clearEvents: () => set({ events: [] }),

  // Workflow actions
  setWorkflowNodes: (nodes) => set({ workflowNodes: nodes }),
  setWorkflowEdges: (edges) => set({ workflowEdges: edges }),
  updateNodeStatus: (nodeId, status, result) =>
    set((state) => ({
      workflowNodes: state.workflowNodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                status,
                result,
                completedAt:
                  status === 'completed' ? new Date().toISOString() : node.data.completedAt,
              },
            }
          : node
      ),
    })),

  // Actions
  setActiveCampaign: (id, name) => set({ activeCampaignId: id, campaignName: name }),

  setActivePane: (pane) => set({ activePane: pane }),

  setMissionView: (view) => set({ missionView: view, activeMode: view }), // Sync activeMode with missionView

  setActiveMode: (mode) => set({ activeMode: mode, missionView: mode }), // Sync both ways

  toggleOperatorPalette: () =>
    set((state) => ({ showOperatorPalette: !state.showOperatorPalette })),

  setActivityFilter: (filter) => set({ activityFilter: filter }),

  setTimeRange: (range) => set({ timeRange: range }),
}))
