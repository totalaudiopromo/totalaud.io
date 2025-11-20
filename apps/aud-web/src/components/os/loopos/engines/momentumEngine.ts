import type { LoopOSLane } from '../useLoopOSLocalStore'
import { getNextActionClips, type SequencedClip } from './sequenceEngine'

const ALL_LANES: LoopOSLane[] = ['creative', 'action', 'promo', 'analysis', 'refine']

export interface MomentumResult {
  score: number
  label: 'low' | 'medium' | 'high'
  reasons: string[]
  laneWeights: Record<LoopOSLane, number>
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function computeMomentum(clips: SequencedClip[]): MomentumResult {
  if (!clips.length) {
    return {
      score: 0,
      label: 'low',
      reasons: ['No clips yet'],
      laneWeights: {
        creative: 0,
        action: 0,
        promo: 0,
        analysis: 0,
        refine: 0,
      },
    }
  }

  const totalLength = clips.reduce((sum, clip) => sum + clip.length, 0)

  const laneLengths = ALL_LANES.reduce<Record<LoopOSLane, number>>(
    (acc, lane) => ({
      ...acc,
      [lane]: clips
        .filter((clip) => clip.lane === lane)
        .reduce((sum, clip) => sum + clip.length, 0),
    }),
    {
      creative: 0,
      action: 0,
      promo: 0,
      analysis: 0,
      refine: 0,
    },
  )

  const laneWeights: Record<LoopOSLane, number> =
    totalLength > 0
      ? (Object.fromEntries(
          ALL_LANES.map((lane) => [lane, laneLengths[lane] / totalLength]),
        ) as Record<LoopOSLane, number>)
      : {
          creative: 0,
          action: 0,
          promo: 0,
          analysis: 0,
          refine: 0,
        }

  const reasons: string[] = []

  const clipCount = clips.length
  const base =
    clipCount >= 8 ? 0.6 : clamp((clipCount / 8) * 0.6, 0.1, 0.6) // 1–7 clips ramp up towards 0.6

  const usedLanes = ALL_LANES.filter((lane) => laneLengths[lane] > 0)
  const diversityBonus = clamp(Math.max(0, usedLanes.length - 1) * 0.1, 0, 0.3)

  if (usedLanes.length >= 3 && totalLength > 0) {
    const shares = usedLanes.map((lane) => laneWeights[lane])
    const maxShare = Math.max(...shares)
    const minShare = Math.min(...shares)
    if (maxShare - minShare <= 0.25) {
      reasons.push('Strong balance across lanes')
    }
  }

  let balancePenalty = 0
  if (totalLength > 0) {
    const entries = ALL_LANES.map((lane) => [lane, laneWeights[lane]] as const)
    const [dominantLane, dominantShare] = entries.reduce(
      (best, current) => (current[1] > best[1] ? current : best),
      entries[0],
    )

    if (dominantShare > 0.6) {
      balancePenalty = 0.2
      if (dominantLane === 'promo') {
        reasons.push('Promo dominating loop')
      } else {
        reasons.push('One lane dominating timeline')
      }
    }
  }

  const readyClips = getNextActionClips(clips, 0)
  const readyCount = readyClips.length
  let readyBonus = 0
  if (readyCount >= 1 && readyCount <= 3) {
    readyBonus = 0.1
    reasons.push('Multiple clips ready to run')
  } else if (readyCount > 3) {
    readyBonus = 0.2
    reasons.push('Several clips ready to run')
  }

  const conflictCount = clips.filter((clip) => clip.conflicts).length
  const conflictPenalty = clamp(conflictCount * 0.05, 0, 0.3)
  if (conflictCount > 0) {
    reasons.push('Several conflicts detected')
  }

  const rawScore = clamp(base + diversityBonus + readyBonus - balancePenalty - conflictPenalty, 0, 1)

  const label: MomentumResult['label'] =
    rawScore < 0.3 ? 'low' : rawScore <= 0.7 ? 'medium' : 'high'

  return {
    score: rawScore,
    label,
    reasons,
    laneWeights,
  }
}


