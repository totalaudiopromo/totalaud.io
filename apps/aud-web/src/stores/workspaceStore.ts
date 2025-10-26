/**
 * Workspace Store
 *
 * Unified state management for SharedWorkspace
 * Replaces per-Studio state with single source of truth
 *
 * Shared Workspace Redesign - Stage 1
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ========================================
// Types
// ========================================

export type StudioLens = 'operator' | 'guide' | 'map' | 'timeline' | 'tape'
export type WorkspaceTab = 'plan' | 'do' | 'track' | 'learn'
export type WorkflowType = 'find_curators' | 'generate_pitch' | 'send_outreach'
export type CampaignGoal = 'radio' | 'press' | 'playlist' | 'blog'
export type TargetType = 'radio' | 'playlist' | 'blog' | 'press'
export type TargetStatus = 'found' | 'pitched' | 'opened' | 'replied' | 'added'
export type RunStatus = 'pending' | 'running' | 'complete' | 'failed'
export type CampaignStatus = 'draft' | 'active' | 'complete'
export type InsightType = 'recommendation' | 'pattern' | 'opportunity'

export interface Release {
  id: string
  user_id?: string
  artist: string
  title: string
  release_date: string
  genre: string[]
  links: {
    spotify?: string
    bandcamp?: string
    soundcloud?: string
  }
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  user_id?: string
  release_id: string
  name: string
  goal: CampaignGoal
  status: CampaignStatus
  targets_count: number
  created_at: string
  updated_at: string
}

export interface Target {
  id: string
  campaign_id: string
  name: string
  type: TargetType
  status: TargetStatus
  contact_email?: string
  contact_url?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Run {
  id: string
  campaign_id: string
  workflow_type: WorkflowType
  status: RunStatus
  started_at: string
  completed_at?: string
  error_message?: string
  results: Record<string, any>
  metadata?: Record<string, any>
}

export interface CampaignMetrics {
  campaign_id: string
  curators_found: number
  pitches_sent: number
  emails_opened: number
  replies_received: number
  playlist_adds: number
  updated_at: string
}

export interface Insight {
  id: string
  user_id?: string
  type: InsightType
  title: string
  description: string
  relevance_score: number
  metadata?: Record<string, any>
  created_at: string
}

export interface UIPreferences {
  soundEnabled: boolean
  ambientVolume: number // 0-1
  uiSoundVolume: number // 0-1
}

// ========================================
// Store Interface
// ========================================

interface WorkspaceState {
  // Data
  releases: Release[]
  campaigns: Campaign[]
  targets: Target[]
  runs: Run[]
  insights: Insight[]
  metrics: Record<string, CampaignMetrics> // Keyed by campaign_id

  // UI State
  activeTab: WorkspaceTab
  activeCampaignId: string | null
  activeReleaseId: string | null
  currentLens: StudioLens
  isLoading: boolean
  error: string | null
  uiPreferences: UIPreferences

  // Release Actions
  addRelease: (release: Omit<Release, 'id' | 'created_at' | 'updated_at'>) => string
  updateRelease: (id: string, updates: Partial<Release>) => void
  deleteRelease: (id: string) => void
  setReleases: (releases: Release[]) => void

  // Campaign Actions
  addCampaign: (campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) => string
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void
  setCampaigns: (campaigns: Campaign[]) => void
  setActiveCampaign: (campaignId: string | null) => void

  // Target Actions
  addTarget: (target: Omit<Target, 'id' | 'created_at' | 'updated_at'>) => string
  updateTarget: (id: string, updates: Partial<Target>) => void
  deleteTarget: (id: string) => void
  setTargets: (targets: Target[]) => void
  getTargetsForCampaign: (campaignId: string) => Target[]

  // Run Actions
  addRun: (run: Omit<Run, 'id' | 'started_at'>) => string
  updateRun: (id: string, updates: Partial<Run>) => void
  setRuns: (runs: Run[]) => void
  getRunsForCampaign: (campaignId: string) => Run[]
  runAction: (type: WorkflowType, params: { campaign_id: string; [key: string]: any }) => Promise<void>

  // Metrics Actions
  setMetrics: (campaignId: string, metrics: CampaignMetrics) => void
  getMetrics: (campaignId: string) => CampaignMetrics | null

  // Insight Actions
  addInsight: (insight: Omit<Insight, 'id' | 'created_at'>) => string
  setInsights: (insights: Insight[]) => void

  // UI Actions
  switchTab: (tab: WorkspaceTab) => void
  switchLens: (lens: StudioLens) => void
  setActiveRelease: (releaseId: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // Utility
  reset: () => void
  getActiveCampaign: () => Campaign | null
  getActiveRelease: () => Release | null
}

// ========================================
// Initial State
// ========================================

const initialState = {
  releases: [],
  campaigns: [],
  targets: [],
  runs: [],
  insights: [],
  metrics: {},
  activeTab: 'plan' as WorkspaceTab,
  activeCampaignId: null,
  activeReleaseId: null,
  currentLens: 'guide' as StudioLens, // Default to XP (most user-friendly)
  isLoading: false,
  error: null,
  uiPreferences: {
    soundEnabled: true, // Default to enabled
    ambientVolume: 0.3,
    uiSoundVolume: 0.5,
  } as UIPreferences,
}

// ========================================
// Store Implementation
// ========================================

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Release Actions
      addRelease: (release) => {
        const id = `release_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newRelease: Release = {
          ...release,
          id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        set((state) => ({
          releases: [...state.releases, newRelease],
          activeReleaseId: id,
        }))
        return id
      },

      updateRelease: (id, updates) =>
        set((state) => ({
          releases: state.releases.map((r) =>
            r.id === id
              ? { ...r, ...updates, updated_at: new Date().toISOString() }
              : r
          ),
        })),

      deleteRelease: (id) =>
        set((state) => ({
          releases: state.releases.filter((r) => r.id !== id),
          campaigns: state.campaigns.filter((c) => c.release_id !== id),
          activeReleaseId: state.activeReleaseId === id ? null : state.activeReleaseId,
        })),

      setReleases: (releases) => set({ releases }),

      // Campaign Actions
      addCampaign: (campaign) => {
        const id = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newCampaign: Campaign = {
          ...campaign,
          id,
          targets_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        set((state) => ({
          campaigns: [...state.campaigns, newCampaign],
          activeCampaignId: id,
        }))
        return id
      },

      updateCampaign: (id, updates) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id
              ? { ...c, ...updates, updated_at: new Date().toISOString() }
              : c
          ),
        })),

      deleteCampaign: (id) =>
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
          targets: state.targets.filter((t) => t.campaign_id !== id),
          runs: state.runs.filter((r) => r.campaign_id !== id),
          activeCampaignId: state.activeCampaignId === id ? null : state.activeCampaignId,
        })),

      setCampaigns: (campaigns) => set({ campaigns }),

      setActiveCampaign: (campaignId) => set({ activeCampaignId: campaignId }),

      // Target Actions
      addTarget: (target) => {
        const id = `target_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newTarget: Target = {
          ...target,
          id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        set((state) => ({
          targets: [...state.targets, newTarget],
          campaigns: state.campaigns.map((c) =>
            c.id === target.campaign_id
              ? { ...c, targets_count: c.targets_count + 1 }
              : c
          ),
        }))
        return id
      },

      updateTarget: (id, updates) =>
        set((state) => ({
          targets: state.targets.map((t) =>
            t.id === id
              ? { ...t, ...updates, updated_at: new Date().toISOString() }
              : t
          ),
        })),

      deleteTarget: (id) => {
        const target = get().targets.find((t) => t.id === id)
        if (!target) return

        set((state) => ({
          targets: state.targets.filter((t) => t.id !== id),
          campaigns: state.campaigns.map((c) =>
            c.id === target.campaign_id
              ? { ...c, targets_count: Math.max(0, c.targets_count - 1) }
              : c
          ),
        }))
      },

      setTargets: (targets) => set({ targets }),

      getTargetsForCampaign: (campaignId) =>
        get().targets.filter((t) => t.campaign_id === campaignId),

      // Run Actions
      addRun: (run) => {
        const id = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newRun: Run = {
          ...run,
          id,
          started_at: new Date().toISOString(),
        }
        set((state) => ({
          runs: [...state.runs, newRun],
        }))
        return id
      },

      updateRun: (id, updates) =>
        set((state) => ({
          runs: state.runs.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      setRuns: (runs) => set({ runs }),

      getRunsForCampaign: (campaignId) =>
        get().runs.filter((r) => r.campaign_id === campaignId),

      runAction: async (type, params) => {
        set({ isLoading: true, error: null })

        try {
          // Create run record
          const runId = get().addRun({
            campaign_id: params.campaign_id,
            workflow_type: type,
            status: 'pending',
            results: {},
          })

          // Update run to running
          get().updateRun(runId, { status: 'running' })

          // TODO: Implement actual workflow execution via API
          // For now, simulate async work
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Simulate success
          get().updateRun(runId, {
            status: 'complete',
            completed_at: new Date().toISOString(),
            results: { message: `${type} completed successfully` },
          })

          set({ isLoading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          set({ isLoading: false, error: errorMessage })
        }
      },

      // Metrics Actions
      setMetrics: (campaignId, metrics) =>
        set((state) => ({
          metrics: { ...state.metrics, [campaignId]: metrics },
        })),

      getMetrics: (campaignId) => get().metrics[campaignId] || null,

      // Insight Actions
      addInsight: (insight) => {
        const id = `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newInsight: Insight = {
          ...insight,
          id,
          created_at: new Date().toISOString(),
        }
        set((state) => ({
          insights: [...state.insights, newInsight],
        }))
        return id
      },

      setInsights: (insights) => set({ insights }),

      // UI Actions
      switchTab: (tab) => set({ activeTab: tab }),

      switchLens: (lens) => set({ currentLens: lens }),

      setActiveRelease: (releaseId) => set({ activeReleaseId: releaseId }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      // Utility
      reset: () => set(initialState),

      getActiveCampaign: () => {
        const { activeCampaignId, campaigns } = get()
        if (!activeCampaignId) return null
        return campaigns.find((c) => c.id === activeCampaignId) || null
      },

      getActiveRelease: () => {
        const { activeReleaseId, releases } = get()
        if (!activeReleaseId) return null
        return releases.find((r) => r.id === activeReleaseId) || null
      },
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({
        // Persist only UI preferences and IDs
        currentLens: state.currentLens,
        activeTab: state.activeTab,
        activeCampaignId: state.activeCampaignId,
        activeReleaseId: state.activeReleaseId,
        uiPreferences: state.uiPreferences,
      }),
    }
  )
)
