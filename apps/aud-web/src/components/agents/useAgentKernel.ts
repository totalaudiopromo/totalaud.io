'use client'

import { useContext } from 'react'
import { useAgentKernelContext } from './AgentKernelProvider'

export function useAgentKernel() {
  const ctx = useAgentKernelContext()
  if (!ctx) {
    throw new Error('useAgentKernel must be used within AgentKernelProvider')
  }
  return ctx
}
