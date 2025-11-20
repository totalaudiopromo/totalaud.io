'use client'

import { useMemo } from 'react'
import { useProjectEngineContext } from './ProjectEngineProvider'

export function useProjectSwitcher() {
  const { isProjectSwitchOpen, openProjectSwitch, closeProjectSwitch } = useProjectEngineContext()

  return useMemo(
    () => ({
      isProjectSwitchOpen,
      openProjectSwitch,
      closeProjectSwitch,
    }),
    [closeProjectSwitch, isProjectSwitchOpen, openProjectSwitch],
  )
}


