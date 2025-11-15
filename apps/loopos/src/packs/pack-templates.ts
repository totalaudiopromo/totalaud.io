/**
 * Creative Pack Templates
 * Pre-built packs for common creative workflows
 */

import type { DbCreativePack } from '@loopos/db'

type PackTemplate = Omit<DbCreativePack, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export const RELEASE_PACK: PackTemplate = {
  name: 'Release Pack',
  pack_type: 'release',
  description: 'Complete workflow for releasing a new single or EP',
  is_template: true,
  is_public: true,
  nodes: [
    {
      type: 'create',
      title: 'Finalize master',
      description: 'Get final master back from engineer',
      friction: 10,
      priority: 100,
      time_start: 0,
      duration: 86400, // 1 day in seconds
    },
    {
      type: 'create',
      title: 'Commission artwork',
      description: 'Hire designer or create artwork',
      friction: 30,
      priority: 90,
      time_start: 0,
      duration: 259200, // 3 days
    },
    {
      type: 'promote',
      title: 'Distribute to DSPs',
      description: 'Upload to Distrokid/Tunecore/etc',
      friction: 15,
      priority: 95,
      time_start: 345600, // 4 days
      duration: 86400,
    },
    {
      type: 'promote',
      title: 'Pitch to playlists',
      description: 'Submit to Spotify editorial + independent curators',
      friction: 40,
      priority: 85,
      time_start: 432000, // 5 days
      duration: 172800, // 2 days
    },
    {
      type: 'promote',
      title: 'Social announcement',
      description: 'Create announcement posts for Instagram/TikTok',
      friction: 20,
      priority: 80,
      time_start: 518400, // 6 days
      duration: 86400,
    },
    {
      type: 'analyse',
      title: 'Review first week stats',
      description: 'Analyse streams, saves, playlist adds',
      friction: 5,
      priority: 70,
      time_start: 1209600, // 14 days (after release)
      duration: 43200, // 12 hours
    },
  ],
  sequences: [
    {
      name: 'Pre-release sequence',
      steps: ['Finalize master', 'Commission artwork', 'Distribute to DSPs'],
    },
    {
      name: 'Launch sequence',
      steps: ['Pitch to playlists', 'Social announcement'],
    },
  ],
  notes: [
    'Timeline is 2 weeks pre-release to 2 weeks post-release',
    'Adjust dates based on your distribution deadline',
    'Add PR outreach if you have budget',
  ],
  micro_actions: [
    'Create Spotify Canvas',
    'Update bio on all platforms',
    'Prepare Instagram story templates',
    'Write press release',
    'Update press kit',
  ],
  insights: [
    'Most independent releases need 2-4 weeks lead time for playlist consideration',
    'Artwork should be 3000x3000px minimum',
    'Consider pre-save campaigns to boost first week numbers',
  ],
  ai_prompts: {
    generate_promo_copy:
      'Generate compelling social media copy for a [GENRE] release about [THEME]. Include 3 Instagram captions, 2 TikTok hooks, and 1 press quote.',
    generate_playlist_pitch:
      'Write a professional playlist pitch email for a [GENRE] track. Emphasise [UNIQUE_SELLING_POINTS].',
  },
  metadata: {
    estimated_duration_days: 28,
    difficulty: 'intermediate',
    requires_budget: true,
  },
}

export const PROMO_PACK: PackTemplate = {
  name: 'Promo Pack',
  pack_type: 'promo',
  description: 'Promotional campaign for existing release',
  is_template: true,
  is_public: true,
  nodes: [
    {
      type: 'promote',
      title: 'Create promo video',
      description: 'Short-form video for TikTok/Reels',
      friction: 35,
      priority: 90,
      time_start: 0,
      duration: 172800, // 2 days
    },
    {
      type: 'promote',
      title: 'Reach out to micro-influencers',
      description: 'DM 20-30 relevant creators',
      friction: 45,
      priority: 85,
      time_start: 172800,
      duration: 259200, // 3 days
    },
    {
      type: 'promote',
      title: 'Run Meta ads campaign',
      description: 'Test £50-100 budget on Instagram/Facebook',
      friction: 50,
      priority: 75,
      time_start: 259200,
      duration: 604800, // 7 days
    },
    {
      type: 'analyse',
      title: 'Analyse campaign performance',
      description: 'Review engagement, reach, conversions',
      friction: 10,
      priority: 80,
      time_start: 863400,
      duration: 43200,
    },
  ],
  sequences: [
    {
      name: 'Promo sequence',
      steps: ['Create promo video', 'Reach out to micro-influencers', 'Run Meta ads campaign', 'Analyse campaign performance'],
    },
  ],
  notes: [
    'Focus on short-form video content',
    'Influencer outreach works best with genuine connections',
    'Test ads with small budget before scaling',
  ],
  micro_actions: [
    'Create 5 video hooks',
    'List 50 relevant creators',
    'Design ad creative',
    'Set up pixel tracking',
    'Create lookalike audiences',
  ],
  insights: [
    'Video content gets 3-5x more engagement than static posts',
    'Micro-influencers (1k-10k) often have better engagement rates',
    'Test multiple ad variations to find what resonates',
  ],
  ai_prompts: {
    generate_video_hooks: 'Generate 10 attention-grabbing hooks for a [GENRE] promo video. Each should be 3-5 words.',
    generate_dm_template:
      'Write a friendly, non-spammy DM template for reaching out to music creators about collaborating on [TRACK_NAME].',
  },
  metadata: {
    estimated_duration_days: 14,
    difficulty: 'intermediate',
    requires_budget: true,
  },
}

