import { MetadataRoute } from 'next'
import { getAllGenreSlugs, getAllLocationSlugs, getAllUseCaseSlugs } from '@/lib/seo'

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
      url: `${siteUrl}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/signup`,
      lastModified: now,
      changeFrequency: 'monthly',
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
    {
      url: `${siteUrl}/genre`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/location`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/for`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
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

  return [...staticPages, ...genrePages, ...locationPages, ...useCasePages]
}
