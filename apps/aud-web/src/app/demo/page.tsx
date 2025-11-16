/**
 * Demo Mode Route
 * Phase 13E: Hero Demo Mode
 *
 * Fullscreen cinematic demo showcasing all system features
 */

'use client'

import { DemoModePlayer } from '@aud-web/components/demo/DemoModePlayer'
import { getDemoScript } from './demoScript'

export default function DemoPage() {
  const demoScript = getDemoScript()

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#0F1113',
        overflow: 'hidden',
      }}
    >
      <DemoModePlayer script={demoScript} />
    </div>
  )
}
