/**
 * Tone System - Theme-Specific Micro-Copy
 *
 * Each theme speaks with its own personality through UI text.
 * Replaces generic messages with theme-appropriate language.
 */

export interface ToneProfile {
  confirm: string
  error: string
  loading: string
  complete: string
  empty: string
  saving: string
  saved: string
  deleting: string
  deleted: string
  welcome: string
  goodbye: string
}

export const toneSystem: Record<string, ToneProfile> = {
  ascii: {
    confirm: 'executed.',
    error: 'syntax error.',
    loading: 'processing...',
    complete: 'done.',
    empty: 'no data.',
    saving: 'writing...',
    saved: 'written.',
    deleting: 'erasing...',
    deleted: 'erased.',
    welcome: '> ready',
    goodbye: '> exit',
  },
  xp: {
    confirm: 'done!',
    error: 'oops…',
    loading: 'working on it...',
    complete: 'all done!',
    empty: 'nothing here yet',
    saving: 'saving...',
    saved: 'saved!',
    deleting: 'removing...',
    deleted: 'removed!',
    welcome: 'Welcome!',
    goodbye: 'See you soon!',
  },
  aqua: {
    confirm: 'all clear.',
    error: 'distorted signal.',
    loading: 'rendering...',
    complete: 'rendered.',
    empty: 'signal lost.',
    saving: 'compositing...',
    saved: 'composited.',
    deleting: 'dissolving...',
    deleted: 'dissolved.',
    welcome: 'signal acquired',
    goodbye: 'signal terminated',
  },
  daw: {
    confirm: 'track armed.',
    error: 'off-beat.',
    loading: 'buffering...',
    complete: 'exported.',
    empty: 'silence.',
    saving: 'recording...',
    saved: 'recorded.',
    deleting: 'muting...',
    deleted: 'muted.',
    welcome: 'session active',
    goodbye: 'session closed',
  },
  analogue: {
    confirm: 'recorded.',
    error: 'jammed tape.',
    loading: 'warming up...',
    complete: 'pressed.',
    empty: 'blank reel.',
    saving: 'printing...',
    saved: 'printed.',
    deleting: 'cutting...',
    deleted: 'cut.',
    welcome: 'tape rolling',
    goodbye: 'tape stopped',
  },
}

/**
 * Get tone message by theme and type
 */
export function getTone(themeName: string, messageType: keyof ToneProfile): string {
  const tone = toneSystem[themeName]
  if (!tone) return toneSystem.ascii[messageType]
  return tone[messageType]
}

/**
 * Format message with theme personality
 */
export function formatMessage(themeName: string, messageType: keyof ToneProfile, context?: string): string {
  const tone = getTone(themeName, messageType)

  if (context) {
    // Add context for certain themes
    switch (themeName) {
      case 'ascii':
        return `${tone} [${context}]`
      case 'daw':
        return `${tone} // ${context}`
      case 'analogue':
        return `${tone} (${context})`
      default:
        return `${tone} ${context}`
    }
  }

  return tone
}
