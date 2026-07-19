/**
 * Finishing report builder — Finish mode.
 *
 * Turns the on-device analysis and (when present) the finishing notes into
 * a plain Markdown report the artist can download and keep. Mirrors the
 * voice rules in perspectives.ts: no scores, no judgement, decision support.
 */

import type { AnalysisResult } from '@/lib/finisher-client'
import {
  PERSPECTIVE_IDS,
  type FinishingNotes,
  type PerspectiveId,
  type TrackContext,
} from '@/lib/finish/perspectives'

const PERSPECTIVE_LABELS: Record<PerspectiveId, string> = {
  producer: 'Producer',
  mix: 'Mix',
  listener: 'Listener',
  industry: 'Industry',
}

function metricLines(analysis: AnalysisResult): string[] {
  const lines = [
    `| Integrated loudness | ${analysis.integrated_lufs} LUFS |`,
    `| True peak | ${analysis.true_peak_dbfs} dBTP |`,
    `| Loudness range | ${analysis.loudness_range_lu} LU |`,
    `| Short-term level movement | ${analysis.dynamic_range_db} dB |`,
    `| Crest factor | ${analysis.crest_factor_db} dB |`,
    `| Stereo width (side energy share) | ${analysis.stereo_width} |`,
    `| Left/right correlation | ${analysis.correlation} |`,
    `| Spectral centroid | ${analysis.spectral_centroid_hz} Hz |`,
    `| Spectral rolloff (85%) | ${analysis.spectral_rolloff_hz} Hz |`,
    `| Duration | ${analysis.duration_seconds}s, ${analysis.channels} channel(s) at ${analysis.sample_rate} Hz |`,
    `| Silence ratio | ${analysis.silence_ratio} |`,
  ]
  return ['| Measurement | Value |', '| --- | --- |', ...lines]
}

export interface FinishingReportInput {
  analysis: AnalysisResult
  finishingNotes?: FinishingNotes | null
  trackContext?: TrackContext
  fileName?: string | null
  /** Perspective ids held back for guests — omitted from the report. */
  lockedPerspectives?: string[]
}

export function buildFinishingReport({
  analysis,
  finishingNotes,
  trackContext,
  fileName,
  lockedPerspectives = [],
}: FinishingReportInput): string {
  const title = trackContext?.trackName?.trim() || fileName || 'Untitled track'
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const parts: string[] = [
    `# Finishing report — ${title}`,
    '',
    `_Prepared ${date} with totalaud.io. Analysis ran on the artist's device — the audio never left it._`,
    '',
  ]

  if (trackContext?.genre || trackContext?.intent) {
    parts.push('## About this release', '')
    if (trackContext.genre) parts.push(`- **Genre / lane:** ${trackContext.genre}`)
    if (trackContext.intent) parts.push(`- **What the artist wants:** ${trackContext.intent}`)
    parts.push('')
  }

  parts.push('## Measurements', '', ...metricLines(analysis), '')

  if (analysis.qc_warnings.length > 0) {
    parts.push('### Technical flags', '')
    for (const warning of analysis.qc_warnings) {
      parts.push(`- ${warning}`)
    }
    parts.push('')
  }

  if (finishingNotes) {
    parts.push('## Finishing notes', '')
    for (const id of PERSPECTIVE_IDS) {
      if (lockedPerspectives.includes(id)) continue
      const perspective = finishingNotes.perspectives.find((p) => p.perspective === id)
      if (!perspective) continue

      parts.push(`### ${PERSPECTIVE_LABELS[id]}`, '', perspective.summary, '')
      for (const note of perspective.notes) {
        parts.push(`- ${note.observation}`, `  - _Worth considering:_ ${note.worth_considering}`)
      }
      parts.push('')
    }

    if (finishingNotes.before_release.length > 0) {
      parts.push('## Before release', '')
      for (const item of finishingNotes.before_release) {
        parts.push(`- [ ] ${item}`)
      }
      parts.push('')
    }
  }

  return parts.join('\n')
}

/** Trigger a client-side download of the report as a Markdown file. */
export function downloadFinishingReport(input: FinishingReportInput): void {
  const content = buildFinishingReport(input)
  const safeName = (input.trackContext?.trackName?.trim() || input.fileName || 'finishing-report')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${safeName || 'finishing-report'}.md`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
