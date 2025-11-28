import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { FlowCoreThemeProvider } from '@/providers/FlowCoreThemeProvider'

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
  title: 'totalaud.io - Helping indie artists get heard',
  description:
    'Intelligent tools that simplify discovery, planning, pitching and creative direction for independent musicians.',
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
