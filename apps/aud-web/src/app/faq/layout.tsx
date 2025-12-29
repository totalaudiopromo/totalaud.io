import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions',
  description:
    'Find answers to common questions about totalaud.io, music promotion, playlist pitching, and how to get your indie music heard.',
  openGraph: {
    title: 'FAQ - totalaud.io',
    description:
      'Find answers to common questions about totalaud.io and music promotion for independent artists.',
    type: 'website',
  },
  keywords: [
    'totalaud.io faq',
    'music promotion questions',
    'playlist pitching help',
    'indie artist faq',
    'how to promote music',
    'music marketing questions',
  ],
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
