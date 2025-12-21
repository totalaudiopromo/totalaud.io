import { PageContainer } from '@/components/console/layout/PageContainer'
import { Skeleton } from '@/components/ui/Skeleton'

export default function ConsoleLoading() {
  return (
    <PageContainer>
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2 mb-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="space-y-6">
        {/* Navigator Panel Skeleton */}
        <Skeleton className="h-[200px] w-full" />

        {/* Main Grid: Snapshot + Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[300px] w-full" />
          <div className="lg:col-span-2">
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>

        {/* Patterns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[350px] w-full" />
          <Skeleton className="h-[350px] w-full" />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    </PageContainer>
  )
}
