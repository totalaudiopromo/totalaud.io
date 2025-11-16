/**
 * Performance Mode Page
 * Phase 16: Live Performance Mode - Full-screen cinematic visualization
 */

'use client'

import { PerformanceCanvas } from '@aud-web/components/performance/PerformanceCanvas'

export default function PerformancePage() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#000000',
      }}
    >
      <PerformanceCanvas />
    </div>
  )
}
