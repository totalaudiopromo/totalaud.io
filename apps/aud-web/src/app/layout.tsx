import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { FlowCoreThemeProvider } from '@/providers/FlowCoreThemeProvider'
import { CommandPaletteProvider } from '@/lib/palette/context'
import { CommandPalette } from '@/components/palette/CommandPalette'

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

export const metadata: Metadata = {
  title: {
    default: 'totalaud.io',
    template: '%s | totalaud.io',
  },
  description:
    'Creative tools for independent artists. A calm workspace for planning releases, exploring ideas, and using small helpful agents.',
  keywords: [
    'music production',
    'independent artists',
    'release planning',
    'creative tools',
    'artist workflow',
    'music industry',
  ],
  authors: [{ name: 'totalaud.io' }],
  creator: 'totalaud.io',
  publisher: 'totalaud.io',
  metadataBase: new URL('https://totalaud.io'),
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://totalaud.io',
    title: 'totalaud.io',
    description: 'Creative tools for independent artists.',
    siteName: 'totalaud.io',
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'totalaud.io',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'totalaud.io',
    description: 'Creative tools for independent artists.',
    images: ['/icon.svg'],
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  themeColor: '#0F1113',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <CommandPaletteProvider>
        <FlowCoreThemeProvider bodyClassName={`${geistSans.className} ${geistMono.className}`.trim()}>
          {children}
          <CommandPalette />
        </FlowCoreThemeProvider>
      </CommandPaletteProvider>
    </html>
  )
}
