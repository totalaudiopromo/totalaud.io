'use client'

/**
 * /demo/artist - Lana Glass Demo
 * Auto-playable cinematic demo with Director Mode
 */

import { DemoOrchestrator, useDemo } from '@/components/demo/DemoOrchestrator'
import { DirectorProvider } from '@/components/demo/director/DirectorProvider'
import { DemoOverlay } from '@/components/demo/DemoOverlay'
import { AmbientEngineProvider } from '@/components/ambient/AmbientEngineProvider'
import { DemoOSShell } from './DemoOSShell'

export default function ArtistDemoPage() {
  return (
    <AmbientEngineProvider>
      <DemoOrchestrator>
        <DirectorProvider>
          <DemoOSShellContainer />
        </DirectorProvider>
      </DemoOrchestrator>
    </AmbientEngineProvider>
  )
}

function DemoOSShellContainer() {
  return (
    <div className="relative min-h-screen bg-background">
      <DemoOSShell />
      <DemoOverlay />
    </div>
  )
}
