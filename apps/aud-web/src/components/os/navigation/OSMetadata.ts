'use client'

export type OSSlug = 'core' | 'studio' | 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue'

export type TransitionType = 'fade' | 'zoom' | 'slide' | null

export interface OSConfig {
  name: string
  slug: OSSlug
  color: string
  enterSound?: 'success' | 'click'
  exitSound?: 'click'
  startupAnimation?: 'fade' | 'zoom' | 'tilt'
}

export const OS_ORDER: OSSlug[] = ['core', 'studio', 'ascii', 'xp', 'aqua', 'daw', 'analogue']

export const OS_CONFIGS: OSConfig[] = [
  {
    name: 'Core OS',
    slug: 'core',
    color: '#22c55e',
    enterSound: 'success',
    exitSound: 'click',
    startupAnimation: 'zoom',
  },
  {
    name: 'Loop Studio',
    slug: 'studio',
    color: '#22c55e',
    enterSound: 'success',
    exitSound: 'click',
    startupAnimation: 'zoom',
  },
  {
    name: 'ASCII OS',
    slug: 'ascii',
    color: '#22c55e',
    enterSound: 'success',
    exitSound: 'click',
    startupAnimation: 'fade',
  },
  {
    name: 'XP OS',
    slug: 'xp',
    color: '#3b82f6',
    enterSound: 'success',
    exitSound: 'click',
    startupAnimation: 'zoom',
  },
  {
    name: 'Aqua OS',
    slug: 'aqua',
    color: '#22d3ee',
    enterSound: 'success',
    exitSound: 'click',
    startupAnimation: 'zoom',
  },
  {
    name: 'DAW OS',
    slug: 'daw',
    color: '#a855f7',
    enterSound: 'success',
    exitSound: 'click',
    startupAnimation: 'tilt',
  },
  {
    name: 'Analogue OS',
    slug: 'analogue',
    color: '#f59e0b',
    enterSound: 'success',
    exitSound: 'click',
    startupAnimation: 'tilt',
  },
]

export const OS_CONFIG_MAP: Record<OSSlug, OSConfig> = OS_CONFIGS.reduce(
  (acc, config) => {
    acc[config.slug] = config
    return acc
  },
  {} as Record<OSSlug, OSConfig>,
)

export const DEFAULT_OS_SLUG: OSSlug = 'ascii'

export const DEFAULT_OS_CONFIG: OSConfig = OS_CONFIG_MAP[DEFAULT_OS_SLUG]

export function getOSConfig(slug: OSSlug): OSConfig {
  return OS_CONFIG_MAP[slug] ?? DEFAULT_OS_CONFIG
}


