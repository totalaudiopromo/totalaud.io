/**
 * Global Error Boundary
 * Required by Next.js App Router
 * Catches errors in the root layout itself
 */

'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-8">
          <h1 className="text-2xl font-bold mb-4">Application Error</h1>
          <p className="text-gray-400 mb-6">{error.message}</p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
