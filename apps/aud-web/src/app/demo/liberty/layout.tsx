import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Liberty Pitch Demo',
  description:
    'See how a UK indie campaign works with Liberty Music PR: from radio targets to press timeline to Total Audio Promo export. Built for small teams and PR agencies.',
}

export default function LibertyDemoLayout({ children }: { children: React.ReactNode }) {
  return children
}
