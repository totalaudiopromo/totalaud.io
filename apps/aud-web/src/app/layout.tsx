/**
 * Root Layout
 * Phase 14: Updated with Toaster provider and enhanced metadata
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { ThemeResolver } from '@aud-web/components/themes/ThemeResolver'
import { GlobalCommandPalette } from '@aud-web/components/ui'
import { Analytics } from '@vercel/analytics/react'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { OnboardingProvider } from '@/contexts/OnboardingContext'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TotalAud.io — Campaign OS for Indie Artists & Music PRs',
  description:
    'Plan, Pitch and Track every release in one Flow-state workspace. Visualise agent workflows, automate contact research, and orchestrate campaigns with AI.',
  keywords: [
    'music promotion',
    'indie artists',
    'campaign management',
    'music pr',
    'contact research',
    'ai agents',
    'workflow automation',
  ],
  authors: [{ name: 'Total Audio Promo' }],
  creator: 'Total Audio Promo',
  publisher: 'Total Audio Promo',
  openGraph: {
    title: 'TotalAud.io — Campaign OS for Indie Artists',
    description: 'Plan, Pitch and Track every release in one Flow-state workspace.',
    url: 'https://totalaud.io',
    siteName: 'TotalAud.io',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TotalAud.io Campaign OS',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TotalAud.io — Campaign OS for Indie Artists',
    description: 'Plan, Pitch and Track every release in one Flow-state workspace.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content={flowCoreColours.matteBlack} />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <OnboardingProvider>
          <ThemeResolver>
            {children}
            <Suspense fallback={null}>
              <GlobalCommandPalette />
            </Suspense>
          </ThemeResolver>
        </OnboardingProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: flowCoreColours.darkGrey,
              color: flowCoreColours.textPrimary,
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              textTransform: 'lowercase',
            },
            success: {
              iconTheme: {
                primary: flowCoreColours.success,
                secondary: flowCoreColours.matteBlack,
              },
            },
            error: {
              iconTheme: {
                primary: flowCoreColours.error,
                secondary: flowCoreColours.matteBlack,
              },
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
