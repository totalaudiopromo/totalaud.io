import { PitchType } from '@/stores/usePitchStore'

export const PITCH_TYPES: { key: PitchType; label: string; description: string }[] = [
  {
    key: 'radio',
    label: 'Radio Pitch',
    description: 'For BBC Radio 1, 6 Music, specialist shows',
  },
  {
    key: 'press',
    label: 'Press Release',
    description: 'For music blogs, magazines, and media outlets',
  },
  {
    key: 'playlist',
    label: 'Playlist Pitch',
    description: 'For Spotify editorial and curator submissions',
  },
  {
    key: 'custom',
    label: 'Custom Pitch',
    description: 'Start from scratch with helpful prompts',
  },
]