export const AUDIENCE_GROWTH_PACK: PackTemplate = {
  name: 'Audience Growth Pack',
  pack_type: 'audience-growth',
  description: '30-day plan to grow engaged fanbase',
  is_template: true,
  is_public: true,
  nodes: [
    {
      type: 'create',
      title: 'Create content calendar',
      description: '30 days of planned posts',
      friction: 25,
      priority: 100,
      time_start: 0,
      duration: 86400,
    },
    {
      type: 'promote',
      title: 'Post daily to TikTok/Reels',
      description: 'Consistent daily content',
      friction: 60,
      priority: 95,
      time_start: 86400,
      duration: 2592000, // 30 days
    },
    {
      type: 'promote',
      title: 'Engage with community',
      description: '30 minutes daily commenting/DMing',
      friction: 40,
      priority: 85,
      time_start: 86400,
      duration: 2592000,
    },
    {
      type: 'analyse',
      title: 'Weekly growth review',
      description: 'Track followers, engagement, best posts',
      friction: 15,
      priority: 75,
      time_start: 604800, // Every 7 days
      duration: 43200,
    },
  ],
  sequences: [
    {
      name: 'Growth loop',
      steps: ['Create content calendar', 'Post daily to TikTok/Reels', 'Engage with community', 'Weekly growth review'],
    },
  ],
  notes: [
    'Consistency is key - don\'t skip days',
    'Engagement matters more than follower count',
    'Adjust strategy based on weekly reviews',
  ],
  micro_actions: [
    'Batch create 7 videos on Sunday',
    'Reply to every comment',
    'DM 10 new creators daily',
    'Share behind-the-scenes content',
    'Host Q&A sessions weekly',
  ],
  insights: [
    'Daily posting increases algorithm favour',
    'Engaging with others\' content drives discovery',
    'Authentic personality beats polished perfection',
  ],
  ai_prompts: {
    generate_content_ideas:
      'Generate 30 content ideas for a [GENRE] artist. Mix behind-the-scenes, music snippets, and personality content.',
    generate_engagement_prompts:
      'Create 15 engaging question prompts I can ask my audience to boost comments and DMs.',
  },
  metadata: {
    estimated_duration_days: 30,
    difficulty: 'advanced',
    requires_budget: false,
  },
}

