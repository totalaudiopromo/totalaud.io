import type { ThreadType } from '@/stores/useSignalThreadStore'

export const THREAD_TYPES: { key: ThreadType; label: string; icon: string; description: string }[] =
  [
    {
      key: 'narrative',
      label: 'Story Arc',
      icon: '\u{1F4D6}',
      description: 'The story of your release journey',
    },
    {
      key: 'campaign',
      label: 'Campaign',
      icon: '\u{1F3AF}',
      description: 'Linked promotional activities',
    },
    {
      key: 'creative',
      label: 'Creative',
      icon: '\u2728',
      description: 'Related creative outputs',
    },
    {
      key: 'scene',
      label: 'Scene',
      icon: '\u{1F3A4}',
      description: 'Live performance connections',
    },
    {
      key: 'performance',
      label: 'Performance',
      icon: '\u{1F4CA}',
      description: 'Analytics and results',
    },
  ]

export const THREAD_COLOURS = [
  '#3AA9BE',
  '#F472B6',
  '#A78BFA',
  '#34D399',
  '#FBBF24',
  '#FB923C',
  '#F87171',
  '#60A5FA',
]
