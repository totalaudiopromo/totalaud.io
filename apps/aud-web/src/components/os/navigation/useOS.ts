'use client'

import { useMemo } from 'react'
import { OSConfig, OSSlug, TransitionType } from './OSMetadata'
import { OSLifecycleHooks, useOSContext } from './OSProvider'

interface UseOSResult {
  currentOS: OSConfig
  setOS: (slug: OSSlug) => void
  history: OSSlug[]
  isTransitioning: boolean
  transitionType: TransitionType
  registerHooks: (slug: OSSlug, hooks: OSLifecycleHooks) => () => void
  isQuickSwitchOpen: boolean
  openQuickSwitch: () => void
  closeQuickSwitch: () => void
  toggleQuickSwitch: () => void
  notifyTransitionComplete: () => void
}

export function useOS(): UseOSResult {
  const {
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
  } = useOSContext()

  return useMemo(
    () => ({
      currentOS,
      setOS,
      history,
      isTransitioning: transitions.isTransitioning,
      transitionType: transitions.type,
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
      transitions.isTransitioning,
      transitions.type,
    ],
  )
}



