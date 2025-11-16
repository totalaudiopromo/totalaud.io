/**
 * Intent Parser
 * Phase 20 - Deterministic text-to-intent conversion
 * No AI calls - pure rule-based parsing
 */

import type {
  IntentMap,
  IntentStyle,
  IntentArc,
  IntentPalette,
  OSName,
  PerformanceSegment,
} from './intent.types'

/**
 * Vocabulary mappings for style detection
 */
const STYLE_VOCABULARY: Record<IntentStyle, string[]> = {
  calm: ['calm', 'peaceful', 'gentle', 'soft', 'serene', 'quiet', 'meditative', 'still', 'tranquil'],
  intense: ['intense', 'energetic', 'powerful', 'strong', 'aggressive', 'loud', 'explosive', 'fierce'],
  balanced: ['balanced', 'moderate', 'steady', 'consistent', 'even', 'measured', 'controlled'],
  fragmented: ['fragmented', 'broken', 'scattered', 'irregular', 'chaotic', 'disjointed', 'unstable'],
  focused: ['focused', 'concentrated', 'direct', 'precise', 'clear', 'sharp', 'deliberate'],
}

/**
 * Verb patterns for arc detection
 */
const ARC_PATTERNS: Record<IntentArc, string[]> = {
  rise: ['rise', 'rising', 'build', 'building', 'grow', 'growing', 'escalate', 'ascend', 'climb', 'increase'],
  fall: ['fall', 'falling', 'collapse', 'descend', 'decline', 'fade', 'diminish', 'drop'],
  oscillate: ['oscillate', 'alternate', 'wave', 'fluctuate', 'swing', 'pulse', 'bounce'],
  resolve: ['resolve', 'resolving', 'conclude', 'settle', 'clarify', 'clarity', 'focus'],
  cycle: ['cycle', 'cycling', 'repeat', 'loop', 'circular', 'return', 'revolve'],
}

/**
 * Adjectives for palette detection
 */
const PALETTE_PATTERNS: Record<IntentPalette, string[]> = {
  warm: ['warm', 'hot', 'red', 'orange', 'yellow', 'golden', 'fiery', 'amber'],
  cold: ['cold', 'cool', 'blue', 'cyan', 'teal', 'icy', 'arctic', 'frozen'],
  neutral: ['neutral', 'grey', 'gray', 'balanced', 'muted', 'subtle'],
  dark: ['dark', 'black', 'shadow', 'night', 'deep', 'dim', 'sombre'],
  bright: ['bright', 'light', 'brilliant', 'vivid', 'vibrant', 'luminous', 'radiant'],
}

/**
 * OS name patterns (British and American spellings)
 */
const OS_PATTERNS: Record<string, OSName> = {
  ascii: 'ascii',
  terminal: 'ascii',
  xp: 'xp',
  'windows xp': 'xp',
  windows: 'xp',
  aqua: 'aqua',
  mac: 'aqua',
  macos: 'aqua',
  ableton: 'ableton',
  daw: 'ableton',
  punk: 'punk',
  analogue: 'punk',
  analog: 'punk',
}

/**
 * Stop words to filter from keywords
 */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'into', 'that', 'this', 'is', 'are', 'was',
  'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can',
])

/**
 * Default duration for performances (in seconds)
 */
const DEFAULT_DURATION = 180 // 3 minutes

/**
 * Number of scenes to generate
 */
const DEFAULT_SCENE_COUNT = 7

/**
 * Parse intent text into IntentMap
 * Deterministic and rule-based
 */
export function parseIntentText(input: string): IntentMap {
  const lowerInput = input.toLowerCase()
  const words = lowerInput.split(/\s+/)

  // Detect style
  const style = detectStyle(lowerInput, words)

  // Detect arc
  const arc = detectArc(lowerInput, words)

  // Detect palette
  const palette = detectPalette(lowerInput, words)

  // Detect OS references
  const { leadOS, resistingOS } = detectOSReferences(lowerInput)

  // Generate tempo curve based on style
  const tempoCurve = generateTempoCurve(style, arc)

  // Generate emotional curve based on arc
  const emotionalCurve = generateEmotionalCurve(arc, DEFAULT_SCENE_COUNT)

  // Generate performance structure
  const performanceStructure = generatePerformanceStructure(
    emotionalCurve,
    style,
    arc
  )

  // Extract keywords
  const keywords = extractKeywords(words)

  return {
    style,
    arc,
    palette,
    leadOS,
    resistingOS,
    tempoCurve,
    emotionalCurve,
    durationSeconds: DEFAULT_DURATION,
    performanceStructure,
    keywords,
  }
}

