import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to dashboard (will handle auth there)
  redirect('/dashboard')
}
