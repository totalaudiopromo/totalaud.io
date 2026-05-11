// How it works steps - Vision aligned
export const HOW_IT_WORKS = [
  {
    title: 'Upload',
    detail: "Upload a track you're preparing to release.",
  },
  {
    title: 'Choose a perspective',
    detail: 'Get finishing notes from a producer, listener, mix engineer, or industry lens.',
  },
  {
    title: 'Understand what matters',
    detail: 'Honest notes on arrangement, energy, clarity, and release readiness.',
  },
  {
    title: 'Release with confidence',
    detail: 'Plan your release, tell your story once, and move forward without second-guessing.',
  },
]

// What totalaud.io helps with - Vision aligned pillars
export const PILLARS = [
  {
    id: 'finish',
    title: 'A second opinion for music you care about',
    description: "Understand what's working, what could improve, and what's already good enough.",
    features: [
      'Arrangement & energy',
      'Mix translation & clarity',
      'Release readiness (not quality scoring)',
    ],
    screenshot: '/images/landing/workspace-finish.png',
    screenshotAlt: 'Finish mode showing audio upload and analysis workspace',
  },
  {
    id: 'release',
    title: 'Release as a narrative — not a checkbox',
    description: 'Plan releases over time, not as isolated drops. Think about timing and momentum.',
    features: [],
    screenshot: '/images/landing/workspace-timeline.png',
    screenshotAlt: 'Timeline mode showing visual release planning with lanes and milestones',
  },
  {
    id: 'leverage',
    title: 'Relationships, not lists',
    description:
      'Keep track of the people who matter -- playlists, press, collaborators -- with context, not spreadsheets.',
    features: [],
    screenshot: '/images/landing/workspace-scout.png',
    screenshotAlt: 'Scout mode showing BBC Introducing, Pitchfork, and other opportunity cards',
  },
  {
    id: 'pitch',
    title: 'Tell your story once — use it everywhere',
    description: 'Write your story once. Use it across pitches, bios, playlists, and socials.',
    features: [],
    screenshot: '/images/landing/workspace-pitch.png',
    screenshotAlt: 'Pitch mode showing Radio, Press, Playlist, and Custom pitch templates',
  },
]

export type Pillar = (typeof PILLARS)[0]
