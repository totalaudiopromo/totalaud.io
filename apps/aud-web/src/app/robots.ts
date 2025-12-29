import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://totalaud.io'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/console/', '/workspace/', '/settings/', '/onboarding/', '/_archive/'],
      },
      {
        userAgent: 'GPTBot',
        allow: [
          '/',
          '/faq',
          '/genre/',
          '/location/',
          '/for/',
          '/resources/',
          '/pricing',
          '/features',
          '/about',
        ],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/', '/faq', '/genre/', '/location/', '/for/', '/resources/'],
      },
      {
        userAgent: 'Claude-Web',
        allow: ['/', '/faq', '/genre/', '/location/', '/for/', '/resources/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/faq', '/genre/', '/location/', '/for/', '/resources/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