export const CREATIVE_SPRINT_PACK: PackTemplate = {
  name: 'Creative Sprint Pack',
  pack_type: 'creative-sprint',
  description: '7-day intensive creative output sprint',
  is_template: true,
  is_public: true,
  nodes: [
    {
      type: 'create',
      title: 'Day 1: Ideation',
      description: 'Generate 10 track ideas/concepts',
      friction: 20,
      priority: 100,
      time_start: 0,
      duration: 86400,
    },
    {
      type: 'create',
      title: 'Day 2-3: Rough sketches',
      description: 'Create 5 rough demos',
      friction: 40,
      priority: 95,
      time_start: 86400,
      duration: 172800,
    },
    {
      type: 'create',
      title: 'Day 4-5: Refine best ideas',
      description: 'Develop 2 strongest concepts',
      friction: 50,
      priority: 90,
      time_start: 259200,
      duration: 172800,
    },
    {
      type: 'refine',
      title: 'Day 6: Polish and arrange',
      description: 'Complete arrangement for 1 track',
      friction: 45,
      priority: 85,
      time_start: 431800,
      duration: 86400,
    },
    {
      type: 'analyse',
      title: 'Day 7: Review and plan',
      description: 'Reflect on output, plan next steps',
      friction: 10,
      priority: 70,
      time_start: 518400,
      duration: 43200,
    },
  ],
  sequences: [
    {
      name: 'Sprint sequence',
      steps: ['Day 1: Ideation', 'Day 2-3: Rough sketches', 'Day 4-5: Refine best ideas', 'Day 6: Polish and arrange', 'Day 7: Review and plan'],
    },
  ],
  notes: [
    'Block calendar - no meetings during sprint',
    'Turn off notifications',
    'Quantity over quality in early days',
    'Reserve judgement until review day',
  ],
  micro_actions: [
    'Set up dedicated project folder',
    'Prepare template sessions',
    'Stock up on snacks',
    'Create "Do Not Disturb" routine',
    'Set 90-minute focus timers',
  ],
  insights: [
    'Creative sprints break perfectionism patterns',
    'Volume of output leads to quality discoveries',
    'Time constraints force decisive action',
  ],
  ai_prompts: {
    generate_prompts: 'Generate 20 creative prompts for [GENRE] music production. Focus on experimental approaches.',
    generate_feedback:
      'Provide constructive feedback on this demo: [DESCRIPTION]. Suggest 3 ways to develop it further.',
  },
  metadata: {
    estimated_duration_days: 7,
    difficulty: 'intermediate',
    requires_budget: false,
  },
}

export const SOCIAL_ACCELERATOR_PACK: PackTemplate = {
  name: 'Social Accelerator Pack',
  pack_type: 'social-accelerator',
  description: 'Rapid social media growth tactics',
  is_template: true,
  is_public: true,
  nodes: [
    {
      type: 'create',
      title: 'Create viral hook template',
      description: 'Design reusable 3-second hook format',
      friction: 30,
      priority: 100,
      time_start: 0,
      duration: 86400,
    },
    {
      type: 'promote',
      title: 'Post 3x daily for 7 days',
      description: 'Test hook variations at peak times',
      friction: 70,
      priority: 95,
      time_start: 86400,
      duration: 604800,
    },
    {
      type: 'analyse',
      title: 'Identify winning format',
      description: 'Find highest performing variation',
      friction: 15,
      priority: 90,
      time_start: 691200,
      duration: 43200,
    },
    {
      type: 'promote',
      title: 'Double down on winner',
      description: 'Create 20 variations of best hook',
      friction: 50,
      priority: 85,
      time_start: 734400,
      duration: 259200,
    },
  ],
  sequences: [
    {
      name: 'Acceleration sequence',
      steps: ['Create viral hook template', 'Post 3x daily for 7 days', 'Identify winning format', 'Double down on winner'],
    },
  ],
  notes: [
    'Speed is essential - iterate fast',
    'Don\'t overthink - test and learn',
    'Viral content is about pattern recognition',
  ],
  micro_actions: [
    'Study 50 viral videos in your niche',
    'Extract common patterns',
    'Create posting schedule',
    'Set up analytics tracking',
    'Prepare batch filming setup',
  ],
  insights: [
    'First 3 seconds determine 80% of performance',
    'Pattern recognition beats originality for reach',
    'Volume + velocity = visibility',
  ],
  ai_prompts: {
    generate_hooks:
      'Analyse these viral music creator videos and extract 10 hook patterns I can adapt: [VIDEO_EXAMPLES]',
    optimise_for_algorithm:
      'Suggest 5 ways to optimise this video for TikTok algorithm based on current trends.',
  },
  metadata: {
    estimated_duration_days: 14,
    difficulty: 'advanced',
    requires_budget: false,
  },
}

