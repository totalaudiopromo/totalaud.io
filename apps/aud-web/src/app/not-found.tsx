/**
 * Root Not Found Page
 * Required by Next.js App Router
 * Shown when a route doesn't exist
 */

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-400 mb-6">This page could not be found.</p>
      <Link
        href="/console"
        className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
      >
        Return to Console
      </Link>
    </div>
  )
}
