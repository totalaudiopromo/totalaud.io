'use client'

import { useEffect, useState } from 'react'
import { workspaceDb, type Workspace } from '@total-audio/loopos-db'
import { useAuth } from './useAuth'

export function useWorkspace() {
  const { user } = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setWorkspaces([])
      setCurrentWorkspace(null)
      setLoading(false)
      return
    }

    loadWorkspaces()
  }, [user])

  const loadWorkspaces = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await workspaceDb.list(user.id)
      setWorkspaces(data)

      // Load current workspace from localStorage or use first
      const savedWorkspaceId = localStorage.getItem('loopos:current-workspace')
      const workspace = savedWorkspaceId
        ? data.find((w) => w.id === savedWorkspaceId) || data[0]
        : data[0]

      setCurrentWorkspace(workspace || null)
    } catch (error) {
      console.error('Failed to load workspaces:', error)
    } finally {
      setLoading(false)
    }
  }

  const switchWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find((w) => w.id === workspaceId)
    if (workspace) {
      setCurrentWorkspace(workspace)
      localStorage.setItem('loopos:current-workspace', workspaceId)
    }
  }

  const createWorkspace = async (name: string, slug: string) => {
    if (!user) throw new Error('Not authenticated')

    const workspace = await workspaceDb.create(user.id, name, slug)
    setWorkspaces([...workspaces, workspace])
    switchWorkspace(workspace.id)
    return workspace
  }

  return {
    workspaces,
    currentWorkspace,
    loading,
    switchWorkspace,
    createWorkspace,
    refreshWorkspaces: loadWorkspaces,
  }
}