/**
 * Detect style from vocabulary
 */
function detectStyle(input: string, words: string[]): IntentStyle {
  const scores: Record<IntentStyle, number> = {
    calm: 0,
    intense: 0,
    balanced: 0,
    fragmented: 0,
    focused: 0,
  }

  for (const [style, vocabulary] of Object.entries(STYLE_VOCABULARY)) {
    for (const term of vocabulary) {
      if (input.includes(term)) {
        scores[style as IntentStyle] += 1
      }
    }
  }

  // Return style with highest score, default to 'balanced'
  const maxStyle = Object.entries(scores).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0] as IntentStyle

  return scores[maxStyle] > 0 ? maxStyle : 'balanced'
}

/**
 * Detect arc from verb patterns
 */
function detectArc(input: string, words: string[]): IntentArc {
  const scores: Record<IntentArc, number> = {
    rise: 0,
    fall: 0,
    oscillate: 0,
    resolve: 0,
    cycle: 0,
  }

  for (const [arc, patterns] of Object.entries(ARC_PATTERNS)) {
    for (const pattern of patterns) {
      if (input.includes(pattern)) {
        scores[arc as IntentArc] += 1
      }
    }
  }

  // Return arc with highest score, default to 'resolve'
  const maxArc = Object.entries(scores).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0] as IntentArc

  return scores[maxArc] > 0 ? maxArc : 'resolve'
}

/**
 * Detect palette from adjectives
 */
function detectPalette(input: string, words: string[]): IntentPalette {
  const scores: Record<IntentPalette, number> = {
    warm: 0,
    cold: 0,
    neutral: 0,
    dark: 0,
    bright: 0,
  }

  for (const [palette, patterns] of Object.entries(PALETTE_PATTERNS)) {
    for (const pattern of patterns) {
      if (input.includes(pattern)) {
        scores[palette as IntentPalette] += 1
      }
    }
  }

  // Return palette with highest score, default to 'neutral'
  const maxPalette = Object.entries(scores).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0] as IntentPalette

  return scores[maxPalette] > 0 ? maxPalette : 'neutral'
}

/**
 * Detect OS references (lead and resisting)
 */
function detectOSReferences(input: string): {
  leadOS: OSName | null
  resistingOS: OSName | null
} {
  let leadOS: OSName | null = null
  let resistingOS: OSName | null = null

  // Look for "led by" or "leading" pattern
  const leadPattern = /(?:led by|leading|lead by)\s+(\w+)/i
  const leadMatch = input.match(leadPattern)
  if (leadMatch) {
    const osName = leadMatch[1].toLowerCase()
    leadOS = OS_PATTERNS[osName] || null
  }

  // Look for "resisting" or "resist" pattern
  const resistPattern = /(?:resisting|resist|resistance from)\s+(\w+)/i
  const resistMatch = input.match(resistPattern)
  if (resistMatch) {
    const osName = resistMatch[1].toLowerCase()
    resistingOS = OS_PATTERNS[osName] || null
  }

  // If no explicit patterns, look for any OS mentions
  if (!leadOS && !resistingOS) {
    const mentionedOS: OSName[] = []
    for (const [pattern, osName] of Object.entries(OS_PATTERNS)) {
      if (input.includes(pattern)) {
        mentionedOS.push(osName)
      }
    }

    // First mentioned is lead, second is resisting
    if (mentionedOS.length >= 1) {
      leadOS = mentionedOS[0]
    }
    if (mentionedOS.length >= 2) {
      resistingOS = mentionedOS[1]
    }
  }

  return { leadOS, resistingOS }
}

/**
 * Generate tempo curve based on style and arc
 */
function generateTempoCurve(style: IntentStyle, arc: IntentArc): number[] {
  const baseTempo: Record<IntentStyle, number> = {
    calm: 90,
    intense: 120,
    balanced: 110,
    fragmented: 110,
    focused: 105,
  }

  const base = baseTempo[style]
  const count = DEFAULT_SCENE_COUNT

  switch (arc) {
    case 'rise':
      return Array.from({ length: count }, (_, i) =>
        Math.round(base + (i / (count - 1)) * 30)
      )
    case 'fall':
      return Array.from({ length: count }, (_, i) =>
        Math.round(base + 30 - (i / (count - 1)) * 30)
      )
    case 'oscillate':
      return Array.from({ length: count }, (_, i) =>
        Math.round(base + (i % 2 === 0 ? 0 : 15))
      )
    case 'resolve':
      return Array.from({ length: count }, (_, i) =>
        Math.round(base + (i / (count - 1)) * 10)
      )
    case 'cycle':
      return Array.from({ length: count }, (_, i) => {
        const phase = (i / count) * Math.PI * 2
        return Math.round(base + Math.sin(phase) * 15)
      })
  }

  // Fragmented style gets irregular pattern
  if (style === 'fragmented') {
    return [110, 95, 125, 108, 98, 118, 105]
  }

  return Array(count).fill(base)
}

