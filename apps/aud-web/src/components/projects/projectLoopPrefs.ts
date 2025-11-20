'use client'

export interface ProjectLoopPrefs {
  [projectId: string]: {
    lastLoopId?: string
  }
}

const STORAGE_KEY = 'ta_project_loop_prefs_v1'

export function loadProjectLoopPrefs(): ProjectLoopPrefs {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as ProjectLoopPrefs
  } catch {
    return {}
  }
}

export function saveProjectLoopPrefs(prefs: ProjectLoopPrefs): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const serialised = JSON.stringify(prefs)
    window.localStorage.setItem(STORAGE_KEY, serialised)
  } catch {
    // Best-effort only; ignore storage failures
  }
}

export function getLastLoopIdForProject(projectId: string): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  if (!projectId) return null

  const prefs = loadProjectLoopPrefs()
  const entry = prefs[projectId]
  return entry?.lastLoopId ?? null
}

export function setLastLoopIdForProject(projectId: string, loopId: string): void {
  if (typeof window === 'undefined') {
    return
  }
  if (!projectId || !loopId) return

  const prefs = loadProjectLoopPrefs()
  const next: ProjectLoopPrefs = {
    ...prefs,
    [projectId]: {
      ...(prefs[projectId] ?? {}),
      lastLoopId: loopId,
    },
  }

  saveProjectLoopPrefs(next)
}

export function clearLoopIdForProject(projectId: string, loopId: string): void {
  if (typeof window === 'undefined') {
    return
  }
  if (!projectId || !loopId) return

  const prefs = loadProjectLoopPrefs()
  const existing = prefs[projectId]
  if (!existing || existing.lastLoopId !== loopId) {
    return
  }

  const next: ProjectLoopPrefs = { ...prefs }
  const { lastLoopId, ...rest } = existing

  if (Object.keys(rest).length === 0) {
    delete next[projectId]
  } else {
    next[projectId] = rest
  }

  saveProjectLoopPrefs(next)
}


