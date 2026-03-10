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
import { useThemeAudio } from '@/hooks/useThemeAudio'
import {
  DEFAULT_OS_CONFIG,
  DEFAULT_OS_SLUG,
  getOSConfig,
  OSConfig,
  OSSlug,
  TransitionType,
} from './OSMetadata'
import { OSHotkeys } from './OSHotkeys'
import { OSQuickSwitch } from './OSQuickSwitch'

type LifecycleHook = () => void

export interface OSLifecycleHooks {
  onEnter?: LifecycleHook
  onExit?: LifecycleHook
  onFocus?: LifecycleHook
}

interface TransitionsState {
  isTransitioning: boolean
  type: TransitionType
}

interface OSContextValue {
  currentOS: OSConfig
  setOS: (slug: OSSlug) => void
  history: OSSlug[]
  transitions: TransitionsState
  registerHooks: (slug: OSSlug, hooks: OSLifecycleHooks) => () => void
  isQuickSwitchOpen: boolean
  openQuickSwitch: () => void
  closeQuickSwitch: () => void
  toggleQuickSwitch: () => void
  notifyTransitionComplete: () => void
}

const OSContext = createContext<OSContextValue | undefined>(undefined)

function resolveTransitionType(config: OSConfig): TransitionType {
  if (config.startupAnimation === 'zoom') return 'zoom'
  if (config.startupAnimation === 'fade') return 'fade'
  if (config.startupAnimation === 'tilt') return 'slide'
  return 'fade'
}

function parseOSSlugFromPath(pathname: string | null): OSSlug | null {
  if (!pathname) return null
  if (!pathname.startsWith('/os')) return null

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length < 2) return DEFAULT_OS_SLUG

  const slug = segments[1] as OSSlug
  if (
    slug === 'core' ||
    slug === 'studio' ||
    slug === 'ascii' ||
    slug === 'xp' ||
    slug === 'aqua' ||
    slug === 'daw' ||
    slug === 'analogue'
  ) {
    return slug
  }

  return null
}

export function OSProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { play } = useThemeAudio()

  const [currentOS, setCurrentOS] = useState<OSConfig>(DEFAULT_OS_CONFIG)
  const [history, setHistory] = useState<OSSlug[]>([DEFAULT_OS_SLUG])
  const [transitions, setTransitions] = useState<TransitionsState>({
    isTransitioning: false,
    type: null,
  })
  const [isQuickSwitchOpen, setIsQuickSwitchOpen] = useState(false)

  const hooksRef = useRef<Partial<Record<OSSlug, OSLifecycleHooks>>>({})
  const isTransitioningRef = useRef(false)

  const registerHooks = useCallback(
    (slug: OSSlug, hooks: OSLifecycleHooks) => {
      hooksRef.current[slug] = hooks

      if (slug === currentOS.slug) {
        hooks.onFocus?.()
      }

      return () => {
        if (hooksRef.current[slug] === hooks) {
          delete hooksRef.current[slug]
        }
      }
    },
    [currentOS.slug]
  )

  const openQuickSwitch = useCallback(() => {
    setIsQuickSwitchOpen(true)
    play('click')
  }, [play])

  const closeQuickSwitch = useCallback(() => {
    setIsQuickSwitchOpen(false)
  }, [])

  const toggleQuickSwitch = useCallback(() => {
    setIsQuickSwitchOpen((open) => {
      if (!open) {
        play('click')
      }
      return !open
    })
  }, [play])

  const beginTransition = useCallback(
    (nextOS: OSConfig) => {
      if (isTransitioningRef.current) return

      isTransitioningRef.current = true

      const hooks = hooksRef.current[currentOS.slug]
      hooks?.onExit?.()

      if (currentOS.exitSound) {
        play(currentOS.exitSound)
      }

      setTransitions({
        isTransitioning: true,
        type: resolveTransitionType(nextOS),
      })

      setHistory((prev) => [...prev, nextOS.slug])
      setCurrentOS(nextOS)
    },
    [currentOS, play]
  )

  useEffect(() => {
    const slugFromPath = parseOSSlugFromPath(pathname)
    if (!slugFromPath) return

    if (slugFromPath !== currentOS.slug) {
      const nextConfig = getOSConfig(slugFromPath)
      beginTransition(nextConfig)
    }
  }, [pathname, currentOS.slug, beginTransition])

  const notifyTransitionComplete = useCallback(() => {
    if (!isTransitioningRef.current) return

    isTransitioningRef.current = false
    setTransitions((prev) => ({
      ...prev,
      isTransitioning: false,
    }))

    const hooks = hooksRef.current[currentOS.slug]
    hooks?.onEnter?.()
    hooks?.onFocus?.()

    if (currentOS.enterSound) {
      play(currentOS.enterSound)
    }
  }, [currentOS, play])

  const setOS = useCallback(
    (slug: OSSlug) => {
      if (slug === currentOS.slug) {
        closeQuickSwitch()
        return
      }

      closeQuickSwitch()

      router.push(`/os/${slug}`)
    },
    [closeQuickSwitch, currentOS.slug, router]
  )

  const value: OSContextValue = useMemo(
    () => ({
      currentOS,
      setOS,
      history,
      transitions,
      registerHooks,
      isQuickSwitchOpen,
      openQuickSwitch,
      closeQuickSwitch,
      toggleQuickSwitch,
      notifyTransitionComplete,
    }),
    [
      closeQuickSwitch,
      currentOS,
      history,
      isQuickSwitchOpen,
      notifyTransitionComplete,
      openQuickSwitch,
      registerHooks,
      setOS,
      toggleQuickSwitch,
      transitions,
    ]
  )

  return (
    <OSContext.Provider value={value}>
      <OSHotkeys
        isQuickSwitchOpen={isQuickSwitchOpen}
        onToggleQuickSwitch={toggleQuickSwitch}
        onCloseQuickSwitch={closeQuickSwitch}
      />
      {children}
      <OSQuickSwitch />
    </OSContext.Provider>
  )
}

export function useOSContext(): OSContextValue {
  const ctx = useContext(OSContext)
  if (!ctx) {
    throw new Error('useOSContext must be used within an OSProvider')
  }
  return ctx
}
