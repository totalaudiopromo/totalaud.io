/**
 * Dynamic Sitemap Generation for totalaud.io
 * Generates sitemap.xml at build time for all static and pSEO pages
 *
 * Total pages generated:
 * - Static: ~10 pages
 * - Genres: 30+ pages
 * - Locations: 30+ pages
 * - Use-cases: 15+ pages
 * - Comparisons: 10+ pages
 * = 95+ indexed pages for SEO
 */

import { MetadataRoute } from 'next'
import { getAllGenreSlugs, getAllLocationSlugs, getAllUseCaseSlugs } from '@/lib/seo'
import { getAllComparisonSlugs } from '@/lib/seo/comparisons'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://totalaud.io'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/signup`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // pSEO index pages (hub pages)
  const indexPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/genre`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/location`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/for`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/compare`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  // Genre pSEO pages
  const genrePages: MetadataRoute.Sitemap = getAllGenreSlugs().map((slug) => ({
    url: `${siteUrl}/genre/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Location pSEO pages
  const locationPages: MetadataRoute.Sitemap = getAllLocationSlugs().map((slug) => ({
    url: `${siteUrl}/location/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Use-case pSEO pages
  const useCasePages: MetadataRoute.Sitemap = getAllUseCaseSlugs().map((slug) => ({
    url: `${siteUrl}/for/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Comparison pSEO pages (high priority for competitive keywords)
  const comparisonPages: MetadataRoute.Sitemap = getAllComparisonSlugs().map((slug) => ({
    url: `${siteUrl}/compare/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    ...staticPages,
    ...indexPages,
    ...genrePages,
    ...locationPages,
    ...useCasePages,
    ...comparisonPages,
  ]
}
