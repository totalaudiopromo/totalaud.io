/**
 * useOperatorPersonality Hook
 * Phase 14.3: Adaptive personality system
 *
 * Maps campaign goal to Operator's tone, sound, and visual accent.
 * Affects ambient audio frequency, background pulse colour, and messaging style.
 */

'use client'

import { useMemo } from 'react'

export type CampaignGoal = 'radio' | 'playlist' | 'press' | 'growth' | 'experiment'

export interface OperatorPersonality {
  goal: CampaignGoal
  tone: string
  soundFrequency: number
  soundType: OscillatorType
  accentColour: string
  pulseIntensity: number
}

const PERSONALITY_MAP: Record<CampaignGoal, OperatorPersonality> = {
  radio: {
    goal: 'radio',
    tone: 'analytical',
    soundFrequency: 880, // A5 - precise, technical
    soundType: 'square',
    accentColour: '#3AA9BE', // Slate Cyan
    pulseIntensity: 0.6,
  },
  playlist: {
    goal: 'playlist',
    tone: 'upbeat',
    soundFrequency: 1320, // E6 - bright, energetic
    soundType: 'triangle',
    accentColour: '#89DFF3', // Aqua
    pulseIntensity: 0.8,
  },
  press: {
    goal: 'press',
    tone: 'calm',
    soundFrequency: 660, // E5 - steady, professional
    soundType: 'sine',
    accentColour: '#B0BEC5', // Ice Grey
    pulseIntensity: 0.4,
  },
  growth: {
    goal: 'growth',
    tone: 'energetic',
    soundFrequency: 880, // A5 - driving, rhythmic
    soundType: 'sawtooth',
    accentColour: '#51CF66', // Neon Mint (success colour)
    pulseIntensity: 0.9,
  },
  experiment: {
    goal: 'experiment',
    tone: 'curious',
    soundFrequency: 440, // A4 - exploratory, open
    soundType: 'sine', // Will add noise in audio layer
    accentColour: '#C678DD', // Magenta wash
    pulseIntensity: 0.7,
  },
}

interface UseOperatorPersonalityOptions {
  goal?: CampaignGoal
}

/**
 * useOperatorPersonality
 *
 * Returns personality configuration based on campaign goal
 */
export function useOperatorPersonality({ goal = 'radio' }: UseOperatorPersonalityOptions = {}) {
  const personality = useMemo(() => {
    return PERSONALITY_MAP[goal]
  }, [goal])

  return {
    personality,
    getAllPersonalities: () => PERSONALITY_MAP,
    getPersonalityForGoal: (targetGoal: CampaignGoal) => PERSONALITY_MAP[targetGoal],
  }
}

/**
 * Generate personality message based on goal
 */
export function getPersonalityMessage(goal: CampaignGoal, artist: string): string {
  const messages: Record<CampaignGoal, string> = {
    radio: `analysing radio landscape for ${artist}. scanning uk stations…`,
    playlist: `optimising playlist strategy for ${artist}. identifying curators…`,
    press: `building press narrative for ${artist}. researching publications…`,
    growth: `accelerating audience growth for ${artist}. mapping social channels…`,
    experiment: `exploring new opportunities for ${artist}. testing hypotheses…`,
  }

  return messages[goal]
}
