'use client'

import { useMemo } from 'react'
import { useProjectEngineContext } from './ProjectEngineProvider'

export function useProjectEngine() {
  const {
    currentProject,
    projects,
    currentProjectId,
    createProject,
    setProject,
    renameProject,
    deleteProject,
  } = useProjectEngineContext()

  return useMemo(
    () => ({
      currentProject,
      projects,
      currentProjectId,
      createProject,
      setProject,
      renameProject,
      deleteProject,
    }),
    [currentProject, currentProjectId, createProject, deleteProject, projects, renameProject, setProject],
  )
}


