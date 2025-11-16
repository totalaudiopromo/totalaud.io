/**
 * Evolved Personality - Integration with base OS personalities
 * Phase 13A: OS Evolution System
 *
 * Merges base theme personality with evolved traits
 * Affects agent behaviours, fusion reasoning, and cross-OS collaboration
 */

import type { OSProfile } from './evolutionRules'

/**
 * Base OS personality traits (from theme system)
 */
export interface BaseOSPersonality {
  os: string
  tagline: string
  personality: string[]
  baseConfidence: number
  baseVerbosity: number
  baseRiskTolerance: number
  baseEmpathy: number
}

/**
 * Evolved OS personality (base + evolution)
 */
export interface EvolvedOSPersonality extends BaseOSPersonality {
  // Evolved traits
  confidence: number
  verbosity: number
  riskTolerance: number
  empathy: number
  emotionalBias: {
    hope: number
    doubt: number
    clarity: number
    pride: number
    fear: number
  }
  tempoPreference?: number

  // Deltas from base
  confidenceDelta: number
  verbosityDelta: number
  riskToleranceDelta: number
  empathyDelta: number

  // Dominant emotion
  dominantEmotion: string
}

/**
 * Base OS personalities (from existing theme system)
 */
export const BASE_OS_PERSONALITIES: Record<string, BaseOSPersonality> = {
  ascii: {
    os: 'ascii',
    tagline: 'type. test. repeat.',
    personality: ['minimalist', 'precise', 'logical', 'focused'],
    baseConfidence: 0.6,
    baseVerbosity: 0.3,
    baseRiskTolerance: 0.4,
    baseEmpathy: 0.3,
  },
  xp: {
    os: 'xp',
    tagline: 'click. bounce. smile.',
    personality: ['optimistic', 'enthusiastic', 'helpful', 'nostalgic'],
    baseConfidence: 0.7,
    baseVerbosity: 0.7,
    baseRiskTolerance: 0.5,
    baseEmpathy: 0.6,
  },
  aqua: {
    os: 'aqua',
    tagline: 'craft with clarity.',
    personality: ['perfectionist', 'thoughtful', 'clear', 'refined'],
    baseConfidence: 0.6,
    baseVerbosity: 0.5,
    baseRiskTolerance: 0.3,
    baseEmpathy: 0.7,
  },
  daw: {
    os: 'daw',
    tagline: 'sync. sequence. create.',
    personality: ['experimental', 'rhythmic', 'creative', 'producer'],
    baseConfidence: 0.5,
    baseVerbosity: 0.4,
    baseRiskTolerance: 0.7,
    baseEmpathy: 0.4,
  },
  analogue: {
    os: 'analogue',
    tagline: 'touch the signal.',
    personality: ['warm', 'human', 'empathetic', 'tactile'],
    baseConfidence: 0.5,
    baseVerbosity: 0.6,
    baseRiskTolerance: 0.5,
    baseEmpathy: 0.8,
  },
}

/**
 * Merge base personality with evolved profile
 */
export function getEvolvedPersonality(
  os: string,
  evolutionProfile?: OSProfile
): EvolvedOSPersonality {
  const base = BASE_OS_PERSONALITIES[os]
  if (!base) {
    throw new Error(`Unknown OS: ${os}`)
  }

  // If no evolution profile, return base
  if (!evolutionProfile) {
    return {
      ...base,
      confidence: base.baseConfidence,
      verbosity: base.baseVerbosity,
      riskTolerance: base.baseRiskTolerance,
      empathy: base.baseEmpathy,
      emotionalBias: {
        hope: 0.2,
        doubt: 0.2,
        clarity: 0.2,
        pride: 0.2,
        fear: 0.2,
      },
      confidenceDelta: 0,
      verbosityDelta: 0,
      riskToleranceDelta: 0,
      empathyDelta: 0,
      dominantEmotion: 'clarity',
    }
  }

  // Merge base + evolution
  const evolved: EvolvedOSPersonality = {
    ...base,
    confidence: evolutionProfile.confidenceLevel,
    verbosity: evolutionProfile.verbosity,
    riskTolerance: evolutionProfile.riskTolerance,
    empathy: evolutionProfile.empathyLevel,
    emotionalBias: evolutionProfile.emotionalBias,
    tempoPreference: evolutionProfile.tempoPreference,

    // Calculate deltas
    confidenceDelta: evolutionProfile.confidenceLevel - base.baseConfidence,
    verbosityDelta: evolutionProfile.verbosity - base.baseVerbosity,
    riskToleranceDelta: evolutionProfile.riskTolerance - base.baseRiskTolerance,
    empathyDelta: evolutionProfile.empathyLevel - base.baseEmpathy,

    // Get dominant emotion
    dominantEmotion: getDominantEmotion(evolutionProfile.emotionalBias),
  }

  return evolved
}

