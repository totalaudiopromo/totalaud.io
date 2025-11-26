import type { Metadata } from 'next'
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

export const metadata: Metadata = {
  title: 'totalaud.io',
  description: 'FlowCore console for totalaud.io',
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
