/**
 * useThemeLayout Hook
 *
 * Provides OS-specific layout configurations for the Studio environments.
 * Each OS has a distinct creative metaphor and interaction model.
 *
 * Phase 6: OS Studio Refactor
 */

import { useMemo } from 'react'

export type LayoutMode = 'terminal' | 'steps' | 'canvas' | 'timeline' | 'journal'
export type NodeVisibility = 'always' | 'hidden' | 'toggle' | 'segments'

export interface ThemeLayoutConfig {
  /** The primary layout mode for this OS */
  layout: LayoutMode

  /** How nodes are displayed in this environment */
  nodeVisibility: NodeVisibility

  /** Default state when entering this Studio */
  defaultState: 'active-input' | 'wizard' | 'overview' | 'tracks' | 'reflective'

  /** Creative metaphor for this environment */
  metaphor: string

  /** Primary interaction pattern */
  primaryInteraction: 'typing' | 'clicking' | 'dragging' | 'sequencing' | 'writing'

  /** Whether to show advanced tools by default */
  showAdvancedTools: boolean

  /** Ambient sound configuration */
  ambientSound: {
    enabled: boolean
    intensity: 'subtle' | 'medium' | 'immersive'
  }

  /** Motion and animation preferences */
  motion: {
    transitionSpeed: 'fast' | 'medium' | 'slow'
    enableParallax: boolean
    enableHoverEffects: boolean
  }

  /** Studio-specific UI elements */
  ui: {
    showConsoleShell: boolean
    showMissionPanel: boolean
    showFlowCanvas: boolean
    showTimeline: boolean
    showJournal: boolean
  }
}

const LAYOUT_CONFIGS: Record<string, ThemeLayoutConfig> = {
  ascii: {
    layout: 'terminal',
    nodeVisibility: 'always',
    defaultState: 'active-input',
    metaphor: 'Terminal Desk',
    primaryInteraction: 'typing',
    showAdvancedTools: true,
    ambientSound: {
      enabled: true,
      intensity: 'subtle',
    },
    motion: {
      transitionSpeed: 'fast',
      enableParallax: false,
      enableHoverEffects: true,
    },
    ui: {
      showConsoleShell: true,
      showMissionPanel: false,
      showFlowCanvas: true,
      showTimeline: false,
      showJournal: false,
    },
  },

  xp: {
    layout: 'steps',
    nodeVisibility: 'hidden',
    defaultState: 'wizard',
    metaphor: 'Guided Assistant',
    primaryInteraction: 'clicking',
    showAdvancedTools: false,
    ambientSound: {
      enabled: true,
      intensity: 'medium',
    },
    motion: {
      transitionSpeed: 'medium',
      enableParallax: true,
      enableHoverEffects: true,
    },
    ui: {
      showConsoleShell: false,
      showMissionPanel: true,
      showFlowCanvas: false,
      showTimeline: false,
      showJournal: false,
    },
  },

  aqua: {
    layout: 'canvas',
    nodeVisibility: 'always',
    defaultState: 'overview',
    metaphor: 'Visual Map',
    primaryInteraction: 'dragging',
    showAdvancedTools: true,
    ambientSound: {
      enabled: true,
      intensity: 'medium',
    },
    motion: {
      transitionSpeed: 'slow',
      enableParallax: true,
      enableHoverEffects: true,
    },
    ui: {
      showConsoleShell: false,
      showMissionPanel: true,
      showFlowCanvas: true,
      showTimeline: false,
      showJournal: false,
    },
  },

  daw: {
    layout: 'timeline',
    nodeVisibility: 'segments',
    defaultState: 'tracks',
    metaphor: 'Timeline',
    primaryInteraction: 'sequencing',
    showAdvancedTools: true,
    ambientSound: {
      enabled: true,
      intensity: 'immersive',
    },
    motion: {
      transitionSpeed: 'fast',
      enableParallax: false,
      enableHoverEffects: true,
    },
    ui: {
      showConsoleShell: false,
      showMissionPanel: true,
      showFlowCanvas: false,
      showTimeline: true,
      showJournal: false,
    },
  },

  analogue: {
    layout: 'journal',
    nodeVisibility: 'hidden',
    defaultState: 'reflective',
    metaphor: 'Journal',
    primaryInteraction: 'writing',
    showAdvancedTools: false,
    ambientSound: {
      enabled: true,
      intensity: 'subtle',
    },
    motion: {
      transitionSpeed: 'slow',
      enableParallax: true,
      enableHoverEffects: false,
    },
    ui: {
      showConsoleShell: false,
      showMissionPanel: false,
      showFlowCanvas: false,
      showTimeline: false,
      showJournal: true,
    },
  },
}

/**
 * Get the layout configuration for a specific OS theme
 */
export function useThemeLayout(theme: string): ThemeLayoutConfig {
  const config = useMemo(() => {
    return LAYOUT_CONFIGS[theme] || LAYOUT_CONFIGS.ascii
  }, [theme])

  return config
}

/**
 * Get all available layout modes
 */
export function getAvailableLayouts(): string[] {
  return Object.keys(LAYOUT_CONFIGS)
}

/**
 * Check if a theme supports a specific feature
 */
export function supportsFeature(theme: string, feature: keyof ThemeLayoutConfig['ui']): boolean {
  const config = LAYOUT_CONFIGS[theme] || LAYOUT_CONFIGS.ascii
  return config.ui[feature]
}
