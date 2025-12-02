'use client'

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { AgentOriginOS, AgentRole, AgentStatus } from '../AgentTypes'
import { useAgentKernel } from '../useAgentKernel'
import { useOS } from '@/components/os/navigation'
import { queueOSBridge } from '@/components/os/navigation/OSBridges'
import type { OSBridgePayload } from '@/components/os/navigation/OSBridges'
import { getAgentTeamPreset, type AgentTeamId, type AgentTeamPreset } from './agentTeamPresets'

export interface AgentTeamRunStep {
  runId: string
  role: AgentRole
  status: AgentStatus
  index: number
}

export interface AgentTeamRun {
  teamRunId: string
  teamId: AgentTeamId
  originOS: AgentOriginOS
  createdAt: string
  label: string
  steps: AgentTeamRunStep[]
  status: 'running' | 'done' | 'error'
}

interface RunTeamOptions {
  teamId: AgentTeamId
  originOS: AgentOriginOS
  target?: {
    loopId?: string
    clipId?: string
    osSlug?: AgentOriginOS
  }
  instruction: string
  loopMomentum?: number
}

interface AgentTeamsContextValue {
  teamRuns: AgentTeamRun[]
  runTeam: (options: RunTeamOptions) => Promise<void>
}

const AgentTeamsContext = createContext<AgentTeamsContextValue | null>(null)

type DawToLoopOSPayload = Extract<OSBridgePayload, { kind: 'daw-to-loopos' }>

function createTeamRunId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `team-run-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(16)}`
}

function shouldRunForContext(
  preset: AgentTeamPreset,
  contextOS: AgentOriginOS | null,
  loopMomentum: number | undefined
): boolean {
  if (!preset.when) return true
  const { os, loopMomentumMin } = preset.when

  if (os && contextOS && !os.includes(contextOS)) {
    return false
  }

  if (typeof loopMomentumMin === 'number') {
    const value = loopMomentum ?? 0
    if (value < loopMomentumMin) return false
  }

  return true
}

function buildTeamInstruction(
  baseInstruction: string,
  teamId: AgentTeamId,
  role: AgentRole,
  previousOutputs: string[]
): string {
  const historyBlock =
    previousOutputs.length > 0
      ? `\n\nPrevious team outputs:\n${previousOutputs
          .map((item, index) => `Step ${index + 1}: ${item}`)
          .join('\n\n')}`
      : ''

  return [
    `Multi-agent team: ${teamId}`,
    `You are acting as the ${role.toUpperCase()} step in this sequence.`,
    '',
    baseInstruction,
    historyBlock,
  ]
    .filter(Boolean)
    .join('\n')
}

export function AgentTeamOrchestratorProvider({ children }: { children: React.ReactNode }) {
  const { currentOS } = useOS()
  const { spawnAgentRun } = useAgentKernel()
  const [teamRuns, setTeamRuns] = useState<AgentTeamRun[]>([])

  const runTeam = useCallback(
    async ({ teamId, originOS, target, instruction, loopMomentum }: RunTeamOptions) => {
      const preset = getAgentTeamPreset(teamId)
      if (!preset) return

      const contextOS: AgentOriginOS | null = originOS ?? currentOS?.slug ?? null
      if (!shouldRunForContext(preset, contextOS, loopMomentum)) {
        return
      }

      const teamRunId = createTeamRunId()
      const createdAt = new Date().toISOString()

      const steps: AgentTeamRunStep[] = preset.sequence.map((role, index) => ({
        runId: '',
        role,
        status: 'queued',
        index,
      }))

      const label = preset.label

      const teamRun: AgentTeamRun = {
        teamRunId,
        teamId,
        originOS,
        createdAt,
        label,
        steps,
        status: 'running',
      }

      setTeamRuns((previous) => [teamRun, ...previous])

      const previousOutputs: string[] = []

      try {
        for (let index = 0; index < preset.sequence.length; index += 1) {
          const role = preset.sequence[index]
          const stepInstruction = buildTeamInstruction(instruction, teamId, role, previousOutputs)

          const result = await spawnAgentRun({
            role,
            originOS,
            target,
            input: stepInstruction,
            meta: {
              teamRunId,
              teamId,
              teamStepIndex: index,
            },
          })

          const runId = result?.id ?? `team-${teamRunId}-${index}`

          setTeamRuns((previous) =>
            previous.map((existing) => {
              if (existing.teamRunId !== teamRunId) return existing
              return {
                ...existing,
                steps: existing.steps.map((step) =>
                  step.index === index ? { ...step, runId, status: 'done' } : step
                ),
              }
            })
          )

          const output = result?.output ?? null

          if (output) {
            previousOutputs.push(output)

            if (role === 'scout') {
              queueOSBridge('analogue', {
                kind: 'loopos-to-analogue',
                title: 'Creative team notes',
                body: output,
                lane: 'creative',
                tag: 'idea',
                source: 'other',
              })
            } else if (role === 'coach') {
              queueOSBridge('aqua', {
                kind: 'loopos-to-aqua',
                name: 'Promo pitch draft',
                notes: output,
                lane: 'promo',
                summaryText: output,
                source: 'other',
              })
            } else if (role === 'insight') {
              const payload: DawToLoopOSPayload = {
                kind: 'daw-to-loopos',
                lane: 'analysis',
                name: 'Loop insight from team',
                notes: output,
              }
              queueOSBridge('loopos', payload)
            } else if (role === 'tracker') {
              queueOSBridge('xp', {
                kind: 'loopos-to-xp',
                clipboardText: output,
                source: 'other',
              })
            }
          }
        }

        setTeamRuns((previous) =>
          previous.map((existing) =>
            existing.teamRunId === teamRunId ? { ...existing, status: 'done' } : existing
          )
        )
      } catch {
        setTeamRuns((previous) =>
          previous.map((existing) =>
            existing.teamRunId === teamRunId ? { ...existing, status: 'error' } : existing
          )
        )
      }
    },
    [currentOS?.slug, spawnAgentRun]
  )

  const value: AgentTeamsContextValue = useMemo(
    () => ({
      teamRuns,
      runTeam,
    }),
    [runTeam, teamRuns]
  )

  return <AgentTeamsContext.Provider value={value}>{children}</AgentTeamsContext.Provider>
}

export function useAgentTeams(): AgentTeamsContextValue {
  const ctx = useContext(AgentTeamsContext)
  if (!ctx) {
    throw new Error('useAgentTeams must be used within an AgentTeamOrchestratorProvider')
  }
  return ctx
}
