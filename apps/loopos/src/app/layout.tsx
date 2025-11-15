import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AppLayout } from '@/components/AppLayout'
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
  title: 'LoopOS - Creative Campaign Engine',
  description: 'Cinematic workflow system for music marketing campaigns',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={`${geistSans.className} antialiased`}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  )
}
