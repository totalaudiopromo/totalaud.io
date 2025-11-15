/**
 * Root Layout
 * Global layout with session provider
 */

import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'LoopOS - Artist-Facing OS for Music Promotion',
  description: 'Deep ecosystem integration prep with authentication, sequencing, and momentum automation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0F1113',
              color: '#fff',
              border: '1px solid #3AA9BE',
            },
          }}
        />
      </body>
    </html>
  )
}
