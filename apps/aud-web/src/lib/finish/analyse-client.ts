/**
 * Client-side track analysis for Finish mode.
 *
 * Decodes the artist's audio file in the browser (Web Audio API) and runs
 * the pure DSP analysis from analyse-dsp.ts. The audio itself never leaves
 * the device — only the resulting numbers are sent to the perspectives
 * route. This is a trust commitment (docs/STRATEGY_2026.md §4), not an
 * implementation detail.
 *
 * Produces the same AnalysisResult shape the retired finisher engine
 * returned (lib/finisher-client.ts) so downstream code is unchanged.
 */

import type { AnalysisResult, Suggestion } from '@/lib/finisher-client'
import { analyseChannels, type DspAnalysis } from './analyse-dsp'

/** Streaming loudness reference points used for QC framing. */
const STREAMING_TARGET_LUFS = -14
const TRUE_PEAK_CEILING_DBTP = -1

export function deriveQc(analysis: DspAnalysis): {
  qc_passed: boolean
  qc_warnings: string[]
  suggestions: Suggestion[]
} {
  const warnings: string[] = []
  const suggestions: Suggestion[] = []

  if (analysis.true_peak_dbfs > TRUE_PEAK_CEILING_DBTP) {
    warnings.push(
      `True peak is ${analysis.true_peak_dbfs} dBTP — above the ${TRUE_PEAK_CEILING_DBTP} dBTP ceiling most streaming encoders expect`
    )
    suggestions.push({
      category: 'loudness',
      severity: analysis.true_peak_dbfs > 0 ? 'critical' : 'warning',
      message: 'Inter-sample peaks may distort after lossy encoding',
      action: `Lower the limiter ceiling to ${TRUE_PEAK_CEILING_DBTP} dBTP or below`,
      metric_name: 'true_peak_dbfs',
      current_value: analysis.true_peak_dbfs,
      target_value: TRUE_PEAK_CEILING_DBTP,
    })
  }

  if (analysis.integrated_lufs > -8) {
    warnings.push(
      `Integrated loudness is ${analysis.integrated_lufs} LUFS — very loud; streaming services will turn it down substantially`
    )
    suggestions.push({
      category: 'loudness',
      severity: 'warning',
      message:
        'Very loud masters get turned down by normalisation and can sound smaller afterwards',
      action: 'Consider easing the limiter so the mix keeps more of its dynamics',
      metric_name: 'integrated_lufs',
      current_value: analysis.integrated_lufs,
      target_value: STREAMING_TARGET_LUFS,
    })
  } else if (analysis.integrated_lufs < -24 && analysis.silence_ratio < 0.5) {
    warnings.push(
      `Integrated loudness is ${analysis.integrated_lufs} LUFS — quiet compared with most released music`
    )
    suggestions.push({
      category: 'loudness',
      severity: 'info',
      message: 'The track is quieter than the material it will sit next to in playlists',
      action: 'A gentle gain or limiting stage would bring it closer to release level',
      metric_name: 'integrated_lufs',
      current_value: analysis.integrated_lufs,
      target_value: STREAMING_TARGET_LUFS,
    })
  }

  if (analysis.channels >= 2 && analysis.correlation < 0) {
    warnings.push(
      `Left/right correlation is ${analysis.correlation} — the sides are working against each other and the mix may partially cancel in mono`
    )
    suggestions.push({
      category: 'stereo',
      severity: 'warning',
      message: 'Negative correlation usually means phase issues between left and right',
      action: 'Check stereo wideners, layered duplicates and mic phase, then listen in mono',
      metric_name: 'correlation',
      current_value: analysis.correlation,
      target_value: 0.5,
    })
  }

  if (Math.abs(analysis.dc_offset) > 0.01) {
    warnings.push(`DC offset detected (${analysis.dc_offset})`)
    suggestions.push({
      category: 'technical',
      severity: 'warning',
      message: 'A DC offset wastes headroom and can click at edit points',
      action: 'Apply a high-pass or DC-removal filter at the start of the chain',
      metric_name: 'dc_offset',
      current_value: analysis.dc_offset,
      target_value: 0,
    })
  }

  if (analysis.silence_ratio > 0.2) {
    warnings.push(
      `${Math.round(analysis.silence_ratio * 100)}% of the file is effectively silent — check for long lead-in or tail`
    )
    suggestions.push({
      category: 'technical',
      severity: 'info',
      message: 'Long silent stretches at the start or end get flagged by distributors',
      action: 'Trim the file to roughly half a second of silence either side',
      metric_name: 'silence_ratio',
      current_value: analysis.silence_ratio,
      target_value: 0.02,
    })
  }

  const critical = suggestions.some((s) => s.severity === 'critical')
  return { qc_passed: !critical && warnings.length === 0, qc_warnings: warnings, suggestions }
}

export function toAnalysisResult(analysis: DspAnalysis): AnalysisResult {
  return { ...analysis, ...deriveQc(analysis) }
}

/**
 * Decode and analyse an audio file entirely in the browser.
 * Throws with a friendly message if the file can't be decoded.
 */
export async function analyseAudioFile(file: File | Blob): Promise<AnalysisResult> {
  if (typeof window === 'undefined' || typeof AudioContext === 'undefined') {
    throw new Error('Audio analysis needs to run in the browser')
  }

  const arrayBuffer = await file.arrayBuffer()
  const context = new AudioContext()
  try {
    const buffer = await context.decodeAudioData(arrayBuffer).catch(() => {
      throw new Error(
        "We couldn't read that file. WAV, MP3, FLAC (Chrome/Firefox), AAC and OGG work best."
      )
    })

    const channels: Float32Array[] = []
    for (let i = 0; i < Math.min(buffer.numberOfChannels, 2); i++) {
      channels.push(buffer.getChannelData(i))
    }

    return toAnalysisResult(analyseChannels(channels, buffer.sampleRate))
  } finally {
    void context.close().catch(() => undefined)
  }
}
