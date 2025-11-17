'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useThemeAudio } from '@/hooks/useThemeAudio'
import { useOptionalCompanion } from '@/components/companion/useCompanion'
import { useOptionalPersona } from '@/components/persona/usePersona'
import type {
  AgentKernelActions,
  AgentKernelContextValue,
  AgentKernelState,
  AgentRun,
  SpawnAgentRunParams,
} from './AgentTypes'

const AgentKernelContext = createContext<AgentKernelContextValue | undefined>(undefined)

function createRunId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `agent-run-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(16)}`
}

export function AgentKernelProvider({ children }: { children: React.ReactNode }) {
  const { play } = useThemeAudio()
  const persona = useOptionalPersona()
  const companion = useOptionalCompanion()
  const [state, setState] = useState<AgentKernelState>({
    runs: [],
    activeRunId: null,
  })

  const updateRun = useCallback((id: string, patch: Partial<AgentRun>) => {
    setState((previous) => ({
      ...previous,
      runs: previous.runs.map((run) => (run.id === id ? { ...run, ...patch } : run)),
    }))
  }, [])

  const spawnAgentRun = useCallback(
    async ({ role, originOS, target, input, meta }: SpawnAgentRunParams) => {
      const id = createRunId()
      const createdAt = new Date().toISOString()

      const personaMeta =
        persona?.activePersonaId != null
          ? {
              personaId: persona.activePersonaId,
            }
          : {}

      const companionMeta =
        companion?.activeCompanionId != null
          ? {
              companionId: companion.activeCompanionId,
            }
          : {}

      const mergedMeta = {
        ...(meta ?? {}),
        ...personaMeta,
        ...companionMeta,
      }

      const personaPrefix =
        persona?.persona && persona.personaTone
          ? [
              `Persona active: ${persona.persona.name}`,
              `Tone: ${persona.persona.tone}`,
              persona.personaTraits.length
                ? `Traits: ${persona.personaTraits.join(', ')}`
                : undefined,
              (() => {
                const bias = persona.personaBias?.[role]
                if (!bias) return undefined
                const direction = bias > 0 ? 'lean into' : 'dial back'
                return `Bias: ${direction} this role’s typical behaviour by ${(Math.abs(bias) * 100).toFixed(0)}%.`
              })(),
            ]
              .filter(Boolean)
              .join('\n')
          : null

      const inputWithCompanion =
        companion && typeof companion.injectIntoPrompt === 'function'
          ? companion.injectIntoPrompt(input)
          : input

      const effectiveInput =
        personaPrefix != null
          ? `${personaPrefix}\n\n${inputWithCompanion}`
          : inputWithCompanion

      const baseRun: AgentRun = {
        id,
        role,
        originOS,
        status: 'queued',
        target,
        input: effectiveInput,
        createdAt,
        meta: mergedMeta,
      }

      setState((previous) => ({
        ...previous,
        runs: [...previous.runs, baseRun],
        activeRunId: id,
      }))

      play('click')

      updateRun(id, {
        status: 'running',
        startedAt: new Date().toISOString(),
      })

      try {
        const response = await fetch('/api/agents/run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role,
            input: effectiveInput,
            loopContext: target,
            originOS,
          }),
        })

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null
          const errorMessage = data?.error || `Agent request failed with status ${response.status}`
          const patch: Partial<AgentRun> = {
            status: 'error',
            errorMessage,
            finishedAt: new Date().toISOString(),
          }
          updateRun(id, patch)
          return { id, output: null }
        }

        const data = (await response.json()) as { output?: string }

        const patch: Partial<AgentRun> = {
          status: 'done',
          output: data.output ?? '',
          finishedAt: new Date().toISOString(),
        }
        updateRun(id, patch)
        play('success')
        return { id, output: data.output ?? '' }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        const patch: Partial<AgentRun> = {
          status: 'error',
          errorMessage: message,
          finishedAt: new Date().toISOString(),
        }
        updateRun(id, patch)
        return { id, output: null }
      }
    },
    [companion, persona, play, updateRun],
  )

  const setActiveRun = useCallback((id: string | null) => {
    setState((previous) => ({
      ...previous,
      activeRunId: id,
    }))
  }, [])

  const clearCompletedRuns = useCallback(() => {
    setState((previous) => ({
      ...previous,
      runs: previous.runs.filter((run) => run.status === 'running' || run.status === 'queued'),
      activeRunId:
        previous.activeRunId &&
        previous.runs.some(
          (run) =>
            run.id === previous.activeRunId &&
            (run.status === 'running' || run.status === 'queued'),
        )
          ? previous.activeRunId
          : null,
    }))
  }, [])

  const value: AgentKernelContextValue = useMemo(
    () => ({
      runs: state.runs,
      activeRunId: state.activeRunId,
      spawnAgentRun,
      setActiveRun,
      updateRun,
      clearCompletedRuns,
    }),
    [state.runs, state.activeRunId, spawnAgentRun, setActiveRun, updateRun, clearCompletedRuns],
  )

  return <AgentKernelContext.Provider value={value}>{children}</AgentKernelContext.Provider>
}

export function useAgentKernelContext(): AgentKernelContextValue {
  const ctx = useContext(AgentKernelContext)
  if (!ctx) {
    throw new Error('useAgentKernelContext must be used within an AgentKernelProvider')
  }
  return ctx
}


