import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LoopOS - Cinematic Creative Operating System',
  description: 'Agentic flow engine for artists and creators',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  )
}
