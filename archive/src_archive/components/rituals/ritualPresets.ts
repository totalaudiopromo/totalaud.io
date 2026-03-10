'use client'

import type { Ritual } from './ritualTypes'

export const RITUAL_PRESETS: Ritual[] = [
  {
    id: 'review_loop',
    title: 'Review your hottest loop',
    description:
      'Open Core OS and scan your latest LoopOS momentum. Spend 5 minutes listening back and tagging 1–2 “ready to ship” clips.',
    os: 'core',
    weight: 1.2,
  },
  {
    id: 'idea_spark',
    title: 'Spin up a fresh idea',
    description:
      'Jump into Analogue and review yesterday’s ideas. Pick one riff, expand it with a quick note, and decide the next tiny move.',
    os: 'analogue',
    weight: 1,
  },
  {
    id: 'pitch_polish',
    title: 'Polish one pitch line',
    description:
      'Head to Aqua and tighten a single sentence of your pitch. Focus on one hook line that would make a tired editor lean in.',
    os: 'aqua',
    weight: 1,
  },
  {
    id: 'micro_promo',
    title: 'Ship a micro-promo',
    description:
      'From ASCII OS, turn one LoopOS-ready clip into a concrete action: draft one outreach message or post and log it as done.',
    os: 'ascii',
    weight: 0.9,
  },
  {
    id: 'reflect',
    title: 'Quick reflection check-in',
    description:
      'Use XP OS to look back at today’s agent runs. Note one thing that worked, one thing that felt off, and what you’ll try next.',
    os: 'xp',
    weight: 0.8,
  },
  {
    id: 'plan_day',
    title: 'Plan today’s moves',
    description:
      'In ASCII OS, sketch three tiny moves for today: one loop, one story, one promo. Keep each to a single, concrete action.',
    os: 'ascii',
    weight: 1.1,
  },
  {
    id: 'loop_constellation',
    title: 'Map your loop constellation',
    description:
      'From Core OS, review which loops are moving and which are stalled. Mark one as “focus” for the week and park the rest.',
    os: 'core',
    weight: 0.7,
  },
  {
    id: 'a_and_r_lens',
    title: 'Listen like A&R',
    description:
      'Open Analogue and pick one idea to hear like an A&R scout. Jot down what’s unique, what’s generic, and a bolder version.',
    os: 'analogue',
    weight: 0.85,
  },
]
