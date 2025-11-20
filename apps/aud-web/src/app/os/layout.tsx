/**
 * OS Routes Layout
 * Full-screen creative environment with no global UI
 * 
 * This layout provides:
 * - ThemeProvider context for Creative OS surfaces
 * - Full-screen container with no padding/margins
 * - Complete isolation from main app chrome
 */

'use client'

import { ThemeProvider } from '@total-audio/core-theme-engine'
import { OSTransitions } from '@/components/os/navigation'

export default function OSLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div
        className="fixed inset-0 p-0 m-0 w-screen h-screen overflow-hidden bg-black text-white"
        style={{
          isolation: 'isolate',
        }}
      >
        <OSTransitions>{children}</OSTransitions>
      </div>
    </ThemeProvider>
  )
}
