import type { Metadata } from 'next'
import { LabelAuthGate } from '@/components/label/LabelAuthGate'
import { LabelShell } from '@/components/label/LabelShell'

export const metadata: Metadata = {
  title: 'Label OS — totalaud.io',
  robots: { index: false, follow: false },
}

export default function LabelLayout({ children }: { children: React.ReactNode }) {
  return (
    <LabelAuthGate>
      <LabelShell>{children}</LabelShell>
    </LabelAuthGate>
  )
}
