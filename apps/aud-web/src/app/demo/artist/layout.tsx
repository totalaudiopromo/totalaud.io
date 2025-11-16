import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Artist Journey Demo',
  description:
    'Follow Lana Glass from handwritten ideas to agent-suggested plans, timeline builds, and coach feedback. See how independent artists use totalaud.io.',
}

export default function ArtistDemoLayout({ children }: { children: React.ReactNode }) {
  return children
}
