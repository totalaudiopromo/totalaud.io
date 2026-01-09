'use client'

import { PageContainer } from '@/components/console/layout/PageContainer'
import { SectionHeader } from '@/components/console/ui/SectionHeader'
import { Tabbed, Tab } from '@/components/console/ui/Tabbed'
import { CorrelationList } from '@/components/console/intelligence/CorrelationList'
import { TrajectoryForecast } from '@/components/console/intelligence/TrajectoryForecast'
import { useCorrelations, useTrajectory } from '@/hooks/useIntelligence'
import { Card } from '@/components/console/ui/Card'

export default function InsightsPage() {
  const artistSlug = 'current-artist'

  const { data: correlations, isLoading: correlationsLoading } = useCorrelations(artistSlug)
  const { data: trajectory, isLoading: trajectoryLoading } = useTrajectory(artistSlug)

  const tabs: Tab[] = [
    {
      id: 'connections',
      label: 'connections',
      content: correlationsLoading ? (
        <Card>
          <p className="text-ta-grey lowercase">loading data...</p>
        </Card>
      ) : correlations ? (
        <CorrelationList
          correlations={correlations.correlations}
          highlights={correlations.highlights}
          recommendations={correlations.recommendations}
        />
      ) : (
        <Card>
          <p className="text-ta-grey lowercase">no data available</p>
        </Card>
      ),
    },
    {
      id: 'trajectory',
      label: 'trajectory',
      content: trajectoryLoading ? (
        <Card>
          <p className="text-ta-grey lowercase">loading trajectory...</p>
        </Card>
      ) : trajectory ? (
        <TrajectoryForecast
          forecast={trajectory.forecast}
          opportunityWindows={trajectory.opportunityWindows}
          riskIndicators={trajectory.riskIndicators}
          confidence={trajectory.confidence}
        />
      ) : (
        <Card>
          <p className="text-ta-grey lowercase">no trajectory data available</p>
        </Card>
      ),
    },
    {
      id: 'patterns',
      label: 'patterns',
      content: (
        <Card>
          <p className="text-sm text-ta-grey lowercase">
            pattern analysis available in main dashboard
          </p>
        </Card>
      ),
    },
    {
      id: 'next-steps',
      label: 'next steps',
      content: (
        <Card>
          <p className="text-sm text-ta-grey lowercase">coming soon</p>
        </Card>
      ),
    },
  ]

  return (
    <PageContainer>
      <SectionHeader title="overview" description="a look at your campaigns and creative work" />

      <Tabbed tabs={tabs} defaultTab="connections" />
    </PageContainer>
  )
}
