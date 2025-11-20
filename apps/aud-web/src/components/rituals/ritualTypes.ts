'use client'

import type { OSSlug } from '@/components/os/navigation/OSMetadata'

export type RitualId =
  | 'review_loop'
  | 'idea_spark'
  | 'pitch_polish'
  | 'micro_promo'
  | 'reflect'
  | 'plan_day'
  | 'loop_constellation'
  | 'a_and_r_lens'

export interface Ritual {
  id: RitualId
  title: string
  description: string
  os: OSSlug
  weight: number
}
