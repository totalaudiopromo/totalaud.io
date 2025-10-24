/**
 * Console Store - State Management
 *
 * Manages view state, filters, and active campaign for Console Environment.
 */

import { create } from 'zustand'
import type { CampaignEvent } from '@/lib/supabaseClient'

export type ConsolePaneView = 'mission' | 'activity' | 'insight'
export type MissionView = 'plan' | 'do' | 'track' | 'learn'
export type ActiveMode = 'plan' | 'do' | 'track' | 'learn'

interface ConsoleState {
  // Active campaign
  activeCampaignId: string | null
  campaignName: string | null

  // View states
  activePane: ConsolePaneView
  missionView: MissionView
  activeMode: ActiveMode  // Current mode - changes center pane content
  showOperatorPalette: boolean

  // Filters
  activityFilter: 'all' | 'agents' | 'workflows' | 'errors'
  timeRange: '1h' | '24h' | '7d' | '30d'

  // Realtime events
  events: CampaignEvent[]
  addEvent: (event: CampaignEvent) => void
  clearEvents: () => void

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
  activeMode: 'plan',  // Start in plan mode
  showOperatorPalette: false,
  activityFilter: 'all',
  timeRange: '24h',
  events: [],

  // Realtime event actions
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 200), // Keep latest 200 events
    })),

  clearEvents: () => set({ events: [] }),

  // Actions
  setActiveCampaign: (id, name) =>
    set({ activeCampaignId: id, campaignName: name }),

  setActivePane: (pane) => set({ activePane: pane }),

  setMissionView: (view) => set({ missionView: view, activeMode: view }),  // Sync activeMode with missionView

  setActiveMode: (mode) => set({ activeMode: mode, missionView: mode }),  // Sync both ways

  toggleOperatorPalette: () =>
    set((state) => ({ showOperatorPalette: !state.showOperatorPalette })),

  setActivityFilter: (filter) => set({ activityFilter: filter }),

  setTimeRange: (range) => set({ timeRange: range }),
}))
