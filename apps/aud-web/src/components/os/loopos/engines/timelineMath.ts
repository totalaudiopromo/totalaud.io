export const BASE_UNIT_WIDTH = 40
const BEATS_PER_BAR = 4
const UNITS_PER_BAR = 4

export const DEFAULT_TIMELINE_UNITS = 64

export function unitToPosition(unit: number, zoom: number): number {
  const scale = BASE_UNIT_WIDTH * (zoom || 1)
  return unit * scale
}

export function positionToUnit(pixelX: number, zoom: number): number {
  const scale = BASE_UNIT_WIDTH * (zoom || 1)
  if (!scale) return 0
  return Math.max(0, pixelX / scale)
}

export function computePlayheadAdvance(bpm: number, deltaMs: number): number {
  if (bpm <= 0 || deltaMs <= 0) return 0

  const seconds = deltaMs / 1000
  const beatsPerSecond = bpm / 60
  const unitsPerSecond = beatsPerSecond * (UNITS_PER_BAR / BEATS_PER_BAR)

  return seconds * unitsPerSecond
}


