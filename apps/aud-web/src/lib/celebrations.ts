/**
 * Celebration & Delight Utilities
 *
 * Clean, professional micro-interactions
 */

// Toast message variants - no emojis, professional tone
export const successMessages = {
  ideaCreated: ['Idea saved', 'Captured', 'Added to ideas'],
  addedToTimeline: ['Added to timeline', 'Scheduled', 'Added to your plan'],
  pitchCopied: ['Copied to clipboard', 'Ready to paste', 'Copied'],
  coachResponse: ['Here are my thoughts...', 'Suggestion ready'],
}

// Get random message from category
export function getRandomMessage(category: keyof typeof successMessages): string {
  const messages = successMessages[category]
  return messages[Math.floor(Math.random() * messages.length)]
}

// Haptic feedback for mobile (if supported)
export function triggerHaptic(type: 'light' | 'medium' | 'success' = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10)
        break
      case 'medium':
        navigator.vibrate(20)
        break
      case 'success':
        navigator.vibrate([10, 50, 10])
        break
    }
  }
}

// Milestone messages - clean, professional
export const milestones = {
  ideas: [
    { count: 1, message: 'First idea logged' },
    { count: 5, message: '5 ideas captured' },
    { count: 10, message: "10 ideas - you're building momentum" },
    { count: 25, message: '25 ideas collected' },
  ],
  timeline: [
    { count: 1, message: 'First step planned' },
    { count: 5, message: '5 actions scheduled' },
    { count: 10, message: '10 actions - solid campaign' },
  ],
  scout: [
    { count: 1, message: 'First opportunity saved' },
    { count: 5, message: '5 opportunities collected' },
    { count: 10, message: '10 opportunities - great network' },
  ],
  pitch: [
    { count: 1, message: 'First pitch started' },
    { count: 3, message: '3 pitches drafted' },
    { count: 5, message: '5 pitches - serious outreach' },
  ],
  onboarding: [{ count: 1, message: 'Welcome to totalaud.io' }],
}

export function checkMilestone(type: keyof typeof milestones, count: number): string | null {
  const typeMessages = milestones[type]
  const milestone = typeMessages.find((m) => m.count === count)
  return milestone?.message || null
}
