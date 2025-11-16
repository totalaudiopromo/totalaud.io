'use client'

/**
 * /demo/liberty - Liberty Music PR Campaign Demo
 * Auto-playable cinematic demo showing indie artist + Liberty PR workflow
 */

import { DemoOrchestrator } from '@/components/demo/DemoOrchestrator'
import { DirectorProvider } from '@/components/demo/director/DirectorProvider'
import { DemoOverlay } from '@/components/demo/DemoOverlay'
import { AmbientEngineProvider } from '@/components/ambient/AmbientEngineProvider'
import { LIBERTY_DIRECTOR_SCRIPT } from '@/components/demo/director/libertyDirectorScript'
import { LibertyDemoOSShell } from './LibertyDemoOSShell'

export default function LibertyDemoPage() {
  return (
    <AmbientEngineProvider>
      <DemoOrchestrator>
        <DirectorProvider script={LIBERTY_DIRECTOR_SCRIPT}>
          <LibertyDemoOSShellContainer />
        </DirectorProvider>
      </DemoOrchestrator>
    </AmbientEngineProvider>
  )
}

function LibertyDemoOSShellContainer() {
  return (
    <div className="relative min-h-screen bg-background">
      <LibertyDemoOSShell />
      <DemoOverlay />
    </div>
  )
}
