import type { LoopOSClipData, LoopOSLane } from '../useLoopOSLocalStore'

export interface SequencedClip extends LoopOSClipData {
  end: number
  conflicts: boolean
  blockedBy: string[]
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd
}

function applyConflictRules(clips: SequencedClip[]): void {
  const byLane = new Map<LoopOSLane, SequencedClip[]>()

  clips.forEach((clip) => {
    const laneClips = byLane.get(clip.lane) ?? []
    laneClips.push(clip)
    byLane.set(clip.lane, laneClips)
  })

  byLane.forEach((laneClips) => {
    laneClips
      .slice()
      .sort((a, b) => a.start - b.start)
      .forEach((clip, index, sorted) => {
        for (let i = index + 1; i < sorted.length; i += 1) {
          const other = sorted[i]
          if (other.start >= clip.end) break

          if (rangesOverlap(clip.start, clip.end, other.start, other.end)) {
            clip.conflicts = true
            other.conflicts = true
          }
        }
      })
  })
}

function hasPrereqBefore(
  clips: SequencedClip[],
  target: SequencedClip,
  lanes: LoopOSLane[],
): boolean {
  return clips.some(
    (clip) => lanes.includes(clip.lane) && clip.end <= target.start && clip.id !== target.id,
  )
}

function applyBlockedByRules(clips: SequencedClip[]): void {
  clips.forEach((clip) => {
    if (clip.lane === 'promo') {
      if (!hasPrereqBefore(clips, clip, ['creative', 'action'])) {
        clip.blockedBy.push('prereq:creative-or-action')
      }
    }

    if (clip.lane === 'analysis') {
      if (!hasPrereqBefore(clips, clip, ['promo', 'creative'])) {
        clip.blockedBy.push('prereq:promo-or-creative')
      }
    }
  })
}

export function computeSequencedClips(clips: LoopOSClipData[]): SequencedClip[] {
  const sequenced: SequencedClip[] = clips.map((clip) => ({
    ...clip,
    end: clip.start + clip.length,
    conflicts: false,
    blockedBy: [],
  }))

  if (!sequenced.length) return sequenced

  applyConflictRules(sequenced)
  applyBlockedByRules(sequenced)

  return sequenced
}

export function getNextActionClips(
  sequenced: SequencedClip[],
  playhead: number,
  limit = 6,
): SequencedClip[] {
  return sequenced
    .filter((clip) => clip.start >= playhead && !clip.conflicts && clip.blockedBy.length === 0)
    .sort((a, b) => a.start - b.start)
    .slice(0, limit)
}

export interface ClipValidationResult {
  valid: boolean
  reasons: string[]
}

export function validateClipChange(
  existingClips: LoopOSClipData[],
  updatedClip: LoopOSClipData,
): ClipValidationResult {
  const reasons: string[] = []

  if (updatedClip.length <= 0) {
    reasons.push('Clip length must be greater than zero.')
  }

  const overlapThreshold = 0.5
  const updatedStart = updatedClip.start
  const updatedEnd = updatedClip.start + updatedClip.length

  existingClips.forEach((clip) => {
    if (clip.id === updatedClip.id || clip.lane !== updatedClip.lane) return

    const otherStart = clip.start
    const otherEnd = clip.start + clip.length
    const intersectionStart = Math.max(updatedStart, otherStart)
    const intersectionEnd = Math.min(updatedEnd, otherEnd)
    const overlapAmount = intersectionEnd - intersectionStart

    if (overlapAmount > overlapThreshold) {
      reasons.push(
        `Overlaps with clip "${clip.name}" in lane ${clip.lane} by more than ${overlapThreshold.toFixed(
          1,
        )} units.`,
      )
    }
  })

  return {
    valid: reasons.length === 0,
    reasons,
  }
}