/**
 * Get dominant emotion from emotional bias
 */
function getDominantEmotion(emotionalBias: Record<string, number>): string {
  let maxEmotion = 'clarity'
  let maxWeight = 0

  for (const [emotion, weight] of Object.entries(emotionalBias)) {
    if (weight > maxWeight) {
      maxWeight = weight
      maxEmotion = emotion
    }
  }

  return maxEmotion
}

/**
 * Apply evolved personality to agent output
 *
 * Affects:
 * - Message length (verbosity)
 * - Suggestion confidence (confidence)
 * - Risk warnings (risk tolerance)
 * - Tone/empathy (empathy + dominant emotion)
 */
export function applyPersonalityToAgentOutput(
  baseOutput: string,
  personality: EvolvedOSPersonality
): {
  output: string
  metadata: {
    confidence: number
    emotionalTone: string
    verbosityLevel: 'concise' | 'balanced' | 'detailed'
  }
} {
  // Determine verbosity level
  let verbosityLevel: 'concise' | 'balanced' | 'detailed' = 'balanced'
  if (personality.verbosity < 0.4) verbosityLevel = 'concise'
  if (personality.verbosity > 0.6) verbosityLevel = 'detailed'

  // Determine emotional tone from dominant emotion
  const emotionalTone = getEmotionalTone(
    personality.dominantEmotion,
    personality.empathy
  )

  // Modify output based on verbosity
  let output = baseOutput
  if (verbosityLevel === 'concise' && personality.os === 'ascii') {
    // ASCII: Strip extra words, keep only essential info
    output = output
      .replace(/\b(just|really|very|quite|actually)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
  } else if (verbosityLevel === 'detailed' && personality.os === 'xp') {
    // XP: Add enthusiastic flourishes
    output = `${output} 🎯`
  }

  return {
    output,
    metadata: {
      confidence: personality.confidence,
      emotionalTone,
      verbosityLevel,
    },
  }
}

/**
 * Get emotional tone from dominant emotion and empathy
 */
function getEmotionalTone(dominantEmotion: string, empathy: number): string {
  const empathyLevel = empathy > 0.6 ? 'high' : empathy < 0.4 ? 'low' : 'medium'

  const toneMap: Record<string, Record<string, string>> = {
    hope: {
      high: 'encouraging',
      medium: 'optimistic',
      low: 'pragmatic-optimistic',
    },
    doubt: {
      high: 'cautiously-supportive',
      medium: 'questioning',
      low: 'critical',
    },
    clarity: {
      high: 'thoughtfully-clear',
      medium: 'matter-of-fact',
      low: 'direct',
    },
    pride: {
      high: 'proudly-supportive',
      medium: 'confident',
      low: 'assertive',
    },
    fear: {
      high: 'protectively-cautious',
      medium: 'concerned',
      low: 'warning',
    },
  }

  return toneMap[dominantEmotion]?.[empathyLevel] || 'neutral'
}

/**
 * Apply evolved personality to fusion reasoning
 *
 * Affects:
 * - Agreement threshold (confidence)
 * - Willingness to voice dissent (risk tolerance)
 * - Depth of reasoning (verbosity)
 */
export function applyPersonalityToFusionReasoning(
  personality: EvolvedOSPersonality,
  fusionContext: {
    otherOSOpinions: string[]
    currentConsensus?: string
  }
): {
  shouldSpeak: boolean
  agreementThreshold: number
  reasoningDepth: 'shallow' | 'moderate' | 'deep'
} {
  // High confidence = lower agreement threshold (speaks even if alone)
  const agreementThreshold = 1 - personality.confidence * 0.5

  // High risk tolerance = more likely to voice dissent
  const shouldSpeak =
    personality.riskTolerance > 0.5 ||
    fusionContext.otherOSOpinions.length < 2 ||
    !fusionContext.currentConsensus

  // Verbosity affects reasoning depth
  let reasoningDepth: 'shallow' | 'moderate' | 'deep' = 'moderate'
  if (personality.verbosity < 0.4) reasoningDepth = 'shallow'
  if (personality.verbosity > 0.6) reasoningDepth = 'deep'

  return {
    shouldSpeak,
    agreementThreshold,
    reasoningDepth,
  }
}

/**
 * Apply evolved personality to cross-OS reasoning
 *
 * Affects:
 * - Willingness to defer to other OSs (confidence)
 * - Openness to alternative perspectives (empathy)
 * - Risk assessment (risk tolerance)
 */
export function applyPersonalityToCrossOSReasoning(
  personality: EvolvedOSPersonality,
  targetOS: string
): {
  deferenceLevel: number // 0-1, how much to defer to other OS
  openness: number // 0-1, willingness to consider alternative
  riskAssessment: 'conservative' | 'balanced' | 'aggressive'
} {
  // Low confidence = higher deference
  const deferenceLevel = 1 - personality.confidence

  // High empathy = high openness
  const openness = personality.empathy

  // Risk tolerance determines risk assessment
  let riskAssessment: 'conservative' | 'balanced' | 'aggressive' = 'balanced'
  if (personality.riskTolerance < 0.4) riskAssessment = 'conservative'
  if (personality.riskTolerance > 0.6) riskAssessment = 'aggressive'

  return {
    deferenceLevel,
    openness,
    riskAssessment,
  }
}

/**
 * Get personality drift summary for UI
 */
export function getPersonalityDriftSummary(
  personality: EvolvedOSPersonality
): {
  hasSignificantDrift: boolean
  driftDirections: string[]
  dominantShift: string
} {
  const SIGNIFICANT_DELTA = 0.1

  const hasSignificantDrift =
    Math.abs(personality.confidenceDelta) > SIGNIFICANT_DELTA ||
    Math.abs(personality.verbosityDelta) > SIGNIFICANT_DELTA ||
    Math.abs(personality.riskToleranceDelta) > SIGNIFICANT_DELTA ||
    Math.abs(personality.empathyDelta) > SIGNIFICANT_DELTA

  const driftDirections: string[] = []
  if (personality.confidenceDelta > SIGNIFICANT_DELTA) {
    driftDirections.push('more confident')
  } else if (personality.confidenceDelta < -SIGNIFICANT_DELTA) {
    driftDirections.push('less confident')
  }

  if (personality.verbosityDelta > SIGNIFICANT_DELTA) {
    driftDirections.push('more talkative')
  } else if (personality.verbosityDelta < -SIGNIFICANT_DELTA) {
    driftDirections.push('quieter')
  }

  if (personality.riskToleranceDelta > SIGNIFICANT_DELTA) {
    driftDirections.push('more bold')
  } else if (personality.riskToleranceDelta < -SIGNIFICANT_DELTA) {
    driftDirections.push('more cautious')
  }

  if (personality.empathyDelta > SIGNIFICANT_DELTA) {
    driftDirections.push('more empathetic')
  } else if (personality.empathyDelta < -SIGNIFICANT_DELTA) {
    driftDirections.push('less empathetic')
  }

  const dominantShift = driftDirections[0] || 'stable'

  return {
    hasSignificantDrift,
    driftDirections,
    dominantShift,
  }
}
