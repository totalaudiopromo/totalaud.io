import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LoopOS - Your Creative Operating System',
  description: 'Notion meets Ableton meets AI for indie artists',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
