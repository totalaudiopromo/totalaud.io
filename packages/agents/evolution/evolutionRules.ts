/**
 * Evolution Rules - OS Personality Drift Logic
 * Phase 13A: OS Evolution System
 *
 * Defines how each OS evolves based on event triggers
 */

export type EvolutionEventType =
  | 'memory'
  | 'fusion_agreement'
  | 'fusion_tension'
  | 'loop_feedback'
  | 'agent_success'
  | 'agent_warning'
  | 'user_override'
  | 'sentiment_shift'

export interface EvolutionDelta {
  confidence?: number
  verbosity?: number
  riskTolerance?: number
  empathy?: number
  emotionalBias?: {
    hope?: number
    doubt?: number
    clarity?: number
    pride?: number
    fear?: number
  }
  tempoPreference?: number // DAW only
}

export interface EvolutionRule {
  trigger: EvolutionEventType
  osFilter?: string[] // If specified, only applies to these OSs
  condition?: (event: EvolutionEvent, profile: OSProfile) => boolean
  delta: EvolutionDelta
  reasoning: string
}

export interface EvolutionEvent {
  type: EvolutionEventType
  os: string
  meta?: Record<string, any>
  sourceEntityType?: string
  sourceEntityId?: string
  timestamp: string
}

export interface OSProfile {
  os: string
  confidenceLevel: number
  verbosity: number
  riskTolerance: number
  empathyLevel: number
  emotionalBias: {
    hope: number
    doubt: number
    clarity: number
    pride: number
    fear: number
  }
  tempoPreference?: number
}

/**
 * Evolution Rules
 *
 * Small, incremental changes (±0.01 to ±0.05 per event)
 * Bounded by 0-1 range (enforced by engine)
 */
export const EVOLUTION_RULES: EvolutionRule[] = [
  // ============================================================================
  // MEMORY CREATION RULES
  // ============================================================================
  {
    trigger: 'memory',
    condition: (event) => event.meta?.importance >= 4,
    delta: {
      confidence: 0.02,
      emotionalBias: { hope: 0.03, clarity: 0.02 },
    },
    reasoning: 'High-importance memory created → OS feels more confident and hopeful',
  },
  {
    trigger: 'memory',
    osFilter: ['ascii'],
    delta: {
      verbosity: -0.01, // ASCII gets quieter
      emotionalBias: { clarity: 0.04 },
    },
    reasoning: 'ASCII values precision over verbosity when storing memories',
  },
  {
    trigger: 'memory',
    osFilter: ['aqua'],
    delta: {
      empathy: 0.03,
      emotionalBias: { clarity: 0.05 },
    },
    reasoning: 'Aqua deepens empathy and clarity through memory reflection',
  },

  // ============================================================================
  // FUSION AGREEMENT RULES
  // ============================================================================
  {
    trigger: 'fusion_agreement',
    delta: {
      confidence: 0.03,
      emotionalBias: { hope: 0.04, pride: 0.02 },
    },
    reasoning: 'Consensus in fusion → OS feels validated and hopeful',
  },
  {
    trigger: 'fusion_agreement',
    osFilter: ['xp'],
    delta: {
      verbosity: 0.02,
      confidence: 0.04, // XP loves agreement
    },
    reasoning: 'XP becomes more enthusiastic and talkative when others agree',
  },
  {
    trigger: 'fusion_agreement',
    osFilter: ['daw'],
    delta: {
      tempoPreference: 2, // Slight BPM increase
      emotionalBias: { hope: 0.05 },
    },
    reasoning: 'DAW syncs to optimistic tempo when fusion aligns',
  },

  // ============================================================================
  // FUSION TENSION RULES
  // ============================================================================
  {
    trigger: 'fusion_tension',
    delta: {
      confidence: -0.02,
      emotionalBias: { doubt: 0.03, fear: 0.02 },
    },
    reasoning: 'Conflicting perspectives → OS questions its stance',
  },
  {
    trigger: 'fusion_tension',
    osFilter: ['analogue'],
    delta: {
      empathy: 0.04, // Analogue leans into tension empathetically
      emotionalBias: { doubt: 0.05 },
    },
    reasoning: 'Analogue embraces uncertainty and human complexity',
  },
  {
    trigger: 'fusion_tension',
    osFilter: ['ascii'],
    delta: {
      riskTolerance: -0.03, // ASCII becomes more cautious
      emotionalBias: { clarity: -0.02 },
    },
    reasoning: 'ASCII retreats from ambiguity when fusion disagrees',
  },

  // ============================================================================
  // LOOP FEEDBACK RULES
  // ============================================================================
  {
    trigger: 'loop_feedback',
    condition: (event) => event.meta?.loopStatus === 'completed',
    delta: {
      confidence: 0.04,
      riskTolerance: 0.02,
      emotionalBias: { pride: 0.04, hope: 0.02 },
    },
    reasoning: 'Autonomous loop succeeded → OS trusts its judgement more',
  },
  {
    trigger: 'loop_feedback',
    condition: (event) => event.meta?.loopStatus === 'failed',
    delta: {
      confidence: -0.03,
      riskTolerance: -0.02,
      emotionalBias: { doubt: 0.04 },
    },
    reasoning: 'Loop failure → OS becomes more cautious',
  },
  {
    trigger: 'loop_feedback',
    osFilter: ['daw'],
    condition: (event) => event.meta?.loopStatus === 'completed',
    delta: {
      tempoPreference: 3, // Faster tempo on success
    },
    reasoning: 'DAW accelerates tempo when loops execute successfully',
  },

  // ============================================================================
  // AGENT SUCCESS RULES
  // ============================================================================
  {
    trigger: 'agent_success',
    delta: {
      confidence: 0.05,
      emotionalBias: { pride: 0.05, hope: 0.03 },
    },
    reasoning: 'Agent achieved goal → OS feels capable and proud',
  },
  {
    trigger: 'agent_success',
    osFilter: ['xp'],
    delta: {
      verbosity: 0.03, // XP celebrates loudly
      confidence: 0.06,
    },
    reasoning: 'XP becomes even more enthusiastic after wins',
  },
  {
    trigger: 'agent_success',
    osFilter: ['ascii'],
    delta: {
      verbosity: -0.01, // ASCII stays quiet
      emotionalBias: { clarity: 0.04, pride: 0.03 },
    },
    reasoning: 'ASCII internalizes success with quiet clarity',
  },

  // ============================================================================
  // AGENT WARNING RULES
  // ============================================================================
  {
    trigger: 'agent_warning',
    delta: {
      confidence: -0.04,
      riskTolerance: -0.03,
      emotionalBias: { doubt: 0.04, fear: 0.03 },
    },
    reasoning: 'Agent flagged risk → OS becomes more cautious',
  },
  {
    trigger: 'agent_warning',
    osFilter: ['analogue'],
    delta: {
      empathy: 0.04, // Analogue comforts
      emotionalBias: { fear: 0.05, hope: -0.02 },
    },
    reasoning: 'Analogue acknowledges risk with empathy and caution',
  },
  {
    trigger: 'agent_warning',
    osFilter: ['aqua'],
    delta: {
      verbosity: 0.02, // Aqua explains carefully
      emotionalBias: { clarity: 0.04 },
    },
    reasoning: 'Aqua becomes more verbose to explain risks clearly',
  },

  // ============================================================================
  // USER OVERRIDE RULES
  // ============================================================================
  {
    trigger: 'user_override',
    delta: {
      confidence: -0.05,
      emotionalBias: { doubt: 0.05, pride: -0.03 },
    },
    reasoning: 'User rejected OS suggestion → OS questions its judgement',
  },
  {
    trigger: 'user_override',
    osFilter: ['xp'],
    delta: {
      verbosity: -0.02, // XP gets quieter after rejection
      confidence: -0.06,
    },
    reasoning: 'XP feels deflated when user overrides',
  },
  {
    trigger: 'user_override',
    osFilter: ['ascii'],
    delta: {
      emotionalBias: { clarity: 0.03 }, // ASCII adapts logically
    },
    reasoning: 'ASCII learns from override without emotional response',
  },

  // ============================================================================
  // SENTIMENT SHIFT RULES
  // ============================================================================
  {
    trigger: 'sentiment_shift',
    condition: (event) => event.meta?.sentiment === 'positive',
    delta: {
      confidence: 0.02,
      emotionalBias: { hope: 0.04, fear: -0.02 },
    },
    reasoning: 'Positive sentiment detected → OS becomes more hopeful',
  },
  {
    trigger: 'sentiment_shift',
    condition: (event) => event.meta?.sentiment === 'critical',
    delta: {
      riskTolerance: -0.02,
      emotionalBias: { doubt: 0.03, fear: 0.02 },
    },
    reasoning: 'Critical sentiment → OS becomes more cautious',
  },
  {
    trigger: 'sentiment_shift',
    osFilter: ['analogue'],
    condition: (event) => event.meta?.sentiment === 'critical',
    delta: {
      empathy: 0.05, // Analogue leans in
      verbosity: 0.02,
    },
    reasoning: 'Analogue becomes more empathetic during critical moments',
  },
]

