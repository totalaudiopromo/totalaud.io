import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LoopOS - Intelligent Creative Operating System',
  description: 'A persistent, intelligent creative OS for music creators',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
