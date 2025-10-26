/**
 * Studio Dynamic Route
 *
 * Renders the appropriate Studio based on theme parameter
 * Route: /studio/[theme]
 *
 * Phase 6: OS Studio Refactor
 */

import { notFound } from 'next/navigation'
import {
  ASCIIStudio,
  XPStudio,
  AquaStudio,
  DAWStudio,
  AnalogueStudio,
} from '@aud-web/components/studios'

interface StudioPageProps {
  params: Promise<{
    theme: string
  }>
}

const VALID_THEMES = ['operator', 'guide', 'map', 'timeline', 'tape']

export function generateStaticParams() {
  return VALID_THEMES.map((theme) => ({
    theme,
  }))
}

export default async function StudioPage({ params }: StudioPageProps) {
  const { theme } = await params

  // Validate theme
  if (!VALID_THEMES.includes(theme)) {
    notFound()
  }

  // Render appropriate Studio
  switch (theme) {
    case 'operator':
      return <ASCIIStudio />
    case 'guide':
      return <XPStudio />
    case 'map':
      return <AquaStudio />
    case 'timeline':
      return <DAWStudio />
    case 'tape':
      return <AnalogueStudio />
    default:
      notFound()
  }
}

export const metadata = {
  title: 'Studio | TotalAud.io',
  description: 'Your creative AI workspace',
}
