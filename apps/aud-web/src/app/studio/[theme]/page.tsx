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
} from '@aud-web/components/Studios'

interface StudioPageProps {
  params: Promise<{
    theme: string
  }>
}

const VALID_THEMES = ['ascii', 'xp', 'aqua', 'daw', 'analogue']

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
    case 'ascii':
      return <ASCIIStudio />
    case 'xp':
      return <XPStudio />
    case 'aqua':
      return <AquaStudio />
    case 'daw':
      return <DAWStudio />
    case 'analogue':
      return <AnalogueStudio />
    default:
      notFound()
  }
}

export const metadata = {
  title: 'Studio | TotalAud.io',
  description: 'Your creative AI workspace',
}
