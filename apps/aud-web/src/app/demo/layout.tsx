import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demos',
  description:
    'Watch how independent artists use totalaud.io to plan releases, develop ideas, and collaborate. Two short demos: Artist Journey and Liberty Pitch.',
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children
}
