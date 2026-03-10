'use client'

export type GlobalMood = 'calm' | 'focused' | 'charged' | 'chaotic' | 'idle'

export interface MoodPreset {
  id: GlobalMood
  label: string
  description: string
}

export const MOOD_PRESETS: Record<GlobalMood, MoodPreset> = {
  calm: {
    id: 'calm',
    label: 'Calm',
    description: 'Low-key focus, nothing on fire. Ambient is doing most of the work.',
  },
  focused: {
    id: 'focused',
    label: 'Focused',
    description: 'Agents are landing, loops are ticking, you are in the pocket.',
  },
  charged: {
    id: 'charged',
    label: 'Charged',
    description: 'High momentum across loops and agents. Feels like a release week.',
  },
  chaotic: {
    id: 'chaotic',
    label: 'Chaotic',
    description: 'Lots of activity, not all of it aligned. Time to simplify the stack.',
  },
  idle: {
    id: 'idle',
    label: 'Idle',
    description: 'Engines are idling. Nothing wrong, just quiet.',
  },
}