/**
 * Generate emotional curve based on arc
 */
function generateEmotionalCurve(arc: IntentArc, count: number): number[] {
  switch (arc) {
    case 'rise':
      return Array.from({ length: count }, (_, i) =>
        0.2 + (i / (count - 1)) * 0.7
      )
    case 'fall':
      return Array.from({ length: count }, (_, i) =>
        0.9 - (i / (count - 1)) * 0.6
      )
    case 'oscillate':
      return Array.from({ length: count }, (_, i) =>
        i % 2 === 0 ? 0.2 : 0.8
      )
    case 'resolve':
      return Array.from({ length: count }, (_, i) => {
        if (i < count / 2) {
          return 0.5 + (i / (count / 2)) * 0.3
        } else {
          return 0.8 + ((i - count / 2) / (count / 2)) * 0.15
        }
      })
    case 'cycle':
      return Array.from({ length: count }, (_, i) => {
        const phase = (i / count) * Math.PI * 2
        return 0.5 + Math.sin(phase) * 0.3
      })
  }

  return Array(count).fill(0.5)
}

/**
 * Generate performance structure segments
 */
function generatePerformanceStructure(
  emotionalCurve: number[],
  style: IntentStyle,
  arc: IntentArc
): PerformanceSegment[] {
  return emotionalCurve.map((emotion, i) => {
    // Tension follows emotional curve
    const tension = emotion

    // Cohesion is inverse of tension for most arcs
    let cohesion = 1 - tension
    if (arc === 'resolve') {
      // Cohesion increases as we resolve
      cohesion = 0.3 + (i / (emotionalCurve.length - 1)) * 0.7
    }

    // Density based on style
    let density = 0.5
    switch (style) {
      case 'calm':
        density = 0.3 + emotion * 0.2
        break
      case 'intense':
        density = 0.7 + emotion * 0.3
        break
      case 'fragmented':
        density = i % 2 === 0 ? 0.4 : 0.8
        break
      case 'focused':
        density = 0.6 + emotion * 0.2
        break
      case 'balanced':
        density = 0.5 + emotion * 0.3
        break
    }

    return {
      segment: i,
      tension: Math.min(1, Math.max(0, tension)),
      cohesion: Math.min(1, Math.max(0, cohesion)),
      density: Math.min(1, Math.max(0, density)),
    }
  })
}

/**
 * Extract keywords by filtering stop words
 */
function extractKeywords(words: string[]): string[] {
  return words
    .filter((word) => word.length > 2)
    .filter((word) => !STOP_WORDS.has(word))
    .filter((word, index, self) => self.indexOf(word) === index) // Unique
    .slice(0, 10) // Limit to 10 keywords
}

/**
 * Get preset intent texts for UI
 */
export const INTENT_PRESETS = [
  {
    id: 'calm-aqua-rise',
    name: 'Calm Clarity',
    description: 'A calm arc that grows into clarity led by Aqua',
    intentText: 'A calm arc that grows into clarity led by Aqua.',
    tags: ['calm', 'rise', 'aqua'],
  },
  {
    id: 'fragmented-tensions',
    name: 'Fragmented Tensions',
    description: 'Fragmented tensions between XP and Analogue resolving slowly',
    intentText: 'Fragmented tensions between XP and Analogue resolving slowly.',
    tags: ['fragmented', 'resolve', 'xp', 'analogue'],
  },
  {
    id: 'intense-rise-daw',
    name: 'Intense Rise',
    description: 'Intense rise with DAW leading and ASCII resisting',
    intentText: 'Intense rise with DAW leading and ASCII resisting.',
    tags: ['intense', 'rise', 'daw', 'ascii'],
  },
  {
    id: 'warm-cycle',
    name: 'Warm Cycle',
    description: 'A warm cycling pattern with balanced energy',
    intentText: 'A warm cycling pattern with balanced energy.',
    tags: ['warm', 'cycle', 'balanced'],
  },
  {
    id: 'dark-fall',
    name: 'Dark Descent',
    description: 'A dark intense fall into quietness',
    intentText: 'A dark intense fall into quietness led by ASCII.',
    tags: ['dark', 'fall', 'intense', 'ascii'],
  },
]
