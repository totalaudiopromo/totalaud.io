import type { Metadata } from 'next'
import '@fontsource-variable/eb-garamond'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aud-web-production.up.railway.app'

export const metadata: Metadata = {
  title: 'totalaud.io - Campaigns that move like music',
  description:
    'Creative control for artists — built by someone who still sends their own emails. The creative workspace built from real promotion work.',
  openGraph: {
    title: 'totalaud.io - Campaigns that move like music',
    description:
      'Creative control for artists — built by someone who still sends their own emails.',
    url: `${siteUrl}/landing`,
    siteName: 'totalaud.io',
    images: [
      {
        url: `${siteUrl}/api/og/landing`,
        width: 1200,
        height: 630,
        alt: 'totalaud.io - Campaigns that move like music',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'totalaud.io - Campaigns that move like music',
    description:
      'Creative control for artists — built by someone who still sends their own emails.',
    images: [`${siteUrl}/api/og/landing`],
  },
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return children
}
