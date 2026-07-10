'use client'

/**
 * Full-shell loading skeleton shown while the auth gate checks the session
 * and the first labels load.
 */
export function LabelLoadingSkeleton() {
  return (
    <div className="flex min-h-screen bg-ta-black">
      {/* Rail */}
      <div className="hidden md:flex w-64 flex-col gap-3 border-r border-ta-border p-4">
        <div className="h-9 bg-white/[0.04] rounded-ta-sm animate-pulse" />
        <div className="mt-4 flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 bg-white/[0.03] rounded-ta-sm animate-pulse" />
          ))}
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 p-8 flex flex-col gap-4">
        <div className="h-8 w-64 bg-white/[0.04] rounded-ta-sm animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/[0.03] rounded-ta animate-pulse" />
          ))}
        </div>
        <div className="flex-1 bg-white/[0.02] rounded-ta animate-pulse" />
      </div>
    </div>
  )
}
