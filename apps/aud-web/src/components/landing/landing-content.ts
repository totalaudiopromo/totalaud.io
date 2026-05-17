// How it works steps — label workspace (May 2026 pivot)
export const HOW_IT_WORKS = [
  {
    title: 'Plan the release',
    detail:
      'Drag every release through planning, in-progress, live, and reported. See what ships next week.',
  },
  {
    title: 'Author the brief',
    detail: 'Write the brief once. Approve it once. Keep every fact in one place across the team.',
  },
  {
    title: 'Brief your partners',
    detail:
      'Send the brief and asset pack to your publicist, plugger, sync agent, and marketing freelancer in one click.',
  },
  {
    title: 'Track what shipped',
    detail:
      'See what landed, what stalled, and what each partner is owed — without chasing five inboxes.',
  },
]

// What totalaud.io helps with — label-side workspace pillars (May 2026 pivot)
export const PILLARS = [
  {
    id: 'pipeline',
    title: 'One pipeline. Every release. Every artist.',
    description:
      "Drag releases through planning, in-progress, live, and reported. See exactly what's shipping next week, who's working on it, and what's still missing.",
    features: [
      'Planning, in-progress, live, reported lanes',
      'Per-artist filter and per-release detail',
      'Release-day countdowns and partner-handoff state',
    ],
    screenshot: '/images/landing/workspace-timeline.png',
    screenshotAlt: 'Release pipeline showing planning, in-progress, live and reported lanes',
  },
  {
    id: 'briefs',
    title: 'Briefs that ship themselves',
    description:
      'Author the brief once. Approve it once. Send it to your publicist, plugger, sync agent, and marketing freelancer in one click. They get a clean PDF or, if they use TAP, a campaign pre-loaded in their queue.',
    features: [
      'Single-source brief authoring',
      'PDF export for partners who do not use TAP',
      'Direct handoff to TAP for partners who do',
    ],
    screenshot: '/images/landing/workspace-pitch.png',
    screenshotAlt: 'Brief authoring view with partner handoff options',
  },
  {
    id: 'assets',
    title: "Asset packs that don't get lost",
    description:
      'Master, artwork, bio, press photos, EPK — packaged per release, shared per partner, tracked per click. No more "can you re-send the WAV?".',
    features: [
      'Per-release asset pack with master, artwork, bio, photos',
      'Per-partner share link with click tracking',
      'Versioned so the latest master is never ambiguous',
    ],
    screenshot: '/images/landing/workspace-scout.png',
    screenshotAlt: 'Asset pack view showing master, artwork, bio and press photos per release',
  },
  {
    id: 'partners',
    title: 'Reprtoir for distribution. DISCO for sharing. totalaud.io for everything in between.',
    description:
      'The operational layer between the release plan and the PR campaign. Your distributor handles the supply chain. Your publicist runs the press. totalaud.io keeps everyone briefed, on the same plan, with the same files.',
    features: [],
    screenshot: '/images/landing/workspace-finish.png',
    screenshotAlt: 'totalaud.io as the layer between distributor and PR campaign',
  },
]

export type Pillar = (typeof PILLARS)[0]
