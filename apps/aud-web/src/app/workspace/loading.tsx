/**
 * Workspace Loading State
 *
 * Shows a skeleton while the workspace is loading.
 */

import { Skeleton } from '@/components/ui/Skeleton'

export default function WorkspaceLoading() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0F1113' }}>
      {/* Sidebar skeleton */}
      <div
        className="w-16 border-r flex flex-col items-center py-4 gap-3"
        style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="w-10 h-10 rounded-lg" />
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 p-6">
        {/* Toolbar skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="w-64 h-10 rounded-lg" />
          <Skeleton className="w-24 h-10 rounded-lg" />
          <div className="flex-1" />
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="w-10 h-10 rounded-lg" />
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
