/**
 * Theme Registry
 * Defines all theme manifests for TotalAud.io
 * All sounds are synthesized via Web Audio API - no copyrighted samples
 */

import type { ThemeManifest, ThemeId } from './types'

export const THEMES: Record<ThemeId, ThemeManifest> = {
  ascii: {
    id: 'ascii',
    name: 'ASCII Terminal',
    description: 'For those who mix code and caffeine',
    mood: '1980s hacker workstation meets modern synth',
    palette: {
      background: '#000000',
      foreground: '#00ff99',
      accent: '#1affb2',
      secondary: '#00cc77',
      border: '#00ff9933',
      success: '#00ff99',
      warning: '#ffff00',
      error: '#ff0066',
    },
    typography: {
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      monoFamily: '"JetBrains Mono", monospace',
      headingWeight: 700,
      bodyWeight: 400,
      lineHeight: 1.5,
    },
    textures: {
      overlay: '/textures/scanline.png',
      pattern: '/textures/noise-dark.png',
      opacity: 0.15,
    },
    motion: {
      intro: 'fade',
      transition: 'snap',
      duration: 200,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    sounds: {
      boot: {
        type: 'synth',
        waveform: 'square',
        frequency: 880,
        duration: 150,
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.05 },
      },
      click: {
        type: 'synth',
        waveform: 'sine',
        frequency: 1200,
        duration: 50,
        envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.01 },
      },
      agentSpeak: {
        type: 'synth',
        waveform: 'triangle',
        frequency: 440,
        duration: 100,
        envelope: { attack: 0.01, decay: 0.05, sustain: 0.2, release: 0.05 },
      },
      success: {
        type: 'synth',
        waveform: 'sine',
        frequency: 660,
        duration: 200,
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 },
      },
      error: {
        type: 'synth',
        waveform: 'sawtooth',
        frequency: 220,
        duration: 300,
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.1 },
      },
      ambient: {
        type: 'noise',
        noiseType: 'pink',
        duration: 60000,
      },
    },
    effects: {
      scanlines: true,
      noise: true,
      glow: true,
      vignette: false,
      grain: false,
    },
  },

  xp: {
    id: 'xp',
    name: 'Windows XP Studio',
    description: 'Mid-2000s nostalgia meets production polish',
    mood: 'Plastic pop optimism',
    palette: {
      background: '#d7e8ff',
      foreground: '#1a1a1a',
      accent: '#3478f6',
      secondary: '#dbeaff',
      border: '#9ec9f5',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
    },
    typography: {
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      monoFamily: '"Consolas", monospace',
      headingWeight: 600,
      bodyWeight: 400,
      lineHeight: 1.6,
    },
    textures: {
      overlay: '/textures/plastic-gloss.png',
      opacity: 0.2,
    },
    motion: {
      intro: 'bounce',
      transition: 'elastic',
      duration: 300,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    sounds: {
      boot: {
        type: 'synth',
        waveform: 'sine',
        frequency: 523.25, // C5
        duration: 400,
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.3 },
      },
      click: {
        type: 'synth',
        waveform: 'sine',
        frequency: 800,
        duration: 80,
        envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.02 },
      },
      agentSpeak: {
        type: 'synth',
        waveform: 'triangle',
        frequency: 600,
        duration: 150,
        envelope: { attack: 0.02, decay: 0.08, sustain: 0.3, release: 0.1 },
      },
      success: {
        type: 'synth',
        waveform: 'sine',
        frequency: 784, // G5
        duration: 250,
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.2, release: 0.15 },
      },
      error: {
        type: 'synth',
        waveform: 'square',
        frequency: 200,
        duration: 400,
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.2 },
      },
    },
    effects: {
      scanlines: false,
      noise: false,
      glow: false,
      vignette: false,
      grain: false,
    },
  },

  aqua: {
    id: 'aqua',
    name: 'Mac OS Retro',
    description: 'Brushed metal minimalism',
    mood: 'Reflective silver + soft light',
    palette: {
      background: '#e5e7eb',
      foreground: '#1f2937',
      accent: '#3b82f6',
      secondary: '#94a3b8',
      border: '#cbd5e1',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    typography: {
      fontFamily: '-apple-system, "SF Pro Display", system-ui, sans-serif',
      monoFamily: '"SF Mono", "Menlo", monospace',
      headingWeight: 500,
      bodyWeight: 400,
      lineHeight: 1.7,
    },
    textures: {
      overlay: '/textures/brushed-metal.png',
      opacity: 0.25,
    },
    motion: {
      intro: 'fade',
      transition: 'smooth',
      duration: 400,
      easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    },
    sounds: {
      boot: {
        type: 'synth',
        waveform: 'sine',
        frequency: 880, // A5
        duration: 600,
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.2, release: 0.4 },
      },
      click: {
        type: 'synth',
        waveform: 'triangle',
        frequency: 1000,
        duration: 60,
        envelope: { attack: 0.002, decay: 0.03, sustain: 0, release: 0.01 },
      },
      agentSpeak: {
        type: 'synth',
        waveform: 'sine',
        frequency: 523.25, // C5
        duration: 120,
        envelope: { attack: 0.03, decay: 0.06, sustain: 0.25, release: 0.08 },
      },
      success: {
        type: 'synth',
        waveform: 'sine',
        frequency: 1046.5, // C6
        duration: 300,
        envelope: { attack: 0.03, decay: 0.15, sustain: 0.15, release: 0.2 },
      },
      error: {
        type: 'synth',
        waveform: 'triangle',
        frequency: 185,
        duration: 350,
        envelope: { attack: 0.02, decay: 0.12, sustain: 0.25, release: 0.18 },
      },
    },
    effects: {
      scanlines: false,
      noise: false,
      glow: true,
      vignette: true,
      grain: false,
    },
  },

  ableton: {
    id: 'ableton',
    name: 'Ableton Mode',
    description: 'Flow like a DAW',
    mood: 'Dark grid studio precision',
    palette: {
      background: '#111111',
      foreground: '#e0e0e0',
      accent: '#ff8000',
      secondary: '#2a2a2a',
      border: '#3a3a3a',
      success: '#00ff87',
      warning: '#ffd700',
      error: '#ff3366',
    },
    typography: {
      fontFamily: '"Inter", "Helvetica Neue", sans-serif',
      monoFamily: '"IBM Plex Mono", monospace',
      headingWeight: 600,
      bodyWeight: 400,
      lineHeight: 1.5,
    },
    textures: {
      pattern: 'grid',
      opacity: 0.1,
    },
    motion: {
      intro: 'pulse',
      transition: 'snap',
      duration: 150,
      easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
    sounds: {
      boot: {
        type: 'synth',
        waveform: 'square',
        frequency: 220, // A3
        duration: 100,
        envelope: { attack: 0.001, decay: 0.05, sustain: 0.1, release: 0.05 },
      },
      click: {
        type: 'synth',
        waveform: 'sine',
        frequency: 2000,
        duration: 30,
        envelope: { attack: 0.001, decay: 0.01, sustain: 0, release: 0.01 },
      },
      agentSpeak: {
        type: 'synth',
        waveform: 'square',
        frequency: 330,
        duration: 80,
        envelope: { attack: 0.005, decay: 0.04, sustain: 0.15, release: 0.04 },
      },
      success: {
        type: 'synth',
        waveform: 'triangle',
        frequency: 880,
        duration: 150,
        envelope: { attack: 0.005, decay: 0.08, sustain: 0.1, release: 0.08 },
      },
      error: {
        type: 'synth',
        waveform: 'sawtooth',
        frequency: 165,
        duration: 250,
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.1 },
      },
    },
    effects: {
      scanlines: false,
      noise: false,
      glow: false,
      vignette: false,
      grain: true,
    },
  },

  punk: {
    id: 'punk',
    name: 'Punk Zine Mode',
    description: 'Cut-and-paste rebellion',
    mood: 'DIY xerox chaos',
    palette: {
      background: '#0f0f0f',
      foreground: '#ffffff',
      accent: '#ff1aff',
      secondary: '#ffff00',
      border: '#ff1aff',
      success: '#00ff00',
      warning: '#ff8800',
      error: '#ff0000',
    },
    typography: {
      fontFamily: '"Anton", "Impact", sans-serif',
      monoFamily: '"Courier New", monospace',
      headingWeight: 900,
      bodyWeight: 700,
      lineHeight: 1.3,
    },
    textures: {
      overlay: '/textures/xerox-grit.png',
      pattern: '/textures/torn-paper.png',
      opacity: 0.3,
    },
    motion: {
      intro: 'jitter',
      transition: 'snap',
      duration: 100,
      easing: 'steps(3, jump-both)',
    },
    sounds: {
      boot: {
        type: 'noise',
        noiseType: 'white',
        duration: 200,
        envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.05 },
      },
      click: {
        type: 'synth',
        waveform: 'square',
        frequency: 1500,
        duration: 40,
        envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.01 },
      },
      agentSpeak: {
        type: 'noise',
        noiseType: 'pink',
        duration: 120,
        envelope: { attack: 0.01, decay: 0.05, sustain: 0.1, release: 0.05 },
      },
      success: {
        type: 'synth',
        waveform: 'sawtooth',
        frequency: 1320,
        duration: 180,
        envelope: { attack: 0.01, decay: 0.08, sustain: 0.1, release: 0.08 },
      },
      error: {
        type: 'noise',
        noiseType: 'white',
        duration: 300,
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.15, release: 0.1 },
      },
      ambient: {
        type: 'noise',
        noiseType: 'brown',
        duration: 60000,
      },
    },
    effects: {
      scanlines: false,
      noise: true,
      glow: false,
      vignette: true,
      grain: true,
    },
  },
}

export const THEME_IDS: ThemeId[] = ['ascii', 'xp', 'aqua', 'ableton', 'punk']

export function getTheme(id: ThemeId): ThemeManifest {
  return THEMES[id]
}

export function getAllThemes(): ThemeManifest[] {
  return THEME_IDS.map((id) => THEMES[id])
}
