'use client'

import type { ExportArtifact, ExportArtifactType } from './exportPresets'

interface LoopSummaryInput {
  name?: string | null
  bpm?: number | null
  momentumLabel?: string | null
  momentumScore?: number | null
  clipCount?: number
  lanes?: string[]
}

interface AgentOutputSummary {
  headline?: string
  details?: string
}

export function buildBaseExport({
  kind,
  title,
  body,
  tags,
  lane,
}: {
  kind: ExportArtifactType
  title: string
  body: string
  tags: string[]
  lane?: string
}): ExportArtifact {
  return {
    kind,
    title,
    body,
    tags,
    lane,
  }
}

export function buildLoopSummaryBody(
  loop: LoopSummaryInput,
  agentInsights?: AgentOutputSummary
): string {
  const lines: string[] = []

  if (loop.name) {
    lines.push(`Loop: ${loop.name}`)
  }

  if (typeof loop.bpm === 'number') {
    lines.push(`BPM: ${loop.bpm}`)
  }

  if (typeof loop.clipCount === 'number') {
    lines.push(`Clips: ${loop.clipCount}`)
  }

  if (loop.momentumLabel || typeof loop.momentumScore === 'number') {
    const score = loop.momentumScore != null ? `${Math.round(loop.momentumScore * 100)}%` : null
    lines.push(`Momentum: ${loop.momentumLabel ?? 'n/a'}${score ? ` (${score})` : ''}`)
  }

  if (loop.lanes && loop.lanes.length > 0) {
    lines.push(`Lanes: ${loop.lanes.join(', ')}`)
  }

  if (agentInsights?.headline || agentInsights?.details) {
    lines.push('')
    if (agentInsights.headline) {
      lines.push(agentInsights.headline)
    }
    if (agentInsights.details) {
      lines.push(agentInsights.details)
    }
  }

  return lines.join('\n')
}
