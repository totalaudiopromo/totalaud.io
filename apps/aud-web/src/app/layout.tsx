import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { FlowCoreThemeProvider } from '@/providers/FlowCoreThemeProvider'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://totalaud.io'

export const metadata: Metadata = {
  title: {
    default: 'totalaud.io - Helping indie artists get heard',
    template: '%s | totalaud.io',
  },
  description:
    'Scout contacts, capture ideas, plan releases, craft pitches. One calm workspace for everything that matters to independent musicians.',
  keywords: [
    'music promotion',
    'indie artists',
    'playlist pitching',
    'radio plugging',
    'music PR',
    'release planning',
    'artist tools',
  ],
  authors: [{ name: 'Total Audio Promo' }],
  creator: 'Total Audio Promo',
  publisher: 'Total Audio Promo',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: siteUrl,
    siteName: 'totalaud.io',
    title: 'totalaud.io - Helping indie artists get heard',
    description:
      'Scout contacts, capture ideas, plan releases, craft pitches. One calm workspace for everything that matters.',
    images: [
      {
        url: '/brand/png/lockup-horizontal-cyan-4096.png',
        width: 4096,
        height: 1024,
        alt: 'totalaud.io - Calm creative workspace for independent artists',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'totalaud.io - Helping indie artists get heard',
    description:
      'Scout contacts, capture ideas, plan releases, craft pitches. One calm workspace for everything that matters.',
    images: ['/brand/png/lockup-horizontal-cyan-4096.png'],
    creator: '@totalaudiopromo',
  },
  icons: {
    icon: [
      { url: '/brand/favicon/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/brand/favicon/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/favicon/favicon-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/brand/favicon/favicon-128.png', sizes: '128x128', type: 'image/png' },
      { url: '/brand/favicon/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/brand/favicon/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/brand/favicon/favicon.ico',
    apple: '/brand/favicon/apple-touch-icon.png',
  },
  manifest: '/brand/favicon/site.webmanifest',
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0B0C',
  width: 'device-width',
  initialScale: 1,
  // Note: Removed maximumScale: 1 for WCAG 2.2 accessibility compliance
  // Users with visual impairments need to zoom the page
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <FlowCoreThemeProvider bodyClassName={`${geistSans.className} ${geistMono.className}`.trim()}>
        {children}
      </FlowCoreThemeProvider>
    </html>
  )
}
