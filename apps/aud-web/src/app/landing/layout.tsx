import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aud-web-production.up.railway.app'

export const metadata: Metadata = {
  title: 'totalaud.io - Creative control for artists',
  description: 'The creative workspace built from real promotion work. Now in private beta.',
  openGraph: {
    title: 'totalaud.io - Creative control for artists',
    description: 'The creative workspace built from real promotion work. Now in private beta.',
    url: `${siteUrl}/landing`,
    siteName: 'totalaud.io',
    images: [
      {
        url: `${siteUrl}/api/og/landing`,
        width: 1200,
        height: 630,
        alt: 'totalaud.io - Creative control for artists',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'totalaud.io - Creative control for artists',
    description: 'The creative workspace built from real promotion work. Now in private beta.',
    images: [`${siteUrl}/api/og/landing`],
  },
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return children
}
