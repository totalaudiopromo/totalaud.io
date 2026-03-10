'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ProjectHotkeys } from './ProjectHotkeys'
import { ProjectQuickSwitch } from './ProjectQuickSwitch'

export interface Project {
  id: string
  name: string
  colour: string
  createdAt: string
}

export interface ProjectEngineState {
  currentProjectId: string | null
  projects: Project[]
}

interface ProjectEngineContextValue {
  currentProject: Project | null
  projects: Project[]
  currentProjectId: string | null
  createProject: (name: string, colourOverride?: string) => Project
  setProject: (id: string) => void
  renameProject: (id: string, newName: string) => void
  deleteProject: (id: string) => void
  isProjectSwitchOpen: boolean
  openProjectSwitch: () => void
  closeProjectSwitch: () => void
}

const PROJECTS_STORAGE_KEY = 'ta_projects_v1'
const CURRENT_PROJECT_STORAGE_KEY = 'ta_current_project_v1'
const DEMO_PROJECT_ID = 'demo-lana-glass'

const ProjectEngineContext = createContext<ProjectEngineContextValue | null>(null)

function generateProjectId() {
  return `proj-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`
}

const DEFAULT_COLOURS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#eab308']

function pickDefaultColour(index: number) {
  if (!DEFAULT_COLOURS.length) return '#3b82f6'
  return DEFAULT_COLOURS[index % DEFAULT_COLOURS.length]
}

function isDemoPath(pathname: string | null) {
  if (!pathname) return false
  return pathname.startsWith('/demo/')
}

function isOnboardingPath(pathname: string | null) {
  if (!pathname) return false
  return pathname === '/onboarding' || pathname.startsWith('/onboarding/')
}

