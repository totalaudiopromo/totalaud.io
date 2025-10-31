/**
 * Theme Tester Route
 *
 * Development-only route for testing theme personalities and FlowCore integration.
 * Accessible at /dev/theme during development.
 *
 * Phase 12.4: Theme Fusion - Interactive theme playground
 */

'use client'

import { ThemeTester } from '@/components/dev/ThemeTester'
import { ThemeProvider } from '@/contexts/ThemeContext'

export default function ThemeTestPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background p-8">
        <ThemeTester />
      </div>
    </ThemeProvider>
  )
}
