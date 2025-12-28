/**
 * Use-case data for pSEO pages
 * Each use-case gets its own landing page at /for/[slug]
 */

export interface UseCaseData {
  slug: string
  name: string
  title: string
  description: string
  heroText: string
  context: string
  challenges: string[]
  timeline: string[]
  tips: string[]
  keywords: string[]
}

export const useCases: UseCaseData[] = [
  {
    slug: 'first-release',
    name: 'First Release',
    title: 'Planning Your First Music Release',
    description:
      'Everything you need to know for your first release. Scout contacts, plan your timeline, and craft your story.',
    heroText: 'Your first release deserves the best start',
    context:
      'Your first release sets the tone for your career. Get it right and you build momentum. Rush it and you waste your best song on an empty room.',
    challenges: [
      'No existing audience to promote to',
      "Don't know where to start with promotion",
      'Overwhelmed by conflicting advice online',
      'Limited budget for marketing',
      'No press contacts or playlist connections',
    ],
    timeline: [
      '8 weeks out: Finalise artwork, write bio, set up profiles',
      '6 weeks out: Submit to Spotify for Artists editorial consideration',
      '4 weeks out: Start teasing on social media',
      '3 weeks out: Send to blogs and playlists',
      '2 weeks out: Press release to relevant outlets',
      '1 week out: Pre-save campaign push',
      'Release day: Engage with every listener',
      'Week after: Thank supporters, share metrics',
    ],
    tips: [
      "Don't release on Friday if you're unknown - Tuesday or Wednesday gets more attention",
      'One great song is better than a rushed EP',
      'Build relationships with 5 blogs rather than spray-and-pray 500',
      'Your story matters more than production quality',
      'Save your best song for when you have momentum',
    ],
    keywords: [
      'first music release',
      'how to release first song',
      'debut single promotion',
      'new artist release strategy',
      'first song spotify',
    ],
  },
  {
    slug: 'single-release',
    name: 'Single Release',
    title: 'Single Release Promotion Guide',
    description:
      'Maximise your single release with a focused campaign. Find the right contacts and plan every step.',
    heroText: 'Every single is a chance to grow',
    context:
      'Singles are the currency of streaming. A well-promoted single can change everything. A forgotten single is just noise.',
    challenges: [
      'Standing out in 100,000+ daily uploads',
      'Playlist algorithms favour consistency',
      'Short attention spans mean narrow windows',
      'Balancing promotion with creation time',
      'Measuring success beyond streams',
    ],
    timeline: [
      '6 weeks out: Submit to Spotify editorial playlists',
      '4 weeks out: Pitch to blogs and independent playlisters',
      '3 weeks out: Teaser content on social media',
      '2 weeks out: Press release and email newsletter',
      '1 week out: Pre-save campaign, behind-the-scenes content',
      'Release day: Live engagement, stories, thank you posts',
      'Week 1: Playlist follow-up, share user reactions',
      'Week 2-4: Sustain momentum with remix, acoustic, or content',
    ],
    tips: [
      'Pitch to Spotify at least 4 weeks before release (7 days minimum)',
      'Create 3-5 pieces of content per single minimum',
      'Email your subscribers directly - they convert better than social',
      'Follow up with bloggers who covered you before',
      'Track which playlists drive actual listeners, not just streams',
    ],
    keywords: [
      'single release promotion',
      'how to promote a single',
      'single release strategy',
      'spotify single promotion',
      'release single independently',
    ],
  },
  {
    slug: 'ep-release',
    name: 'EP Release',
    title: 'How to Promote an EP Release',
    description:
      'Plan your EP campaign from start to finish. Find contacts, build anticipation, and maximise impact.',
    heroText: 'An EP tells your story',
    context:
      "EPs prove you're serious. 4-6 tracks show range and commitment. But they need more planning than singles.",
    challenges: [
      'Harder to get playlist placement for multiple tracks',
      'More content needed to promote properly',
      'Longer campaign means sustained effort',
      'Risk of listener fatigue if not paced well',
      'Higher production costs need better returns',
    ],
    timeline: [
      '12 weeks out: Plan single strategy (which tracks, what order)',
      '10 weeks out: Lead single release and promotion',
      '8 weeks out: Submit EP to Spotify editorial',
      '6 weeks out: Second single or focus track',
      '4 weeks out: Full press campaign begins',
      '2 weeks out: Pre-save campaign, tracklist reveal',
      'Release week: Focused content for each track',
      'Month after: Acoustic sessions, remixes, tour dates',
    ],
    tips: [
      'Release 1-2 singles before the EP to build momentum',
      "Don't put your best song as track 1 - save it for the single",
      'Create "focus tracks" for Spotify submission',
      'Consider staggered track releases (Waterfall strategy)',
      'Physical formats (vinyl, cassette) create press hooks',
    ],
    keywords: [
      'ep release promotion',
      'how to promote ep',
      'ep release strategy',
      'ep campaign planning',
      'independent ep release',
    ],
  },
  {
    slug: 'album-campaign',
    name: 'Album Campaign',
    title: 'Album Release Campaign Planning',
    description:
      'Master your album campaign with structured planning. Scout press, plan your timeline, and tell your story.',
    heroText: 'Albums make careers',
    context:
      'Albums are statements. They require serious investment but create lasting impact. A great album campaign can define your year.',
    challenges: [
      'Long-form work struggles in streaming economy',
      'Requires significant marketing budget to break through',
      'Press lead times are 3-6 months for major coverage',
      'Touring and promotion must align perfectly',
      'Maintaining fan interest over extended campaign',
    ],
    timeline: [
      '6 months out: Finalise album, plan single strategy',
      '5 months out: Photography, artwork, video production',
      '4 months out: First single, announce album',
      '3 months out: Send to press with long lead times',
      '2 months out: Second single, tour announcement',
      '1 month out: Third single, behind-the-scenes content',
      '2 weeks out: Album reviews embargo lifts',
      'Release week: Launch shows, interviews, full push',
      'Months after: Tour, deluxe edition, continued content',
    ],
    tips: [
      'Start planning 6-12 months before release',
      'Consider hiring a publicist for album campaigns',
      'Physical formats are essential for album coverage',
      'Plan 3-4 singles minimum to sustain interest',
      'Build your live show before album drops',
      'Create a clear narrative arc across the campaign',
    ],
    keywords: [
      'album release campaign',
      'how to promote album',
      'album marketing strategy',
      'album release planning',
      'independent album promotion',
    ],
  },
  {
    slug: 'comeback-release',
    name: 'Comeback Release',
    title: 'Planning Your Comeback Release',
    description:
      'Return stronger after a break. Re-engage your audience, find new contacts, and plan your comeback.',
    heroText: 'Comebacks are powerful stories',
    context:
      'Taking a break is healthy. Coming back is harder than starting. But your existing audience is an asset - use it wisely.',
    challenges: [
      'Audience has moved on or forgotten',
      'Music industry has changed while you were away',
      'Streaming profiles may have gone stale',
      'Need to rebuild momentum from scratch',
      'Balancing old fans with new audience',
    ],
    timeline: [
      '8 weeks out: Update all profiles, refresh photos and bio',
      '6 weeks out: Tease return on social media',
      '5 weeks out: Email existing subscribers with personal message',
      '4 weeks out: Announce comeback with clear narrative',
      '3 weeks out: Submit to Spotify, pitch to press',
      '2 weeks out: Build anticipation with throwback + new content',
      '1 week out: Pre-save push, countdown content',
      'Release week: Celebrate return, thank loyal fans',
      'Month after: Build new momentum, release more music quickly',
    ],
    tips: [
      'Address the break directly - fans appreciate honesty',
      'Release multiple tracks quickly to regain algorithm favour',
      'Re-connect with bloggers who covered you before',
      'Your story of coming back IS the hook',
      "Don't apologise for the break - frame it positively",
      'Consider a fresh visual identity for the new chapter',
    ],
    keywords: [
      'comeback release',
      'return to music',
      'music comeback strategy',
      'relaunch music career',
      'artist comeback promotion',
    ],
  },
]

export function getUseCaseBySlug(slug: string): UseCaseData | undefined {
  return useCases.find((u) => u.slug === slug)
}

export function getAllUseCaseSlugs(): string[] {
  return useCases.map((u) => u.slug)
}
