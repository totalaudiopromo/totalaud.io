import { redirect } from 'next/navigation'

/**
 * Root page - redirects to console
 */
export const dynamic = 'force-dynamic'

export default function RootPage() {
  redirect('/console')
}
