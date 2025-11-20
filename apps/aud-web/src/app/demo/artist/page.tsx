'use client'

import OSLayout from '@/app/os/layout'
import AnalogueOSPage from '@/app/os/analogue/page'
import AsciiOSPage from '@/app/os/ascii/page'
import XPOSPage from '@/app/os/xp/page'
import LoopOSPage from '@/app/os/loopos/page'
import AquaOSPage from '@/app/os/aqua/page'
import { DemoOrchestrator, useDemo } from '@/components/demo/DemoOrchestrator'
import { DemoCameraContainer } from '@/components/demo/DemoCameraContainer'
import { NarrativeProvider } from '@/components/narrative/NarrativeEngine'

function DemoOSShell() {
  const { activeStep } = useDemo()

  const os = activeStep.os

  let surface: React.ReactNode = null

  if (os === 'analogue') {
    surface = <AnalogueOSPage />
  } else if (os === 'ascii') {
    surface = <AsciiOSPage />
  } else if (os === 'xp') {
    surface = <XPOSPage />
  } else if (os === 'loopos') {
    surface = <LoopOSPage />
  } else if (os === 'aqua') {
    surface = <AquaOSPage />
  }

  return (
    <OSLayout>
      <DemoCameraContainer>{surface}</DemoCameraContainer>
    </OSLayout>
  )
}

export default function ArtistDemoPage() {
  return (
    <NarrativeProvider>
      <DemoOrchestrator>
        <DemoOSShell />
      </DemoOrchestrator>
    </NarrativeProvider>
  )
}


