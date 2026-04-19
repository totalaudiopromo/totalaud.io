import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset password — totalaud.io',
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
