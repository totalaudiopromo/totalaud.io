import { redirect } from 'next/navigation'

/**
 * Root page - redirects to console
 */
export default function RootPage() {
  redirect('/console')
}
