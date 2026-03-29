import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://totalaud.io'

/**
 * Robots.txt configuration with AI Engine Optimisation (AEO)
 *
 * Strategy:
 * - Allow retrieval bots that cite content (ChatGPT, Perplexity, Google AI, Apple)
 * - Block training bots that scrape without attribution
 * - Expose pSEO sections to all allowed bots
 * - Reference llms.txt for structured AI consumption
 */
export default function robots(): MetadataRoute.Robots {
  // Public pSEO + marketing sections that AI bots should index
  const publicSections = [
    '/',
    '/faq',
    '/pricing',
    '/compare/',
    '/genre/',
    '/location/',
    '/for/',
    '/notes/',
    '/terms',
    '/privacy',
    '/llms.txt',
  ]

  // Protected app sections
  const protectedSections = [
    '/api/',
    '/console/',
    '/workspace/',
    '/settings/',
    '/onboarding/',
    '/_archive/',
  ]

  return {
    rules: [
      // Default: allow public pages, block app sections
      {
        userAgent: '*',
        allow: '/',
        disallow: protectedSections,
      },

      // --- Retrieval bots (cite content, drive traffic) --- ALLOW ---
      {
        userAgent: 'ChatGPT-User',
        allow: publicSections,
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: publicSections,
      },
      {
        userAgent: 'PerplexityBot',
        allow: publicSections,
      },
      {
        userAgent: 'Google-Extended',
        allow: publicSections,
      },
      {
        userAgent: 'Applebot-Extended',
        allow: publicSections,
      },

      // --- Training bots (scrape without attribution) --- BLOCK ---
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'ClaudeBot',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/'],
      },
      {
        userAgent: 'cohere-ai',
        disallow: ['/'],
      },
      {
        userAgent: 'FacebookBot',
        disallow: ['/'],
      },
      {
        userAgent: 'Bytespider',
        disallow: ['/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
