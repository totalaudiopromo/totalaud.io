import type { Metadata } from 'next'
import { phases, items, totalItems, totalEstMinutes } from '@/lib/pre-flight-data'
import { PreFlightClient } from './PreFlightClient'

const SITE = 'https://totalaud.io'

export const metadata: Metadata = {
  title: 'Indie Release Pre-Flight Checklist — 47 things to check before you drop | totalaud.io',
  description:
    'Free, no-signup release checklist for indie artists. 47 things to check across the four weeks before release day. Click to mark off, optional save with a free workspace.',
  alternates: { canonical: `${SITE}/pre-flight` },
  openGraph: {
    title: 'Indie Release Pre-Flight Checklist — totalaud.io',
    description: 'The 47 things to check in the four weeks before you drop. Free, no signup.',
    url: `${SITE}/pre-flight`,
    type: 'website',
  },
}

export default function PreFlightPage() {
  const totalHours = Math.round((totalEstMinutes / 60) * 10) / 10

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Indie Release Pre-Flight Checklist',
    description:
      'A 47-item pre-release checklist for indie artists, organised across the four weeks before release day.',
    url: `${SITE}/pre-flight`,
    totalTime: `PT${Math.round(totalEstMinutes)}M`,
    step: phases.map((phase) => ({
      '@type': 'HowToSection',
      name: `${phase.label} (${phase.weekOffset})`,
      itemListElement: items
        .filter((i) => i.phase === phase.id)
        .map((item) => ({
          '@type': 'HowToStep',
          name: item.title,
          text: item.why,
        })),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PreFlightClient totalItems={totalItems} totalHours={totalHours} />
    </>
  )
}
