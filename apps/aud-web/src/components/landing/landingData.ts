export const FEATURES = [
  {
    id: 'ideas',
    title: 'Ideas',
    description:
      'Capture fleeting inspiration. An infinite canvas where release concepts take shape.',
  },
  {
    id: 'scout',
    title: 'Scout',
    description:
      'Find the right ears. Radio pluggers, playlist curators, music supervisors - all in one searchable database.',
  },
  {
    id: 'timeline',
    title: 'Timeline',
    description:
      'See your release unfold. Drag clips across five lanes: Planning, Creative, Release, Promo, Analysis.',
  },
  {
    id: 'pitch',
    title: 'Pitch',
    description: 'Tell your story. AI-assisted pitch crafting that sounds like you, not a robot.',
  },
  {
    id: 'finish',
    title: 'Finish',
    description:
      'Polish your track. Upload, separate stems, detect structure, arrange — all in your browser.',
    comingSoon: true,
  },
]

export type FeatureItem = (typeof FEATURES)[number]

export const HOW_IT_WORKS = [
  {
    title: 'Scout contacts',
    detail: 'Find radio pluggers, playlist curators, and press contacts who fit your sound.',
  },
  {
    title: 'Plan your timeline',
    detail: 'Map out your release campaign with actions across promo, content, and outreach.',
  },
  {
    title: 'Craft your pitch',
    detail: 'Write compelling pitches with AI coaching that understands the music industry.',
  },
]

export const MOCKUP_MODES = ['Ideas', 'Scout', 'Timeline', 'Pitch']

export const IDEA_FILTERS = [
  { label: 'All', count: 12, active: true },
  { label: 'Content', colour: '#3AA9BE', count: 4 },
  { label: 'Brand', colour: '#A855F7', count: 3 },
  { label: 'Music', colour: '#22C55E', count: 3 },
  { label: 'Promo', colour: '#F97316', count: 2 },
]

export const IDEA_CARDS = [
  {
    content: 'Behind-the-scenes studio session for TikTok',
    tag: 'content',
    x: 40,
    y: 30,
    colour: '#3AA9BE',
  },
  {
    content: 'Collaborate with visual artist for album artwork',
    tag: 'brand',
    x: 280,
    y: 60,
    colour: '#A855F7',
  },
  {
    content: 'New synth patches for EP',
    tag: 'music',
    x: 520,
    y: 25,
    colour: '#22C55E',
  },
  {
    content: 'Submit to BBC Radio 1 Introducing',
    tag: 'promo',
    x: 100,
    y: 150,
    colour: '#F97316',
  },
  {
    content: 'Spotify playlist pitching strategy',
    tag: 'promo',
    x: 380,
    y: 170,
    colour: '#F97316',
  },
  {
    content: 'Record acoustic version for YouTube',
    tag: 'content',
    x: 600,
    y: 140,
    colour: '#3AA9BE',
  },
]
