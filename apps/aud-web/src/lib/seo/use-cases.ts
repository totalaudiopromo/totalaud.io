/**
 * Use-case data for pSEO pages
 * Each use-case gets its own landing page at /for/[slug]
 *
 * Total: 15 use-cases covering artist journey stages
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
  // === RELEASE TYPES ===
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

  // === SPECIFIC ACTIVITIES ===
  {
    slug: 'playlist-pitching',
    name: 'Playlist Pitching',
    title: 'How to Pitch to Spotify Playlists',
    description:
      'Master playlist pitching with proven strategies. Find curators, craft compelling pitches, and track results.',
    heroText: 'Playlists are the new radio',
    context:
      'Playlist placement can transform an unknown track into a hit. But the landscape is complex - editorial, algorithmic, and independent playlists all work differently.',
    challenges: [
      'Spotify editorial has low acceptance rates',
      'Independent curators receive hundreds of pitches daily',
      'Pay-to-play scams waste budget on fake streams',
      'Algorithm changes affect playlist discovery',
      'Hard to measure real fan conversion from playlist streams',
    ],
    timeline: [
      '4+ weeks out: Submit to Spotify for Artists editorial consideration',
      '3 weeks out: Research independent playlist curators in your genre',
      '2 weeks out: Send personalised pitches to target curators',
      "1 week out: Follow up with curators who opened but didn't respond",
      'Release day: Monitor for playlist additions',
      'Week 1-2: Thank curators who added you, share the playlists',
      'Week 3-4: Analyse which placements drove real engagement',
    ],
    tips: [
      'Never pay for playlist placement - it often uses bots',
      'Personalise every pitch - curators can spot templates',
      'Include a direct link to your track, not your artist page',
      'Mention why your track fits their specific playlist',
      'Build relationships before you need something',
      'Focus on smaller, engaged playlists over big passive ones',
    ],
    keywords: [
      'playlist pitching',
      'how to pitch spotify playlists',
      'playlist submission tips',
      'spotify playlist promotion',
      'independent playlist curators',
    ],
  },
  {
    slug: 'radio-promotion',
    name: 'Radio Promotion',
    title: 'How to Get Radio Play for Your Music',
    description:
      'Navigate radio promotion from BBC Introducing to specialist shows. Find contacts and craft effective pitches.',
    heroText: 'Radio still breaks artists',
    context:
      'Radio remains powerful for credibility and discovery. BBC Introducing has launched countless careers. Getting played requires strategy, not luck.',
    challenges: [
      'Gatekeeping favours established names',
      'Commercial radio almost impossible without label',
      'BBC Introducing is competitive',
      'Regional stations have limited reach',
      'Tracking radio play is difficult',
    ],
    timeline: [
      '6 weeks out: Research relevant radio shows and presenters',
      '4 weeks out: Upload to BBC Introducing Uploader',
      '3 weeks out: Email specialist show presenters directly',
      '2 weeks out: Follow up with radio pluggers or stations',
      '1 week out: Tag stations on social media with release news',
      'Release week: Monitor for plays, thank presenters publicly',
      'After: Build on radio relationships for future releases',
    ],
    tips: [
      'BBC Introducing is your best entry point in the UK',
      'Target specialist shows for your genre, not mainstream',
      'Build relationships with presenters on social media first',
      'Regional radio is more accessible than national',
      'Consider hiring a radio plugger for bigger campaigns',
      'Always send radio-edit versions (under 3:30)',
    ],
    keywords: [
      'radio promotion',
      'how to get radio play',
      'bbc introducing tips',
      'radio plugging uk',
      'music radio submission',
    ],
  },
  {
    slug: 'press-coverage',
    name: 'Press Coverage',
    title: 'How to Get Music Press Coverage',
    description:
      'Secure blog features, magazine coverage, and online press. Build relationships and craft compelling stories.',
    heroText: 'Press builds credibility',
    context:
      'Press coverage validates your music and builds your story. Even as traditional media shrinks, blog features and online coverage matter for industry perception.',
    challenges: [
      'Journalists receive hundreds of pitches daily',
      'Major outlets focus on established artists',
      'Press coverage requires clear narrative hook',
      'Follow-up timing is crucial but annoying',
      'Measuring press impact is difficult',
    ],
    timeline: [
      '8 weeks out: Research target publications and writers',
      '6 weeks out: Build relationships with key journalists on social',
      '4 weeks out: Send press release with exclusive angle',
      '3 weeks out: Follow up with journalists who showed interest',
      '2 weeks out: Offer interviews, exclusives, or unique content',
      'Release week: Share all coverage widely, thank journalists',
      'After: Maintain relationships for future releases',
    ],
    tips: [
      'Lead with your story, not just the music',
      'Personalise every pitch to the specific writer',
      'Offer exclusives to increase interest',
      'Start with smaller blogs, build to larger outlets',
      'Timing matters - avoid major release Fridays',
      'Include high-quality photos and assets',
    ],
    keywords: [
      'music press coverage',
      'how to get blog features',
      'music pr tips',
      'music journalism pitching',
      'indie music press',
    ],
  },
  {
    slug: 'tour-announcement',
    name: 'Tour Announcement',
    title: 'How to Announce and Promote a Tour',
    description:
      'Plan your tour announcement for maximum impact. Coordinate press, social, and ticket sales effectively.',
    heroText: 'Tours build real fans',
    context:
      'Live performance is where careers are built. A well-promoted tour can transform streaming listeners into lifelong fans. But coordination is everything.',
    challenges: [
      'Ticket sales often start slow',
      'Coordinating multiple city announcements',
      'Press coverage for tours is competitive',
      'Supporting slots vs headline decisions',
      'Budget constraints affect routing',
    ],
    timeline: [
      '3 months out: Confirm dates, venues, and ticket prices',
      '2 months out: Announce tour with ticket on-sale date',
      '6 weeks out: Tickets go on sale, push pre-sales to email list',
      '4 weeks out: Local press push for each city',
      '2 weeks out: Urgency push for remaining tickets',
      '1 week out: Day-of-show reminders and logistics',
      'Tour: Share content from every show',
      'After: Thank fans, share highlights, announce next dates',
    ],
    tips: [
      'Pre-sales to your email list build momentum',
      'Local press coverage drives ticket sales',
      'Use Spotify for Artists data to choose cities',
      'Support slots build audience more than empty headline shows',
      'Share behind-the-scenes content throughout',
      'Always have merch available',
    ],
    keywords: [
      'tour announcement',
      'how to promote a tour',
      'music tour marketing',
      'concert promotion tips',
      'indie artist touring',
    ],
  },
  {
    slug: 'sync-licensing',
    name: 'Sync Licensing',
    title: 'How to Get Your Music in Film, TV, and Ads',
    description:
      'Navigate sync licensing opportunities. Understand the process, find contacts, and position your music for placements.',
    heroText: 'Sync can change everything',
    context:
      'A sync placement in a popular show or advert can reach millions of new listeners instantly. Understanding the process is essential for any serious artist.',
    challenges: [
      'Competitive market with established catalogues',
      'Music supervisors are hard to reach directly',
      'Rights must be 100% clear and controlled',
      'Timing is unpredictable - briefs come randomly',
      'Payment varies wildly from small to life-changing',
    ],
    timeline: [
      'Ongoing: Ensure all rights are cleared and documented',
      'Month 1: Research sync agencies and music libraries',
      'Month 2: Submit to sync-focused playlists and libraries',
      'Month 3: Build relationships with music supervisors on LinkedIn',
      'Ongoing: Create instrumental versions of all tracks',
      'Ongoing: Keep metadata clean and professional',
      'When placed: Maximise exposure, update bio, tell the story',
    ],
    tips: [
      'Instrumental versions are essential for sync',
      'Clear and controlled rights are non-negotiable',
      'Music supervisors find music through libraries, not direct pitches',
      'Sync agencies do the pitching - get representation',
      'Be patient - sync deals can take months or years',
      'Keep creating - more music means more opportunities',
    ],
    keywords: [
      'sync licensing',
      'music sync placement',
      'how to get music in tv',
      'film music licensing',
      'music supervisor contacts',
    ],
  },

  // === ARTIST TYPES ===
  {
    slug: 'bedroom-producers',
    name: 'Bedroom Producers',
    title: 'Music Promotion for Bedroom Producers',
    description:
      'Build your audience as a solo electronic producer. Navigate the unique challenges of promoting instrumental music.',
    heroText: 'Your bedroom is your studio',
    context:
      'Bedroom producers face unique challenges - no live shows, no band visuals, often no vocals. But the internet has levelled the playing field for producers.',
    challenges: [
      'No traditional live performance opportunities',
      'Instrumental music harder to promote on social',
      'Visual identity challenging without a face',
      'Genre saturation in electronic music',
      'Building personal connection without vocals',
    ],
    timeline: [
      'Foundation: Build consistent visual brand and identity',
      'Month 1: Establish presence on producer-focused platforms',
      'Month 2: Start releasing consistently (monthly or bi-weekly)',
      'Month 3: Engage with producer communities',
      'Ongoing: Share process content (DAW sessions, sound design)',
      'Ongoing: Remix and collaborate to reach new audiences',
      'Growth phase: Consider live sets or DJ performances',
    ],
    tips: [
      'SoundCloud and Bandcamp remain important for producers',
      'Process videos perform well on TikTok and YouTube',
      'Remix contests and collaborations expand reach',
      'Consider DJ sets or live electronic performances',
      'Build community with other producers in your niche',
      'Consistent visual aesthetic creates recognisable brand',
    ],
    keywords: [
      'bedroom producer promotion',
      'electronic music marketing',
      'beat maker promotion',
      'producer marketing tips',
      'instrumental music promotion',
    ],
  },
  {
    slug: 'bands',
    name: 'Bands',
    title: 'Music Promotion for Bands',
    description:
      'Navigate band promotion with coordinated strategy. Balance multiple personalities and maximise collective impact.',
    heroText: 'Bands create community',
    context:
      'Bands have advantages - built-in content, live energy, multiple personalities. But coordination is harder, and decisions require consensus.',
    challenges: [
      'Coordinating multiple schedules and opinions',
      'Higher costs (travel, accommodation, gear)',
      'Attribution challenges on streaming platforms',
      'Internal dynamics affect consistency',
      'Splitting limited income multiple ways',
    ],
    timeline: [
      'Foundation: Establish band roles including promotion responsibilities',
      'Month 1: Create band content calendar with assigned creators',
      'Month 2: Build local following through regular gigging',
      'Month 3: Expand to regional circuit',
      'Ongoing: Document band life (rehearsals, travel, shows)',
      'Growth phase: Festival submissions and support slots',
      'Long-term: Headline shows and touring',
    ],
    tips: [
      'Assign clear promotion roles within the band',
      'Live content is your biggest advantage - use it',
      'Local scene support is essential for bands',
      'Merch sales matter more for bands than solo artists',
      'Bring energy to every show, even small ones',
      'Document everything - band life is content',
    ],
    keywords: [
      'band promotion',
      'how to promote your band',
      'band marketing strategy',
      'indie band promotion',
      'band social media tips',
    ],
  },
  {
    slug: 'singer-songwriters',
    name: 'Singer-Songwriters',
    title: 'Music Promotion for Singer-Songwriters',
    description:
      'Build your audience as a solo singer-songwriter. Leverage authenticity and storytelling to connect with listeners.',
    heroText: 'Your story is your strength',
    context:
      'Singer-songwriters have the purest form of musical expression - just you and your songs. But standing out requires more than talent; it requires connection.',
    challenges: [
      'Competing with full-band productions',
      'Solo content creation is demanding',
      'Acoustic music can get lost in playlists',
      'Building audience without band dynamics',
      'Balancing vulnerability with professionalism',
    ],
    timeline: [
      'Foundation: Develop your unique story and voice',
      'Month 1: Start sharing songs and stories consistently',
      'Month 2: Play open mics and songwriter nights',
      'Month 3: Build email list through intimate connection',
      'Ongoing: Share songwriting process and behind-the-scenes',
      'Growth phase: House concerts and intimate venue circuit',
      'Long-term: Sync opportunities and direct fan support',
    ],
    tips: [
      'Your story is your differentiator - share it',
      'Intimate settings suit singer-songwriters perfectly',
      'House concerts and Sofar Sounds build devoted fans',
      'Sync licensing loves solo acoustic performances',
      'Direct fan support (Patreon, etc.) works well for singer-songwriters',
      'Collaborate with other songwriters for cross-promotion',
    ],
    keywords: [
      'singer songwriter promotion',
      'solo artist marketing',
      'acoustic music promotion',
      'singer songwriter tips',
      'songwriter marketing strategy',
    ],
  },
  {
    slug: 'djs',
    name: 'DJs',
    title: 'Music Promotion for DJs',
    description:
      'Build your DJ brand and get bookings. Navigate the unique challenges of promoting yourself as a DJ.',
    heroText: 'DJs create experiences',
    context:
      "DJs face unique promotion challenges - your art is often playing other people's music. Building a recognisable brand and securing bookings requires specific strategies.",
    challenges: [
      "Playing others' music limits streaming presence",
      'Oversaturated market especially in electronic genres',
      'Bookings depend on reputation and relationships',
      'Social media content harder without original music',
      'Competition from established DJs is intense',
    ],
    timeline: [
      'Foundation: Define your sound, style, and unique angle',
      'Month 1: Create mixes and share on SoundCloud/Mixcloud',
      'Month 2: Build relationships with local promoters',
      'Month 3: Secure residency or regular slot',
      'Ongoing: Document DJ life and share performances',
      'Growth phase: Original productions and remixes',
      'Long-term: Festival bookings and international dates',
    ],
    tips: [
      'Regular mixes on SoundCloud/Mixcloud build following',
      'Original productions dramatically increase opportunities',
      'Video content of your sets performs well',
      'Relationships with promoters matter more than followers',
      'Residencies build loyal local followings',
      'Niche down on sound - generalist DJs struggle',
    ],
    keywords: [
      'dj promotion',
      'how to promote yourself as a dj',
      'dj marketing tips',
      'dj booking strategy',
      'electronic dj promotion',
    ],
  },
  {
    slug: 'rappers',
    name: 'Rappers',
    title: 'Music Promotion for Rappers',
    description:
      'Build your rap career with strategic promotion. Navigate the oversaturated hip-hop landscape with authentic marketing.',
    heroText: 'Rappers tell truths',
    context:
      "Hip-hop is the world's most popular genre - and the most competitive. Breaking through requires more than bars; it requires strategic promotion and authentic connection.",
    challenges: [
      'Extremely oversaturated market',
      'Pay-to-play scams target rappers aggressively',
      'Viral hits are unpredictable',
      'Regional scenes can be cliquey',
      'Industry politics affect opportunities',
    ],
    timeline: [
      'Foundation: Develop your unique voice and style',
      'Month 1: Consistent release schedule (weekly or bi-weekly)',
      'Month 2: Build local presence through open mics and cyphers',
      'Month 3: Collaborations with other artists in your lane',
      'Ongoing: Content across TikTok, YouTube Shorts, Instagram Reels',
      'Growth phase: Music videos and visual content',
      'Long-term: Features with established artists, label interest',
    ],
    tips: [
      'Consistency beats perfection - release frequently',
      'TikTok and Reels can break rap tracks faster than playlists',
      'Collaborations expand reach faster than solo releases',
      'Visual content is essential in hip-hop',
      'Build relationships in your local scene first',
      'Avoid pay-to-play blogs and playlist scams',
    ],
    keywords: [
      'rapper promotion',
      'how to promote rap music',
      'hip hop marketing strategy',
      'rap artist promotion',
      'independent rapper tips',
    ],
  },
]

export function getUseCaseBySlug(slug: string): UseCaseData | undefined {
  return useCases.find((u) => u.slug === slug)
}

export function getAllUseCaseSlugs(): string[] {
  return useCases.map((u) => u.slug)
}
