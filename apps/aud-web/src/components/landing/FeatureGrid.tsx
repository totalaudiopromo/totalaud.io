/**
 * FeatureGrid Component
 * 2025 Brand Pivot - Feature cards grid
 *
 * Layout: 2x2 on desktop, single column on mobile
 */

'use client'

import { FeatureCard } from './FeatureCard'

const FEATURES = [
  {
    title: 'Scout',
    description:
      'Find radio contacts and playlist curators. Build targeted lists for your releases.',
  },
  {
    title: 'Ideas',
    description: 'Capture and organise your release ideas. A calm canvas for creative planning.',
  },
  {
    title: 'Timeline',
    description: 'Plan your release schedule visually. Drag and drop clips across five lanes.',
  },
  {
    title: 'Pitch',
    description: 'Craft your story with helpful prompts. Export polished pitches in seconds.',
  },
]

export function FeatureGrid() {
  return (
    <section
      className="px-4 sm:px-6"
      style={{
        paddingTop: '64px',
        paddingBottom: '96px',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      <div
        className="gap-4 sm:gap-6"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        }}
      >
        {FEATURES.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}
