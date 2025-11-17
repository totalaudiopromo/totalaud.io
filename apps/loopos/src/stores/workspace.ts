import { create } from 'zustand'
import type { Workspace } from '@total-audio/loopos-db'

interface WorkspaceStore {
  currentWorkspace: Workspace | null
  setCurrentWorkspace: (workspace: Workspace | null) => void
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  currentWorkspace: null,
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
}))
