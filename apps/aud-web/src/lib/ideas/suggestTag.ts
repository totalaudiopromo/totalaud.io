/**
 * Tag Suggestion Utility
 *
 * DESSA Phase 3: Automation
 *
 * Suggests appropriate tags for ideas based on content using keyword matching.
 * Fast, local implementation - no AI API calls needed.
 */

import type { IdeaTag } from '@/stores/useIdeasStore'

/**
 * Suggest a tag based on idea content using keyword matching.
 *
 * @param content - The text content of the idea
 * @returns The suggested tag (content, brand, or promo)
 *
 * @example
 * suggestTag('Make a TikTok reel about the new single') // 'content'
 * suggestTag('Define my artist identity and vibe') // 'brand'
 * suggestTag('Email radio stations for airplay') // 'promo'
 */
export function suggestTag(content: string): IdeaTag {
  const lower = content.toLowerCase()

  // Content keywords (social, video, visual content creation)
  const contentKeywords = [
    'tiktok',
    'reel',
    'reels',
    'video',
    'clip',
    'content',
    'post',
    'instagram',
    'youtube',
    'shorts',
    'behind the scenes',
    'bts',
    'studio session',
    'recording session',
    'photo',
    'photography',
    'shoot',
    'film',
    'capture',
    'social media',
    'twitter',
    'facebook',
  ]

  // Brand keywords (identity, story, image, aesthetic)
  const brandKeywords = [
    'brand',
    'identity',
    'story',
    'image',
    'aesthetic',
    'vibe',
    'style',
    'look',
    'feel',
    'who i am',
    'about me',
    'bio',
    'description',
    'narrative',
    'artist statement',
    'persona',
    'character',
    'values',
    'mission',
    'vision',
    'voice',
    'tone',
    'personality',
  ]

  // Promo keywords (marketing, outreach, release planning)
  const promoKeywords = [
    'promo',
    'promote',
    'marketing',
    'outreach',
    'email',
    'pitch',
    'submit',
    'playlist',
    'radio',
    'press',
    'blog',
    'curator',
    'release',
    'launch',
    'campaign',
    'strategy',
    'plan',
    'reach',
    'audience',
    'fans',
    'contact',
    'network',
  ]

  // Check for content matches first (most specific)
  if (contentKeywords.some((kw) => lower.includes(kw))) {
    return 'content'
  }

  // Check for brand matches
  if (brandKeywords.some((kw) => lower.includes(kw))) {
    return 'brand'
  }

  // Check for promo matches
  if (promoKeywords.some((kw) => lower.includes(kw))) {
    return 'promo'
  }

  // Default to content for empty/ambiguous ideas
  // (This makes sense as most quick notes are content ideas)
  return 'content'
}