export const PRESS_PR_PACK: PackTemplate = {
  name: 'Press & PR Pack',
  pack_type: 'press-pr',
  description: 'DIY press campaign for independent artists',
  is_template: true,
  is_public: true,
  nodes: [
    {
      type: 'create',
      title: 'Update press kit',
      description: 'Bio, photos, streaming links, press quotes',
      friction: 35,
      priority: 100,
      time_start: 0,
      duration: 172800,
    },
    {
      type: 'promote',
      title: 'Research target blogs/podcasts',
      description: 'Find 50 relevant outlets',
      friction: 40,
      priority: 95,
      time_start: 172800,
      duration: 259200,
    },
    {
      type: 'promote',
      title: 'Craft personalized pitches',
      description: 'Write custom emails for top 20 targets',
      friction: 55,
      priority: 90,
      time_start: 431800,
      duration: 259200,
    },
    {
      type: 'promote',
      title: 'Send pitches + follow up',
      description: 'Email campaign with 1 follow-up',
      friction: 45,
      priority: 85,
      time_start: 691200,
      duration: 604800,
    },
    {
      type: 'analyse',
      title: 'Track coverage',
      description: 'Monitor responses and published features',
      friction: 10,
      priority: 70,
      time_start: 1296000,
      duration: 86400,
    },
  ],
  sequences: [
    {
      name: 'PR sequence',
      steps: ['Update press kit', 'Research target blogs/podcasts', 'Craft personalized pitches', 'Send pitches + follow up', 'Track coverage'],
    },
  ],
  notes: [
    'Personalization is critical - no mass emails',
    'Research what each outlet covers',
    'Build relationships, not just transactions',
  ],
  micro_actions: [
    'Get professional press photos',
    'Write 3 different bio lengths',
    'Collect existing press quotes',
    'Create pitch email template',
    'Set up press tracking spreadsheet',
  ],
  insights: [
    'Music blogs prefer exclusive premieres',
    'Podcasts want interesting stories, not just promo',
    '10-15% response rate is typical for cold pitches',
  ],
  ai_prompts: {
    generate_pitch:
      'Write a personalized pitch email for [BLOG_NAME] about my [GENRE] release. Their recent coverage includes [EXAMPLES].',
    generate_bio:
      'Create 3 press bio versions (50/150/300 words) for a [GENRE] artist. Focus on [UNIQUE_ANGLE].',
  },
  metadata: {
    estimated_duration_days: 21,
    difficulty: 'advanced',
    requires_budget: false,
  },
}

export const TIKTOK_MOMENTUM_PACK: PackTemplate = {
  name: 'TikTok Momentum Pack',
  pack_type: 'tiktok-momentum',
  description: 'Build TikTok following from zero',
  is_template: true,
  is_public: true,
  nodes: [
    {
      type: 'analyse',
      title: 'Find your niche angle',
      description: 'Research gaps in music creator content',
      friction: 25,
      priority: 100,
      time_start: 0,
      duration: 86400,
    },
    {
      type: 'create',
      title: 'Batch create 21 videos',
      description: 'One week of 3/day content',
      friction: 65,
      priority: 95,
      time_start: 86400,
      duration: 259200,
    },
    {
      type: 'promote',
      title: 'Post 3x daily for 7 days',
      description: 'Consistent posting schedule',
      friction: 40,
      priority: 90,
      time_start: 345600,
      duration: 604800,
    },
    {
      type: 'promote',
      title: 'Engage 1 hour daily',
      description: 'Comment on trending videos in niche',
      friction: 35,
      priority: 85,
      time_start: 345600,
      duration: 604800,
    },
    {
      type: 'analyse',
      title: 'Analyse what worked',
      description: 'Review analytics, double down on winners',
      friction: 15,
      priority: 80,
      time_start: 950400,
      duration: 43200,
    },
  ],
  sequences: [
    {
      name: 'TikTok sequence',
      steps: ['Find your niche angle', 'Batch create 21 videos', 'Post 3x daily for 7 days', 'Engage 1 hour daily', 'Analyse what worked'],
    },
  ],
  notes: [
    'TikTok rewards consistency and velocity',
    'Engagement with others is critical for discovery',
    'Don\'t delete "flops" - they feed the algorithm',
  ],
  micro_actions: [
    'Set up ring light and background',
    'Create batch filming routine',
    'Study 100 videos in your niche',
    'Make list of trending sounds',
    'Plan posting times based on analytics',
  ],
  insights: [
    'First 1000 followers are hardest - then momentum builds',
    'Niche down 3x more than you think',
    'Your worst video might go viral - keep posting',
  ],
  ai_prompts: {
    generate_content_pillars:
      'Create 5 content pillars for a [GENRE] artist on TikTok. Each pillar should have 10 specific video ideas.',
    analyse_trends:
      'What are the current trending formats in music creator TikTok? Give me 5 formats I can adapt today.',
  },
  metadata: {
    estimated_duration_days: 14,
    difficulty: 'intermediate',
    requires_budget: false,
  },
}

export const ALL_PACK_TEMPLATES: PackTemplate[] = [
  RELEASE_PACK,
  PROMO_PACK,
  AUDIENCE_GROWTH_PACK,
  CREATIVE_SPRINT_PACK,
  SOCIAL_ACCELERATOR_PACK,
  PRESS_PR_PACK,
  TIKTOK_MOMENTUM_PACK,
]