export function ProjectEngineProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const [state, setState] = useState<ProjectEngineState>({
    currentProjectId: null,
    projects: [],
  })
  const [isHydrated, setIsHydrated] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isProjectSwitchOpen, setIsProjectSwitchOpen] = useState(false)
  const hasRedirectedRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const demoFlag =
      (window as any).__TA_DEMO__ === true ||
      isDemoPath(pathname) ||
      pathname === '/demo' ||
      pathname === '/demo/'

    setIsDemoMode(demoFlag)

    if (demoFlag) {
      const demoProject: Project = {
        id: DEMO_PROJECT_ID,
        name: 'Lana Glass Demo Project',
        colour: '#3b82f6',
        createdAt: new Date().toISOString(),
      }

      setState({
        currentProjectId: demoProject.id,
        projects: [],
      })
      setIsHydrated(true)
      return
    }

    try {
      const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY)
      const storedProjects = raw ? (JSON.parse(raw) as Project[]) : []

      const rawCurrentId = window.localStorage.getItem(CURRENT_PROJECT_STORAGE_KEY)
      const currentProjectId = rawCurrentId && rawCurrentId.length > 0 ? rawCurrentId : null

      setState({
        currentProjectId,
        projects: storedProjects ?? [],
      })
    } catch {
      setState({
        currentProjectId: null,
        projects: [],
      })
    } finally {
      setIsHydrated(true)
    }
  }, [pathname])

  useEffect(() => {
    if (!pathname) return
    setIsProjectSwitchOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isHydrated) return
    if (isDemoMode) return
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(state.projects))
      window.localStorage.setItem(CURRENT_PROJECT_STORAGE_KEY, state.currentProjectId ?? '')
    } catch {
      // Best-effort persistence; ignore errors (e.g. private mode)
    }
  }, [isHydrated, isDemoMode, state.currentProjectId, state.projects])

  useEffect(() => {
    if (!isHydrated) return
    if (isDemoMode) return
    if (hasRedirectedRef.current) return

    if (isOnboardingPath(pathname)) return

    const hasProjects = state.projects.length > 0 && state.currentProjectId !== null
    if (!hasProjects) {
      hasRedirectedRef.current = true
      router.replace('/onboarding')
    }
  }, [isHydrated, isDemoMode, pathname, router, state.currentProjectId, state.projects.length])

  const openProjectSwitch = useCallback(() => {
    if (isDemoMode) return
    setIsProjectSwitchOpen(true)
  }, [isDemoMode])

  const closeProjectSwitch = useCallback(() => {
    setIsProjectSwitchOpen(false)
  }, [])

  const createProject = useCallback(
    (name: string, colourOverride?: string): Project => {
      const trimmedName = name.trim()
      const safeName = trimmedName.length > 0 ? trimmedName : 'Untitled project'

      if (isDemoMode) {
        const demoProject: Project = {
          id: DEMO_PROJECT_ID,
          name: 'Lana Glass Demo Project',
          colour: '#3b82f6',
          createdAt: new Date().toISOString(),
        }
        setState({
          currentProjectId: demoProject.id,
          projects: [],
        })
        return demoProject
      }

      const nextIndex = state.projects.length

      const project: Project = {
        id: generateProjectId(),
        name: safeName,
        colour: colourOverride ?? pickDefaultColour(nextIndex),
        createdAt: new Date().toISOString(),
      }

      setState((previous) => ({
        currentProjectId: project.id,
        projects: [...previous.projects, project],
      }))

      return project
    },
    [isDemoMode, state.projects.length]
  )

  const setProject = useCallback((id: string) => {
    setState((previous) => {
      if (previous.currentProjectId === id) return previous
      const exists = previous.projects.some((project) => project.id === id)
      if (!exists && id !== DEMO_PROJECT_ID) {
        return previous
      }
      return {
        ...previous,
        currentProjectId: id,
      }
    })
  }, [])

  const renameProject = useCallback((id: string, newName: string) => {
    const trimmedName = newName.trim()
    if (!trimmedName) return
    setState((previous) => ({
      ...previous,
      projects: previous.projects.map((project) =>
        project.id === id
          ? {
              ...project,
              name: trimmedName,
            }
          : project
      ),
    }))
  }, [])

  const deleteProject = useCallback(
    (id: string) => {
      if (isDemoMode) return
      setState((previous) => {
        const remainingProjects = previous.projects.filter((project) => project.id !== id)
        let nextCurrentId = previous.currentProjectId
        if (previous.currentProjectId === id) {
          nextCurrentId = remainingProjects[0]?.id ?? null
        }
        return {
          currentProjectId: nextCurrentId,
          projects: remainingProjects,
        }
      })
    },
    [isDemoMode]
  )

  const currentProject = useMemo(() => {
    if (isDemoMode) {
      return {
        id: DEMO_PROJECT_ID,
        name: 'Lana Glass Demo Project',
        colour: '#3b82f6',
        createdAt: new Date().toISOString(),
      }
    }

    if (!state.currentProjectId) return null
    return state.projects.find((project) => project.id === state.currentProjectId) ?? null
  }, [isDemoMode, state.currentProjectId, state.projects])

  const value: ProjectEngineContextValue = useMemo(
    () => ({
      currentProject,
      currentProjectId: state.currentProjectId,
      projects: state.projects,
      createProject,
      setProject,
      renameProject,
      deleteProject,
      isProjectSwitchOpen,
      openProjectSwitch,
      closeProjectSwitch,
    }),
    [
      closeProjectSwitch,
      createProject,
      currentProject,
      isProjectSwitchOpen,
      openProjectSwitch,
      renameProject,
      setProject,
      state.currentProjectId,
      state.projects,
    ]
  )

  return (
    <ProjectEngineContext.Provider value={value}>
      <ProjectHotkeys
        isProjectSwitchOpen={isProjectSwitchOpen}
        onOpen={openProjectSwitch}
        onClose={closeProjectSwitch}
      />
      {children}
      <ProjectQuickSwitch />
    </ProjectEngineContext.Provider>
  )
}

export function useProjectEngineContext(): ProjectEngineContextValue {
  const context = useContext(ProjectEngineContext)
  if (!context) {
    throw new Error('useProjectEngineContext must be used within a ProjectEngineProvider')
  }
  return context
}
