export type OSTheme = 'ascii' | 'xp' | 'aqua' | 'ableton' | 'punk'

export interface ThemeConfig {
  id: OSTheme
  name: string
  displayName: string
  description: string
  tagline: string
  
  // Visual
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    border: string
  }
  
  // Typography
  fontFamily: string
  
  // Effects
  textures: {
    overlay: string
    pattern?: string
  }
  
  // Audio
  sounds: {
    boot: string
    ambient?: string
    click: string
  }
  
  // Special features
  effects?: {
    scanlines?: boolean
    reflections?: boolean
    noise?: boolean
    halftone?: boolean
    glow?: boolean
  }
}

export const THEME_CONFIGS: Record<OSTheme, ThemeConfig> = {
  ascii: {
    id: 'ascii',
    name: 'ASCII Terminal',
    displayName: 'ASCII TERMINAL',
    description: 'For those who mix code and caffeine',
    tagline: 'Pure text. Pure focus.',
    colors: {
      primary: '#00ff00',
      secondary: '#00cc00',
      accent: '#00ff00',
      background: '#0a0a0a',
      text: '#00ff00',
      border: '#00ff00'
    },
    fontFamily: '"JetBrains Mono", "Courier New", monospace',
    textures: {
      overlay: 'crt-scanlines',
      pattern: 'terminal-noise'
    },
    sounds: {
      boot: 'beep-sequence',
      ambient: 'typing-soft',
      click: 'mechanical-key'
    },
    effects: {
      scanlines: true,
      noise: true
    }
  },
  
  xp: {
    id: 'xp',
    name: 'Windows XP Studio',
    displayName: 'WINDOWS XP STUDIO',
    description: 'Nostalgic productivity at its finest',
    tagline: 'Loading VSTs...',
    colors: {
      primary: '#0078d7',
      secondary: '#69b3f7',
      accent: '#ffd700',
      background: '#ece9d8',
      text: '#000000',
      border: '#0078d7'
    },
    fontFamily: '"Segoe UI", Tahoma, sans-serif',
    textures: {
      overlay: 'plastic-gloss',
      pattern: 'gui-reflections'
    },
    sounds: {
      boot: 'xp-startup',
      click: 'xp-click'
    },
    effects: {
      reflections: true,
      glow: true
    }
  },
  
  aqua: {
    id: 'aqua',
    name: 'Mac OS Retro',
    displayName: 'MAC OS RETRO (2001)',
    description: 'When design was an art form',
    tagline: 'Think different. Sound different.',
    colors: {
      primary: '#4a90e2',
      secondary: '#7fb8f0',
      accent: '#ffffff',
      background: '#e8e8e8',
      text: '#333333',
      border: '#999999'
    },
    fontFamily: '"Lucida Grande", system-ui, sans-serif',
    textures: {
      overlay: 'brushed-metal',
      pattern: 'aqua-reflection'
    },
    sounds: {
      boot: 'mac-chime',
      ambient: 'vinyl-hiss',
      click: 'aqua-pop'
    },
    effects: {
      reflections: true,
      glow: true
    }
  },
  
  ableton: {
    id: 'ableton',
    name: 'Ableton Mode',
    displayName: 'ABLETON MODE',
    description: 'Flow like a DAW',
    tagline: 'Arrange. Produce. Promote.',
    colors: {
      primary: '#ff764d',
      secondary: '#ffb84d',
      accent: '#ff764d',
      background: '#1a1a1a',
      text: '#cccccc',
      border: '#333333'
    },
    fontFamily: '"Inter", -apple-system, sans-serif',
    textures: {
      overlay: 'paper-noise',
      pattern: 'waveform-subtle'
    },
    sounds: {
      boot: 'sequencer-start',
      ambient: 'synth-pad',
      click: 'clip-trigger'
    },
    effects: {
      noise: true
    }
  },
  
  punk: {
    id: 'punk',
    name: 'Punk Zine Mode',
    displayName: 'PUNK ZINE MODE',
    description: 'Cut. Paste. Shout.',
    tagline: 'No rules. All attitude.',
    colors: {
      primary: '#ff00ff',
      secondary: '#00ffff',
      accent: '#ff00ff',
      background: '#0a0a0a',
      text: '#f5f5f5',
      border: '#ff00ff'
    },
    fontFamily: '"JetBrains Mono", "Arial Narrow", monospace',
    textures: {
      overlay: 'xerox-grit',
      pattern: 'torn-paper'
    },
    sounds: {
      boot: 'tape-start',
      ambient: 'tape-hiss',
      click: 'stamp-press'
    },
    effects: {
      halftone: true,
      noise: true
    }
  }
}

