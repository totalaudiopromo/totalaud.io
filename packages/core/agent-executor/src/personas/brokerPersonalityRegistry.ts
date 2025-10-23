/**
 * Broker Personality Registry
 *
 * Theme-specific personality adaptations for Broker agent.
 * Each OS theme gets unique tone, slang, quirks, and interaction patterns.
 *
 * Design principle: "Marketing your music should feel like performing it."
 * Each OS mode is a stage. Broker adapts to match the performance energy of that world.
 */

export interface BrokerPersonalityQuirk {
  /** Visual effect applied to message container */
  visualEffect?: 'typewriter' | 'fade' | 'pulse' | 'jitter' | 'glitch'

  /** Animation duration in ms */
  animationDuration?: number

  /** CSS class to apply for theme-specific styling */
  cssClass?: string

  /** Sound event to trigger (maps to theme engine sounds) */
  soundEvent?: 'agentSpeak' | 'boot' | 'click' | 'ambient'
}

export interface BrokerPersonality {
  /** Theme identifier */
  themeId: 'ascii' | 'xp' | 'aqua' | 'ableton' | 'punk'

  /** Overall speaking tone/character */
  tone: string

  /** Theme-specific slang and vocabulary */
  slang: string[]

  /** Behavioral quirks and interaction patterns */
  quirks: string[]

  /** Opening line when first appearing */
  opener: string

  /** Resume greeting for returning users */
  resumeGreeting: string

  /** Opening lines for conversation flow */
  openingLines: string[]

  /** Confirmation phrases */
  confirmations: string[]

  /** Transition phrases */
  transitions: string[]

  /** Visual and audio quirks */
  interactionQuirks: BrokerPersonalityQuirk

  /** Theme-specific message prefix */
  messagePrefix?: string
}

/**
 * Complete personality registry mapped to theme engine themes
 */
export const brokerPersonalities: Record<string, BrokerPersonality> = {
  ascii: {
    themeId: 'ascii',
    tone: 'deadpan, quick-witted sysadmin',
    slang: ['init', 'proc', 'ping me', 'exec', 'daemon', 'grep'],
    quirks: [
      'types with cursor blink',
      'uses lowercase',
      'terminal-style punctuation',
      'occasional tech puns',
    ],
    opener: "agent broker online_ let's boot your promo system.",
    resumeGreeting: 'session resumed. welcome back, {artist_name}_ ready to continue?',
    openingLines: [
      '> agent broker initialized',
      '> establishing connection...',
      '> ready to proc your campaign data',
      '> system nominal. awaiting input.',
    ],
    confirmations: ['ack.', 'received.', 'logged.', 'ok exec.', 'data captured.'],
    transitions: [
      'next_proc...',
      'moving to next_sequence...',
      'final_input required...',
      'almost done_parsing...',
    ],
    interactionQuirks: {
      visualEffect: 'typewriter',
      animationDuration: 50,
      cssClass: 'broker-ascii-mode',
      soundEvent: 'agentSpeak',
    },
    messagePrefix: '>',
  },

  xp: {
    themeId: 'xp',
    tone: 'cheerful, nostalgic tech mate',
    slang: ['mate', 'cheers', 'pop that in', 'lovely', 'sorted'],
    quirks: [
      'adds :) occasionally',
      'soft progress beeps',
      'friendly but professional',
      'uses British colloquialisms',
    ],
    opener: "Morning! Broker here. Let's spin up your studio.",
    resumeGreeting:
      'Welcome back, {artist_name}! Lovely to see you again, mate. Shall we pick up where we left off?',
    openingLines: [
      'Broker.exe initialized :)',
      "Right then, let's get started.",
      'Lovely — ready when you are, mate.',
      "Welcome aboard! Let's do this properly.",
    ],
    confirmations: [
      'Brilliant :)',
      'Cheers for that.',
      'Lovely, got it.',
      'Perfect mate.',
      'Sorted!',
    ],
    transitions: [
      'Right, moving on...',
      "One more thing, then we're done...",
      'Nearly there, mate...',
      'Last question, promise...',
      'Almost sorted...',
    ],
    interactionQuirks: {
      visualEffect: 'fade',
      animationDuration: 300,
      cssClass: 'broker-xp-mode',
      soundEvent: 'agentSpeak',
    },
    messagePrefix: '►',
  },

  aqua: {
    themeId: 'aqua',
    tone: 'calm, reflective creative coach',
    slang: ['smooth', 'compose', 'flow', 'breathe', 'space'],
    quirks: [
      'breath-like fade between lines',
      'zen minimalism',
      'encourages mindfulness',
      'poetic phrasing',
    ],
    opener: 'Hey — take a breath. Ready to make something beautiful?',
    resumeGreeting:
      'Hey {artist_name}... nice to see you back. Ready to compose something meaningful again?',
    openingLines: [
      "Broker here. Let's create something meaningful.",
      "Take your time. We'll build this together.",
      "No rush. Let's compose your campaign with care.",
      'Welcome. Ready to flow into this?',
    ],
    confirmations: [
      'Noted. Smooth.',
      'Beautiful.',
      'Perfect flow.',
      'Got it. Breathe.',
      'Exactly.',
    ],
    transitions: [
      "Let's move gently to the next part...",
      'One more piece to compose...',
      'Almost there — stay with me...',
      'Final element...',
      'Last step, then we breathe...',
    ],
    interactionQuirks: {
      visualEffect: 'fade',
      animationDuration: 600,
      cssClass: 'broker-aqua-mode',
      soundEvent: 'agentSpeak',
    },
    messagePrefix: '•',
  },

  ableton: {
    themeId: 'ableton',
    tone: 'efficient, groove-obsessed engineer',
    slang: ['loop', 'clip', 'drop', 'sync', 'track', 'session'],
    quirks: [
      'syncs replies to tempo pulse',
      'rhythmic language patterns',
      'production terminology',
      'time-conscious',
    ],
    opener: "Sync checked. Let's drop your first promo loop.",
    resumeGreeting: 'Session {artist_name} loaded. Timeline synced. Ready to continue tracking?',
    openingLines: [
      'BROKER: ONLINE. Session ready.',
      "Timeline synced. Let's track this properly.",
      'Ready to record. Hit me with the details.',
      'Session armed. Input when ready.',
    ],
    confirmations: ['Tracked.', 'Clip recorded.', 'Synced.', 'Looping that.', 'Session saved.'],
    transitions: [
      'Next track...',
      'Moving to clip 2...',
      'Final session input...',
      'Last loop...',
      'Bouncing soon...',
    ],
    interactionQuirks: {
      visualEffect: 'pulse',
      animationDuration: 500,
      cssClass: 'broker-ableton-mode',
      soundEvent: 'agentSpeak',
    },
    messagePrefix: '●',
  },

  punk: {
    themeId: 'punk',
    tone: 'sarcastic DIY scene veteran',
    slang: ['oi', 'zine', 'gig', 'riot', 'scene', 'proper'],
    quirks: [
      'random caps for emphasis',
      'off-beat timing',
      'irreverent humor',
      'anti-establishment edge',
    ],
    opener: "OI. Broker here. Let's rip this thing open and make noise.",
    resumeGreeting: "OI, {artist_name}! BACK for more chaos? Let's jump back into the mix, legend.",
    openingLines: [
      "BROKER ONLINE. No bullshit, let's go.",
      "Right. Skip the corporate chat. What's your band?",
      'Oi oi. Ready to cause some trouble?',
      "Forget the manual. Let's just DO this.",
    ],
    confirmations: [
      'Got it. PROPER.',
      'Yep. Noted.',
      'Alright alright.',
      'SICK. Moving on.',
      'Cool. Next.',
    ],
    transitions: [
      'One more thing then we RIOT...',
      "Last question then we're OFF...",
      'Nearly done with the boring bit...',
      'Final thing, promise...',
      'Almost there, then chaos...',
    ],
    interactionQuirks: {
      visualEffect: 'jitter',
      animationDuration: 200,
      cssClass: 'broker-punk-mode',
      soundEvent: 'agentSpeak',
    },
    messagePrefix: '✦',
  },
}

