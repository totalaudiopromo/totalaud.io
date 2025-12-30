/**
 * Comparison data for pSEO pages
 * Each comparison gets its own landing page at /compare/[slug]
 *
 * These pages target high-intent competitive keywords like:
 * - "totalaud.io vs groover"
 * - "submithub alternatives"
 * - "best playlist pitching service 2025"
 *
 * Total: 12 comparison pages
 */

export interface CompetitorFeature {
  name: string
  totalaud: string | boolean
  competitor: string | boolean
}

export interface ComparisonData {
  slug: string
  competitor: string
  competitorUrl: string
  title: string
  description: string
  heroText: string
  summary: string
  ourApproach: string
  theirApproach: string
  features: CompetitorFeature[]
  bestFor: {
    us: string[]
    them: string[]
  }
  pricing: {
    us: string
    them: string
  }
  verdict: string
  keywords: string[]
}

export const comparisons: ComparisonData[] = [
  // === DIRECT COMPETITORS ===
  {
    slug: 'groover',
    competitor: 'Groover',
    competitorUrl: 'groover.co',
    title: 'totalaud.io vs Groover: Which is Better for UK Artists?',
    description:
      'Compare totalaud.io and Groover for music promotion. See features, pricing, and which platform suits your needs.',
    heroText: 'Two approaches to music promotion',
    summary:
      'Groover is a French-founded platform connecting artists with curators for paid submissions. totalaud.io is a calm workspace helping artists organise, discover, and pitch independently.',
    ourApproach:
      "We believe artists should own their promotion. totalaud.io gives you the tools to find opportunities, plan campaigns, and craft pitches - without paying per submission. It's your workspace, your pace.",
    theirApproach:
      'Groover operates on a credit-based system where you pay to submit to curators who guarantee a response. Fast feedback, but costs add up quickly.',
    features: [
      { name: 'Guaranteed curator response', totalaud: false, competitor: true },
      { name: 'Free to submit', totalaud: true, competitor: false },
      { name: 'Campaign planning tools', totalaud: true, competitor: false },
      { name: 'Contact discovery (Scout)', totalaud: true, competitor: false },
      { name: 'AI pitch assistance', totalaud: true, competitor: false },
      { name: 'Timeline visualisation', totalaud: true, competitor: false },
      { name: 'Ideas organisation', totalaud: true, competitor: false },
      { name: 'Credit-based submissions', totalaud: false, competitor: true },
      { name: 'Curator network size', totalaud: 'Growing', competitor: 'Large' },
      { name: 'UK-focused contacts', totalaud: true, competitor: 'Partial' },
    ],
    bestFor: {
      us: [
        'Artists who want to own their promotion process',
        'UK-focused artists seeking local contacts',
        'Those who prefer organised, calm workflows',
        'Artists on a tight budget',
        'Long-term career builders',
      ],
      them: [
        'Artists wanting guaranteed feedback quickly',
        'Those with budget for submission credits',
        'Artists targeting French/European markets',
        'Quick feedback seekers',
      ],
    },
    pricing: {
      us: 'From £5/month flat rate',
      them: '€2 per submission (credits expire)',
    },
    verdict:
      'If you want fast, guaranteed responses and have budget for credits, Groover works well. If you prefer building your own promotion system with UK-focused tools and no per-submission costs, totalaud.io is the calmer choice.',
    keywords: [
      'totalaud.io vs groover',
      'groover alternative',
      'groover review 2025',
      'is groover worth it',
      'groover vs submithub',
    ],
  },
  {
    slug: 'submithub',
    competitor: 'SubmitHub',
    competitorUrl: 'submithub.com',
    title: 'totalaud.io vs SubmitHub: Complete Comparison',
    description:
      'Compare totalaud.io and SubmitHub for playlist and blog submissions. Features, pricing, and which to choose.',
    heroText: 'Different philosophies for promotion',
    summary:
      'SubmitHub pioneered paid music submissions with guaranteed responses. totalaud.io takes a different approach - giving you tools to find and pitch contacts yourself.',
    ourApproach:
      "We don't charge per submission. Instead, totalaud.io helps you discover opportunities (Scout), plan your campaign (Timeline), organise ideas (Ideas), and craft pitches (Pitch). You build relationships directly.",
    theirApproach:
      "SubmitHub's credit system guarantees curator responses within 48 hours. Standard (free) submissions have no guarantee. Premium credits ensure a response but don't guarantee placement.",
    features: [
      { name: 'Guaranteed response time', totalaud: false, competitor: true },
      { name: 'Free submissions option', totalaud: true, competitor: 'Limited' },
      { name: 'Campaign planning', totalaud: true, competitor: false },
      { name: 'Contact database', totalaud: true, competitor: 'Curated list' },
      { name: 'Pitch writing assistance', totalaud: true, competitor: false },
      { name: 'Release timeline tools', totalaud: true, competitor: false },
      { name: 'Hot or Not feature', totalaud: false, competitor: true },
      { name: 'Curator approval ratings', totalaud: 'Coming', competitor: true },
      { name: 'UK-specific focus', totalaud: true, competitor: 'Global' },
      { name: 'Flat-rate pricing', totalaud: true, competitor: false },
    ],
    bestFor: {
      us: [
        'Artists preferring flat-rate costs',
        'UK-focused promotion needs',
        'Campaign planning and organisation',
        'Building long-term curator relationships',
        'Those overwhelmed by submission systems',
      ],
      them: [
        'Artists wanting guaranteed fast responses',
        'Those comfortable with pay-per-submit',
        'Global reach requirements',
        'Quick playlist feedback needs',
      ],
    },
    pricing: {
      us: 'From £5/month (unlimited use)',
      them: '$1-$3 per premium credit',
    },
    verdict:
      'SubmitHub is excellent for fast, guaranteed feedback if you have budget. totalaud.io is better if you want a complete workspace to manage your entire promotion process without per-submission costs.',
    keywords: [
      'totalaud.io vs submithub',
      'submithub alternative',
      'submithub review 2025',
      'is submithub worth it',
      'submithub credits cost',
    ],
  },
  {
    slug: 'hypeddit',
    competitor: 'Hypeddit',
    competitorUrl: 'hypeddit.com',
    title: 'totalaud.io vs Hypeddit: Which Platform for Your Music?',
    description:
      'Compare totalaud.io and Hypeddit for music marketing. Smart links, pre-saves, and promotion tools compared.',
    heroText: 'Different tools for different needs',
    summary:
      'Hypeddit focuses on smart links, pre-saves, and fan-gating. totalaud.io focuses on discovery, planning, and pitching. They solve different problems.',
    ourApproach:
      'totalaud.io helps you find opportunities, plan releases, and craft pitches. We focus on the promotion strategy side - discovering contacts, organising campaigns, and telling your story.',
    theirApproach:
      'Hypeddit specialises in conversion tools - smart links, pre-save pages, download gates. Their tools help you convert existing traffic into followers and streams.',
    features: [
      { name: 'Smart links', totalaud: false, competitor: true },
      { name: 'Pre-save pages', totalaud: false, competitor: true },
      { name: 'Download gates', totalaud: false, competitor: true },
      { name: 'Contact discovery', totalaud: true, competitor: false },
      { name: 'Campaign planning', totalaud: true, competitor: false },
      { name: 'AI pitch assistance', totalaud: true, competitor: false },
      { name: 'Playlist submission', totalaud: true, competitor: true },
      { name: 'Release timeline', totalaud: true, competitor: false },
      { name: 'Repost trading', totalaud: false, competitor: true },
      { name: 'UK focus', totalaud: true, competitor: 'Global' },
    ],
    bestFor: {
      us: [
        'Finding and pitching to contacts',
        'Planning release campaigns',
        'UK-focused promotion',
        'Organised, calm workflow',
        'Artist narrative development',
      ],
      them: [
        'Creating smart links and pre-saves',
        'Fan-gating downloads',
        'SoundCloud repost exchanges',
        'EDM and electronic focus',
        'Conversion optimisation',
      ],
    },
    pricing: {
      us: 'From £5/month',
      them: 'Free tier + paid plans from $5/month',
    },
    verdict:
      'These platforms complement each other. Use Hypeddit for smart links and pre-saves. Use totalaud.io for finding opportunities and planning campaigns. Many artists use both.',
    keywords: [
      'totalaud.io vs hypeddit',
      'hypeddit alternative',
      'hypeddit review 2025',
      'best smart link service',
      'hypeddit free tier',
    ],
  },
  {
    slug: 'playlist-push',
    competitor: 'Playlist Push',
    competitorUrl: 'playlistpush.com',
    title: 'totalaud.io vs Playlist Push: Comparison Guide',
    description:
      'Compare totalaud.io and Playlist Push for Spotify playlist promotion. Different approaches to getting playlisted.',
    heroText: 'Organic vs managed promotion',
    summary:
      'Playlist Push offers a managed service connecting you with playlist curators. totalaud.io helps you find and pitch curators yourself.',
    ourApproach:
      "We give you the tools to discover playlists, plan your approach, and craft personalised pitches. You build relationships directly. It's more work but more sustainable long-term.",
    theirApproach:
      'Playlist Push is a done-for-you service. You submit your track, pay a campaign fee, and they pitch to their curator network. Hands-off but less control.',
    features: [
      { name: 'Done-for-you pitching', totalaud: false, competitor: true },
      { name: 'DIY pitching tools', totalaud: true, competitor: false },
      { name: 'Campaign planning', totalaud: true, competitor: false },
      { name: 'Contact discovery', totalaud: true, competitor: false },
      { name: 'Curator feedback', totalaud: 'Direct', competitor: 'Aggregated' },
      { name: 'Price control', totalaud: true, competitor: false },
      { name: 'Relationship building', totalaud: true, competitor: false },
      { name: 'TikTok campaigns', totalaud: false, competitor: true },
      { name: 'Minimum spend', totalaud: 'None', competitor: '$150+' },
      { name: 'UK focus', totalaud: true, competitor: 'US-focused' },
    ],
    bestFor: {
      us: [
        'Artists wanting control over pitching',
        'Budget-conscious promotion',
        'UK-focused campaigns',
        'Building long-term curator relationships',
        'Organised campaign planning',
      ],
      them: [
        'Artists wanting hands-off service',
        'Those with significant marketing budget',
        'US-focused campaigns',
        'TikTok influencer campaigns',
      ],
    },
    pricing: {
      us: 'From £5/month',
      them: 'From $150 per campaign',
    },
    verdict:
      'Playlist Push is for artists with budget who want hands-off promotion. totalaud.io is for artists who want to learn promotion, build relationships, and control their process.',
    keywords: [
      'playlist push alternative',
      'playlist push review 2025',
      'playlist push cost',
      'is playlist push legit',
      'best playlist promotion service',
    ],
  },

  // === CATEGORY COMPARISONS ===
  {
    slug: 'playlist-pitching-services',
    competitor: 'Playlist Pitching Services',
    competitorUrl: '',
    title: 'Best Playlist Pitching Services 2025: Complete Guide',
    description:
      'Compare all major playlist pitching services. SubmitHub, Groover, Playlist Push and alternatives reviewed.',
    heroText: 'Navigate the playlist pitching landscape',
    summary:
      'The playlist pitching market has many options with different approaches, costs, and results. This guide helps you choose the right service for your needs.',
    ourApproach:
      "totalaud.io doesn't charge per submission. We help you find playlist curators, plan your pitch strategy, and craft compelling approaches. You maintain the relationships.",
    theirApproach:
      'Traditional services charge per submission or campaign. You pay for access to their curator network and (sometimes) guaranteed responses.',
    features: [
      { name: 'Per-submission cost', totalaud: 'None', competitor: '$1-$3/each' },
      { name: 'Campaign minimums', totalaud: 'None', competitor: '$50-$500' },
      { name: 'Guaranteed responses', totalaud: false, competitor: 'Varies' },
      { name: 'Contact ownership', totalaud: true, competitor: false },
      { name: 'Campaign planning tools', totalaud: true, competitor: 'Rare' },
      { name: 'UK-specific curators', totalaud: true, competitor: 'Varies' },
      { name: 'Pitch writing help', totalaud: true, competitor: 'Rare' },
      { name: 'Timeline management', totalaud: true, competitor: false },
      { name: 'Flat monthly cost', totalaud: true, competitor: 'Rare' },
    ],
    bestFor: {
      us: [
        'Artists wanting flat-rate costs',
        'Those building long-term curator relationships',
        'UK-focused campaigns',
        'Organised workflow needs',
        'Budget-conscious artists',
      ],
      them: [
        'Fast, guaranteed feedback needs',
        'Hands-off promotion preferences',
        'Artists with marketing budget',
        'Quick campaign turnaround',
      ],
    },
    pricing: {
      us: 'From £5/month flat',
      them: '$1-3 per pitch or $50-500 per campaign',
    },
    verdict:
      'If you value ownership, organisation, and UK focus, totalaud.io fits best. If you need guaranteed fast responses and have budget, traditional services work well.',
    keywords: [
      'best playlist pitching service 2025',
      'playlist submission services',
      'spotify playlist promotion',
      'how to get on spotify playlists',
      'playlist pitching comparison',
    ],
  },
  {
    slug: 'music-promotion-tools',
    competitor: 'Music Promotion Tools',
    competitorUrl: '',
    title: 'Best Music Promotion Tools 2025: Complete Comparison',
    description:
      'Compare all major music promotion platforms. From playlist pitching to press outreach, find the right tools.',
    heroText: 'The music promotion tool landscape',
    summary:
      'The music promotion space has fragmented into many specialised tools. Understanding what each does helps you build the right stack.',
    ourApproach:
      'totalaud.io combines discovery, planning, and pitching in one calm workspace. Instead of juggling multiple tools, you have one place for your promotion workflow.',
    theirApproach:
      'Most tools specialise: SubmitHub for submissions, Hypeddit for smart links, DistroKid for distribution. You assemble your own stack from multiple platforms.',
    features: [
      { name: 'All-in-one workspace', totalaud: true, competitor: 'Varies' },
      { name: 'Contact discovery', totalaud: true, competitor: 'Some' },
      { name: 'Campaign planning', totalaud: true, competitor: 'Rare' },
      { name: 'Pitch writing', totalaud: true, competitor: 'Rare' },
      { name: 'Timeline tools', totalaud: true, competitor: 'Rare' },
      { name: 'Ideas organisation', totalaud: true, competitor: 'None' },
      { name: 'Smart links', totalaud: false, competitor: 'Some' },
      { name: 'Distribution', totalaud: false, competitor: 'Some' },
      { name: 'UK focus', totalaud: true, competitor: 'Varies' },
      { name: 'Calm UX', totalaud: true, competitor: 'Rare' },
    ],
    bestFor: {
      us: [
        'Artists wanting one workspace',
        'Those overwhelmed by tool fragmentation',
        'UK-focused promotion',
        'Organised, visual planners',
        'Long-term career focus',
      ],
      them: [
        'Specific tool needs (smart links, etc.)',
        'Existing workflow that works',
        'Very specific feature requirements',
      ],
    },
    pricing: {
      us: 'From £5/month',
      them: 'Varies ($0-$50+/month per tool)',
    },
    verdict:
      'If you want a unified, calm workspace focused on the promotion process, totalaud.io delivers. If you need specific features like smart links or distribution, you may need multiple tools.',
    keywords: [
      'best music promotion tools 2025',
      'music marketing software',
      'artist promotion platforms',
      'indie music marketing tools',
      'music promotion comparison',
    ],
  },
  {
    slug: 'submithub-alternatives',
    competitor: 'SubmitHub Alternatives',
    competitorUrl: '',
    title: 'Best SubmitHub Alternatives 2025',
    description:
      'Looking for SubmitHub alternatives? Compare Groover, Playlist Push, and other options for music submissions.',
    heroText: 'Beyond SubmitHub',
    summary:
      "SubmitHub isn't the only option for music promotion. Several alternatives offer different approaches, pricing, and features.",
    ourApproach:
      "totalaud.io takes a fundamentally different approach. Instead of paying per submission, you get tools to find contacts, plan campaigns, and craft pitches yourself. It's about building your own promotion capability.",
    theirApproach:
      'Most SubmitHub alternatives follow similar models: pay per submission or campaign, get access to curator networks, receive feedback.',
    features: [
      { name: 'No per-submission fees', totalaud: true, competitor: 'Varies' },
      { name: 'Contact discovery tools', totalaud: true, competitor: 'Rare' },
      { name: 'Campaign planning', totalaud: true, competitor: 'Rare' },
      { name: 'AI pitch assistance', totalaud: true, competitor: 'Rare' },
      { name: 'Guaranteed responses', totalaud: false, competitor: 'Some' },
      { name: 'Large curator network', totalaud: 'Growing', competitor: 'Established' },
      { name: 'UK-focused', totalaud: true, competitor: 'Varies' },
      { name: 'Relationship building', totalaud: true, competitor: 'Limited' },
      { name: 'Flat pricing', totalaud: true, competitor: 'Rare' },
    ],
    bestFor: {
      us: [
        'Artists tired of pay-per-submit',
        'Those wanting to build their own contacts',
        'UK-focused campaigns',
        'Budget-conscious artists',
        'Long-term relationship builders',
      ],
      them: [
        'Fast guaranteed feedback needs',
        'Established curator access',
        'Hands-off preferences',
      ],
    },
    pricing: {
      us: 'From £5/month',
      them: '$1-3 per credit or $50-500 per campaign',
    },
    verdict:
      "If you're frustrated with per-submission costs and want to build your own promotion system, totalaud.io offers a different path. If you value guaranteed responses, traditional alternatives still work.",
    keywords: [
      'submithub alternatives',
      'submithub alternatives 2025',
      'sites like submithub',
      'submithub competitors',
      'free submithub alternative',
    ],
  },
  {
    slug: 'groover-alternatives',
    competitor: 'Groover Alternatives',
    competitorUrl: '',
    title: 'Best Groover Alternatives 2025',
    description:
      'Looking for Groover alternatives? Compare playlist pitching and music submission platforms.',
    heroText: 'Options beyond Groover',
    summary:
      "Groover's credit system isn't for everyone. Several alternatives offer different approaches to connecting with curators and press.",
    ourApproach:
      "totalaud.io doesn't work like Groover at all. Instead of buying credits to submit to curators, you get tools to find contacts, plan your campaign, and craft pitches. You own the relationships.",
    theirApproach:
      'Most Groover alternatives follow similar credit-based or campaign-fee models. Some offer free tiers with limited features.',
    features: [
      { name: 'No credit system', totalaud: true, competitor: 'Varies' },
      { name: 'Contact discovery', totalaud: true, competitor: 'Rare' },
      { name: 'Campaign planning', totalaud: true, competitor: 'Rare' },
      { name: 'Pitch writing tools', totalaud: true, competitor: 'Rare' },
      { name: 'Guaranteed response', totalaud: false, competitor: 'Some' },
      { name: 'European focus', totalaud: 'UK', competitor: 'Varies' },
      { name: 'Flat monthly cost', totalaud: true, competitor: 'Rare' },
      { name: 'Relationship ownership', totalaud: true, competitor: 'Limited' },
    ],
    bestFor: {
      us: [
        'Artists frustrated with credit expiry',
        'UK-focused campaigns',
        'Budget predictability needs',
        'Long-term relationship builders',
        'DIY promotion approach',
      ],
      them: ['Guaranteed fast responses', 'Large curator network access', 'European market focus'],
    },
    pricing: {
      us: 'From £5/month',
      them: '€2 per credit or equivalent',
    },
    verdict:
      "If Groover's credit system frustrates you and you prefer building your own promotion capability, totalaud.io offers a fundamentally different approach.",
    keywords: [
      'groover alternatives',
      'groover alternatives 2025',
      'sites like groover',
      'groover competitors',
      'groover alternative uk',
    ],
  },

  // === SPECIFIC ALTERNATIVES ===
  {
    slug: 'distrokid-promotion',
    competitor: 'DistroKid',
    competitorUrl: 'distrokid.com',
    title: 'Music Promotion Beyond DistroKid: What You Need',
    description:
      'DistroKid handles distribution but not promotion. See what tools complement DistroKid for complete music marketing.',
    heroText: 'Distribution is just the start',
    summary:
      'DistroKid excels at music distribution but offers limited promotion tools. Most artists need additional platforms for discovery, pitching, and campaign management.',
    ourApproach:
      'totalaud.io complements DistroKid perfectly. Use DistroKid to get your music on platforms, then use totalaud.io to find opportunities, plan campaigns, and pitch contacts.',
    theirApproach:
      "DistroKid focuses on distribution: getting your music on Spotify, Apple Music, etc. They offer some promotional features but it's not their core focus.",
    features: [
      { name: 'Music distribution', totalaud: false, competitor: true },
      { name: 'Contact discovery', totalaud: true, competitor: false },
      { name: 'Campaign planning', totalaud: true, competitor: false },
      { name: 'Pitch writing', totalaud: true, competitor: false },
      { name: 'Spotify for Artists pitch', totalaud: 'Guide', competitor: true },
      { name: 'Pre-save pages', totalaud: false, competitor: true },
      { name: 'Timeline tools', totalaud: true, competitor: false },
      { name: 'UK-focused contacts', totalaud: true, competitor: false },
      { name: 'Ideas organisation', totalaud: true, competitor: false },
    ],
    bestFor: {
      us: [
        'DistroKid users needing promotion tools',
        'Campaign planning and organisation',
        'Contact discovery and pitching',
        'UK-focused promotion',
      ],
      them: [
        'Music distribution needs',
        'Multi-platform release',
        'Publishing administration',
        'Basic promotional features',
      ],
    },
    pricing: {
      us: 'From £5/month',
      them: 'From $22.99/year',
    },
    verdict:
      "These aren't competitors - they complement each other. Use DistroKid for distribution, totalaud.io for promotion. Many artists use both.",
    keywords: [
      'distrokid promotion tools',
      'distrokid marketing',
      'distrokid playlist pitching',
      'distrokid alternatives for promotion',
      'music promotion after distribution',
    ],
  },
  {
    slug: 'ditto-music',
    competitor: 'Ditto Music',
    competitorUrl: 'dittomusic.com',
    title: 'totalaud.io vs Ditto Music: Promotion Comparison',
    description:
      'Compare totalaud.io and Ditto Music for music promotion. See how promotion-focused tools compare to distributor add-ons.',
    heroText: 'Specialist vs all-in-one',
    summary:
      'Ditto Music offers distribution plus promotional add-ons. totalaud.io focuses purely on promotion tools - discovery, planning, and pitching.',
    ourApproach:
      "totalaud.io is 100% focused on the promotion process. We don't do distribution - we help you find opportunities, plan campaigns, and craft pitches.",
    theirApproach:
      'Ditto offers distribution with optional promotional services: playlist pitching, radio plugging, and press outreach as paid add-ons.',
    features: [
      { name: 'Music distribution', totalaud: false, competitor: true },
      { name: 'DIY contact discovery', totalaud: true, competitor: false },
      { name: 'Campaign planning', totalaud: true, competitor: false },
      { name: 'Pitch writing assistance', totalaud: true, competitor: false },
      { name: 'Done-for-you pitching', totalaud: false, competitor: 'Paid add-on' },
      { name: 'Radio plugging', totalaud: 'DIY tools', competitor: 'Paid service' },
      { name: 'Record label', totalaud: false, competitor: true },
      { name: 'Flat monthly cost', totalaud: true, competitor: 'Per-service' },
      { name: 'UK-based', totalaud: true, competitor: true },
    ],
    bestFor: {
      us: [
        'DIY promotion approach',
        'Budget-conscious artists',
        'Campaign planning needs',
        'Contact discovery and relationship building',
      ],
      them: [
        'All-in-one distribution + promotion',
        'Done-for-you promotional services',
        'Label service aspirations',
        'Hands-off promotion preference',
      ],
    },
    pricing: {
      us: 'From £5/month',
      them: 'Distribution from £19/year + services from £100+',
    },
    verdict:
      'Ditto suits artists wanting distribution and done-for-you promotion services. totalaud.io suits artists wanting to build their own promotion capability with better tools.',
    keywords: [
      'ditto music promotion',
      'ditto music review 2025',
      'ditto music alternatives',
      'ditto vs distrokid',
      'ditto music uk',
    ],
  },
  {
    slug: 'musosoup',
    competitor: 'Musosoup',
    competitorUrl: 'musosoup.com',
    title: 'totalaud.io vs Musosoup: PR Platform Comparison',
    description:
      'Compare totalaud.io and Musosoup for music PR and blog outreach. Different approaches to press coverage.',
    heroText: 'Two paths to press coverage',
    summary:
      'Musosoup connects artists directly with music journalists and bloggers. totalaud.io helps you discover, plan, and pitch to contacts yourself.',
    ourApproach:
      'totalaud.io gives you tools to find press contacts (Scout), plan your outreach (Timeline), and craft compelling pitches (Pitch). You build the relationships directly.',
    theirApproach:
      'Musosoup provides a platform where journalists browse and claim music to review. Artists upload tracks and wait to be discovered by writers.',
    features: [
      { name: 'Journalist browsing your music', totalaud: false, competitor: true },
      { name: 'Direct outreach tools', totalaud: true, competitor: false },
      { name: 'Contact discovery', totalaud: true, competitor: false },
      { name: 'Pitch writing help', totalaud: true, competitor: false },
      { name: 'Campaign planning', totalaud: true, competitor: false },
      { name: 'Per-review payment', totalaud: false, competitor: true },
      { name: 'Flat pricing', totalaud: true, competitor: false },
      { name: 'UK journalist focus', totalaud: true, competitor: 'Global' },
      { name: 'Timeline tools', totalaud: true, competitor: false },
    ],
    bestFor: {
      us: [
        'Proactive PR approach',
        'Budget predictability',
        'Building journalist relationships',
        'UK-focused press outreach',
        'Campaign organisation',
      ],
      them: [
        'Passive discovery by journalists',
        'Pay-per-review model',
        'Less outreach effort',
        'Global press coverage',
      ],
    },
    pricing: {
      us: 'From £5/month',
      them: 'Pay per coverage (varies)',
    },
    verdict:
      "Musosoup's passive model suits artists wanting journalists to come to them. totalaud.io suits artists wanting to proactively build relationships and control their PR.",
    keywords: [
      'musosoup alternative',
      'musosoup review 2025',
      'music blog submission',
      'music pr platforms',
      'how to get blog coverage',
    ],
  },
  {
    slug: 'indie-music-workspace',
    competitor: 'Indie Artist Alternatives',
    competitorUrl: '',
    title: 'The Best Workspace for Independent Artists 2025',
    description:
      'Compare workspaces and tools designed for independent artists. Find the right platform for your music career.',
    heroText: 'A workspace built for indie artists',
    summary:
      'Independent artists juggle many tools: spreadsheets for contacts, notes for ideas, calendars for timelines. A dedicated workspace brings everything together.',
    ourApproach:
      'totalaud.io combines four modes in one calm workspace: Ideas (capture and organise), Scout (discover opportunities), Timeline (plan visually), and Pitch (craft your story). Everything an indie artist needs, nothing overwhelming.',
    theirApproach:
      'Most artists cobble together multiple tools: Google Sheets for contacts, Notion for notes, spreadsheets for timelines, Word for pitches. Functional but fragmented.',
    features: [
      { name: 'Purpose-built for artists', totalaud: true, competitor: 'Varies' },
      { name: 'Ideas organisation', totalaud: true, competitor: 'Generic' },
      { name: 'Contact discovery', totalaud: true, competitor: 'Manual' },
      { name: 'Visual timeline', totalaud: true, competitor: 'Calendars' },
      { name: 'Pitch assistance', totalaud: true, competitor: 'None' },
      { name: 'Calm, focused UX', totalaud: true, competitor: 'Varies' },
      { name: 'UK industry focus', totalaud: true, competitor: 'None' },
      { name: 'Music-specific features', totalaud: true, competitor: 'Generic' },
      { name: 'All-in-one solution', totalaud: true, competitor: 'Fragmented' },
    ],
    bestFor: {
      us: [
        'Artists tired of tool fragmentation',
        'Visual, organised thinkers',
        'UK-focused careers',
        'Calm, focused workflow needs',
        'All-in-one workspace seekers',
      ],
      them: [
        'Existing workflows that work',
        'Very specific tool requirements',
        'Enterprise/team features',
      ],
    },
    pricing: {
      us: 'From £5/month',
      them: 'Free (fragmented) to $50+/month (multiple tools)',
    },
    verdict:
      "If you're tired of juggling multiple tools and want a purpose-built workspace for your music career, totalaud.io delivers. If your current system works, stick with it.",
    keywords: [
      'indie artist tools',
      'music career workspace',
      'independent artist software',
      'music planning tools',
      'artist organisation app',
    ],
  },
]

export function getComparisonBySlug(slug: string): ComparisonData | undefined {
  return comparisons.find((c) => c.slug === slug)
}

export function getAllComparisonSlugs(): string[] {
  return comparisons.map((c) => c.slug)
}
