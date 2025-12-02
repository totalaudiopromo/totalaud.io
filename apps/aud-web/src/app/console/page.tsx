import { PageContainer } from '@/components/console/layout/PageContainer'
import { SectionHeader } from '@/components/console/ui/SectionHeader'
import { NavigatorPanel } from '@/components/console/dashboard/NavigatorPanel'
import { SnapshotCard } from '@/components/console/dashboard/SnapshotCard'
import { NextActionsList } from '@/components/console/dashboard/NextActionsList'
import { PatternsGrid } from '@/components/console/dashboard/PatternsGrid'
import { TrajectoryChart } from '@/components/console/dashboard/TrajectoryChart'
import { CoverageMapCard } from '@/components/console/dashboard/CoverageMapCard'
import { IdentitySummary } from '@/components/console/dashboard/IdentitySummary'
import { SignalThreadsMini } from '@/components/console/dashboard/SignalThreadsMini'
import { fetchDashboardData } from '@/lib/dashboard/fetchDashboardData'

export default async function ConsolePage() {
  // Fetch real data from Supabase (with fallback to empty state)
  const data = await fetchDashboardData()

  return (
    <PageContainer>
      <SectionHeader
        title="unified dashboard"
        description="comprehensive overview of your campaigns, contacts, and intelligence"
      />

      <div className="space-y-6">
        {/* AI Navigator */}
        <NavigatorPanel />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SnapshotCard data={data.snapshot} />
          <div className="lg:col-span-2">
            <NextActionsList actions={data.nextActions} />
          </div>
        </div>

        {/* Patterns */}
        <PatternsGrid patterns={data.patterns} />

        {/* Charts and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrajectoryChart data={data.trajectory} />
          <CoverageMapCard coverage={data.coverage} />
        </div>

        {/* Identity and Signals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IdentitySummary identity={data.identity} />
          <SignalThreadsMini events={data.signals} />
        </div>
      </div>
    </PageContainer>
  )
}