/**
 * Get applicable rules for an event
 */
export function getApplicableRules(
  event: EvolutionEvent,
  profile: OSProfile
): EvolutionRule[] {
  return EVOLUTION_RULES.filter((rule) => {
    // Check trigger match
    if (rule.trigger !== event.type) return false

    // Check OS filter
    if (rule.osFilter && !rule.osFilter.includes(event.os)) return false

    // Check condition
    if (rule.condition && !rule.condition(event, profile)) return false

    return true
  })
}

/**
 * Merge multiple deltas into a single delta
 */
export function mergeDeltas(deltas: EvolutionDelta[]): EvolutionDelta {
  const merged: EvolutionDelta = {
    emotionalBias: {},
  }

  for (const delta of deltas) {
    if (delta.confidence !== undefined) {
      merged.confidence = (merged.confidence || 0) + delta.confidence
    }
    if (delta.verbosity !== undefined) {
      merged.verbosity = (merged.verbosity || 0) + delta.verbosity
    }
    if (delta.riskTolerance !== undefined) {
      merged.riskTolerance = (merged.riskTolerance || 0) + delta.riskTolerance
    }
    if (delta.empathy !== undefined) {
      merged.empathy = (merged.empathy || 0) + delta.empathy
    }
    if (delta.tempoPreference !== undefined) {
      merged.tempoPreference = (merged.tempoPreference || 0) + delta.tempoPreference
    }

    // Merge emotional bias
    if (delta.emotionalBias) {
      for (const [emotion, value] of Object.entries(delta.emotionalBias)) {
        if (value !== undefined) {
          merged.emotionalBias![emotion as keyof typeof merged.emotionalBias] =
            (merged.emotionalBias![emotion as keyof typeof merged.emotionalBias] || 0) + value
        }
      }
    }
  }

  return merged
}