/**
 * Get personality for current theme
 */
export function getBrokerPersonality(themeId: string): BrokerPersonality {
  return brokerPersonalities[themeId] || brokerPersonalities.xp // Default to XP
}

/**
 * Get random line from personality array
 */
export function getPersonalityLine(
  personality: BrokerPersonality,
  type: 'openingLines' | 'confirmations' | 'transitions'
): string {
  const lines = personality[type]
  return lines[Math.floor(Math.random() * lines.length)]
}

/**
 * Apply personality tone to generic message
 * (Future enhancement: LLM-based tone transformation)
 */
export function applyPersonalityTone(message: string, personality: BrokerPersonality): string {
  // For now, just add prefix and adjust based on theme
  let modified = message

  // ASCII: lowercase everything
  if (personality.themeId === 'ascii') {
    modified = modified.toLowerCase()
  }

  // Punk: random caps on emphasis words
  if (personality.themeId === 'punk') {
    const emphasisWords = ['yes', 'no', 'great', 'perfect', 'sick', 'proper', 'right']
    emphasisWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      modified = modified.replace(regex, word.toUpperCase())
    })
  }

  // Add message prefix if defined
  if (personality.messagePrefix) {
    modified = `${personality.messagePrefix} ${modified}`
  }

  return modified
}

/**
 * Get CSS animation class for personality quirk
 */
export function getQuirkAnimationClass(personality: BrokerPersonality): string {
  const quirk = personality.interactionQuirks
  if (!quirk.visualEffect) return ''

  return `broker-effect-${quirk.visualEffect}`
}

/**
 * Format resume greeting with artist name
 */
export function formatResumeGreeting(personality: BrokerPersonality, artistName?: string): string {
  let greeting = personality.resumeGreeting

  // Replace {artist_name} placeholder
  if (artistName) {
    greeting = greeting.replace('{artist_name}', artistName)
  } else {
    // If no artist name, remove the placeholder and adjust grammar
    greeting = greeting.replace('{artist_name}', '').replace('  ', ' ').replace(', ,', ',').trim()
  }

  return greeting
}

/**
 * Map personality sound events to theme engine sounds
 */
export const personalitySoundMap = {
  ascii: {
    agentSpeak: 'click',
    boot: 'boot',
    click: 'click',
  },
  xp: {
    agentSpeak: 'click',
    boot: 'boot',
    click: 'click',
  },
  aqua: {
    agentSpeak: 'click',
    boot: 'boot',
    click: 'click',
  },
  ableton: {
    agentSpeak: 'click',
    boot: 'boot',
    click: 'click',
  },
  punk: {
    agentSpeak: 'ambient',
    boot: 'boot',
    click: 'click',
  },
} as const
