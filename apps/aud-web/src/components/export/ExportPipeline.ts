'use client'

import type { ExportArtifact } from './exportPresets'
import { buildBaseExport, buildLoopSummaryBody } from './exportBuilders'

interface LoopLike {
  name?: string | null
  bpm?: number | null
  lanes?: string[]
}

interface MomentumLike {
  label?: string
  score?: number
}

export function buildPitchDraft(
  loop: LoopLike | null,
  momentum: MomentumLike | null,
  agentOutput?: string,
): ExportArtifact {
  const loopName = loop?.name ?? 'Untitled campaign loop'
  const bpm = loop?.bpm ?? null
  const momentumLabel = momentum?.label ?? null
  const momentumScore = momentum?.score ?? null

  const lines: string[] = [
    `Pitch draft for: ${loopName}`,
    bpm ? `Tempo: ${bpm} BPM` : '',
    momentumLabel || momentumScore != null
      ? `Loop momentum: ${momentumLabel ?? 'n/a'}${
          momentumScore != null ? ` (${Math.round(momentumScore * 100)}%)` : ''
        }`
      : '',
  ].filter(Boolean)

  if (agentOutput) {
    lines.push('', 'Agent notes:', agentOutput)
  }

  return buildBaseExport({
    kind: 'pitch_draft',
    title: `Pitch draft – ${loopName}`,
    body: lines.join('\n'),
    tags: ['pitch', 'draft'],
  })
}

export function buildCreativeBrief(analogueCards: { title: string; body: string; tag?: string }[], loop: LoopLike | null): ExportArtifact {
  const loopName = loop?.name ?? 'Untitled campaign loop'
  const lines: string[] = [`Creative brief for ${loopName}`, '']

  analogueCards.forEach((card, index) => {
    const label = card.tag ? `${card.tag.toUpperCase()} ${index + 1}` : `ITEM ${index + 1}`
    lines.push(`${label}: ${card.title}`, card.body, '')
  })

  return buildBaseExport({
    kind: 'creative_brief',
    title: `Creative brief – ${loopName}`,
    body: lines.join('\n').trimEnd(),
    tags: ['creative', 'brief'],
  })
}

export function buildLoopSummary(
  loop: LoopLike | null,
  agentInsights?: { headline?: string; details?: string },
): ExportArtifact {
  const body = buildLoopSummaryBody(
    {
      name: loop?.name ?? 'Campaign loop',
      bpm: loop?.bpm ?? null,
      clipCount: undefined,
      lanes: loop?.lanes ?? [],
      momentumLabel: agentInsights?.headline ?? null,
      momentumScore: null,
    },
    agentInsights,
  )

  return buildBaseExport({
    kind: 'loop_summary',
    title: loop?.name ? `Loop summary – ${loop.name}` : 'Loop summary',
    body,
    tags: ['loop', 'summary'],
  })
}

export function buildCampaignSnapshot(
  loop: LoopLike | null,
  xpClipboard: string,
): ExportArtifact {
  const loopName = loop?.name ?? 'Campaign loop'
  const bodyLines: string[] = [
    `Campaign snapshot – ${loopName}`,
    '',
    'XP clipboard:',
    xpClipboard || '(no clipboard notes yet)',
  ]

  return buildBaseExport({
    kind: 'campaign_snapshot',
    title: `Campaign snapshot – ${loopName}`,
    body: bodyLines.join('\n'),
    tags: ['campaign', 'snapshot'],
  })
}

export function buildStoryFragment(
  aquaStory: string,
  loop: LoopLike | null,
  agents?: string[],
): ExportArtifact {
  const loopName = loop?.name ?? 'Campaign loop'

  const lines: string[] = [
    `Story fragment linked to ${loopName}`,
    '',
    aquaStory || '(no story text yet)',
  ]

  if (agents && agents.length > 0) {
    lines.push('', 'Agent highlights:', ...agents.map((value) => `- ${value}`))
  }

  return buildBaseExport({
    kind: 'story_fragment',
    title: `Story fragment – ${loopName}`,
    body: lines.join('\n'),
    tags: ['story', 'fragment'],
  })
}


