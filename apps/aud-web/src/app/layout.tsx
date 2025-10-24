import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeResolver } from '@aud-web/components/themes/ThemeResolver'
import { GlobalCommandPalette } from '@aud-web/components/GlobalCommandPalette'
import { ErrorBoundary } from '@aud-web/components/ErrorBoundary'

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
  title: 'totalaud.io',
  description: 'Marketing your music should be as creative as making it.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ErrorBoundary>
          <ThemeResolver>
            {children}
            <Suspense fallback={null}>
              <GlobalCommandPalette />
            </Suspense>
          </ThemeResolver>
        </ErrorBoundary>
      </body>
    </html>
  )
}
