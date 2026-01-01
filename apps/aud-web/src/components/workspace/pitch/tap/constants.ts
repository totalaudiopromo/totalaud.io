import type { TAPTone } from '@/stores/usePitchStore'

export const TONE_OPTIONS: { value: TAPTone; label: string; description: string }[] = [
  {
    value: 'casual',
    label: 'Casual',
    description: 'Friendly and conversational',
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Polished and industry-standard',
  },
  {
    value: 'enthusiastic',
    label: 'Enthusiastic',
    description: 'Energetic and passionate',
  },
]
