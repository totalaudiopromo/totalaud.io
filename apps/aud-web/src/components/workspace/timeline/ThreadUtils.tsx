import React from 'react'
import { ThreadType } from '@/stores/useSignalThreadStore'

export const THREAD_TYPES: {
  key: ThreadType
  label: string
  iconType: 'book' | 'target' | 'sparkle' | 'mic' | 'chart'
  description: string
}[] = [
  {
    key: 'narrative',
    label: 'Story Arc',
    iconType: 'book',
    description: 'The story of your release journey',
  },
  {
    key: 'campaign',
    label: 'Campaign',
    iconType: 'target',
    description: 'Linked promotional activities',
  },
  {
    key: 'creative',
    label: 'Creative',
    iconType: 'sparkle',
    description: 'Related creative outputs',
  },
  {
    key: 'scene',
    label: 'Scene',
    iconType: 'mic',
    description: 'Live performance connections',
  },
  {
    key: 'performance',
    label: 'Performance',
    iconType: 'chart',
    description: 'Analytics and results',
  },
]

export const THREAD_COLOURS = [
  '#3AA9BE', // Slate Cyan (default)
  '#F472B6', // Pink
  '#A78BFA', // Purple
  '#34D399', // Green
  '#FBBF24', // Yellow
  '#FB923C', // Orange
  '#F87171', // Red
  '#60A5FA', // Blue
]

export function assertUnreachable(x: never): never {
  throw new Error(`Exhaustiveness check failed: ${x}`)
}

export function ThreadIcon({
  type,
  size = 16,
}: {
  type: 'book' | 'target' | 'sparkle' | 'mic' | 'chart'
  size?: number
}) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (type) {
    case 'book':
      return (
        <svg {...props}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    case 'target':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      )
    case 'sparkle':
      return (
        <svg {...props}>
          <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
        </svg>
      )
    case 'mic':
      return (
        <svg {...props}>
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      )
    case 'chart':
      return (
        <svg {...props}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    default:
      return assertUnreachable(type)
  }
}
