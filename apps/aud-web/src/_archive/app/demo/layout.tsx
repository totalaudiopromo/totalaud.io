/**
 * Demo Layout
 *
 * Forces dynamic rendering for all demo pages to avoid build-time
 * errors when API keys aren't available.
 */

export const dynamic = 'force-dynamic'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
