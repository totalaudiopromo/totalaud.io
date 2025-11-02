/**
 * Operator Scene Route
 * Phase 14.3: Intelligent onboarding with cinematic boot sequence
 *
 * This page presents a cinematic "signal detection" flow before the console:
 * 1. Boot sequence animation
 * 2. Artist detection via Spotify API
 * 3. Contextual three-step form
 * 4. Campaign context capture
 * 5. Fade to console
 */

'use client'

import { OperatorScene } from '@/components/operator/OperatorScene'
import { ThemeResolver } from '@aud-web/components/themes/ThemeResolver'

export default function OperatorPage() {
  return (
    <ThemeResolver defaultTheme="operator">
      <OperatorScene />
    </ThemeResolver>
  )
}
