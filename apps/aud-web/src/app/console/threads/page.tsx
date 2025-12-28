'use client'

import { PageContainer } from '@/components/console/layout/PageContainer'
import { SectionHeader } from '@/components/console/ui/SectionHeader'
import { Card } from '@/components/console/ui/Card'
import { Tabbed, Tab } from '@/components/console/ui/Tabbed'
import { NarrativeThreadView } from '@/components/console/intelligence/NarrativeThreadView'
import { useSignalThread } from '@/hooks/useIntelligence'

export default function ThreadsPage() {
  const artistSlug = 'current-artist'

  const { data: narrativeThread, isLoading: narrativeLoading } = useSignalThread(
    artistSlug,
    'narrative'
  )
  const { data: campaignThread, isLoading: campaignLoading } = useSignalThread(
    artistSlug,
    'campaign'
  )
  const { data: creativeThread, isLoading: creativeLoading } = useSignalThread(
    artistSlug,
    'creative'
  )

  const tabs: Tab[] = [
    {
      id: 'narrative',
      label: 'narrative',
      content: narrativeLoading ? (
        <Card>
          <p className="text-ta-grey lowercase">loading narrative thread...</p>
        </Card>
      ) : narrativeThread ? (
        <NarrativeThreadView thread={narrativeThread} />
      ) : (
        <Card>
          <p className="text-ta-grey lowercase">
            no narrative thread available yet. your story will build as you use the platform.
          </p>
        </Card>
      ),
    },
    {
      id: 'campaign',
      label: 'campaign',
      content: campaignLoading ? (
        <Card>
          <p className="text-ta-grey lowercase">loading campaign thread...</p>
        </Card>
      ) : campaignThread ? (
        <NarrativeThreadView thread={campaignThread} />
      ) : (
        <Card>
          <p className="text-ta-grey lowercase">
            no campaign thread available yet. start a campaign to see your progress.
          </p>
        </Card>
      ),
    },
    {
      id: 'creative',
      label: 'creative',
      content: creativeLoading ? (
        <Card>
          <p className="text-ta-grey lowercase">loading creative thread...</p>
        </Card>
      ) : creativeThread ? (
        <NarrativeThreadView thread={creativeThread} />
      ) : (
        <Card>
          <p className="text-ta-grey lowercase">
            no creative thread available yet. add ideas to build your creative timeline.
          </p>
        </Card>
      ),
    },
  ]

  return (
    <PageContainer>
      <SectionHeader
        title="signal threads"
        description="narrative timelines connecting all your campaign events"
      />

      <Tabbed tabs={tabs} defaultTab="narrative" />
    </PageContainer>
  )
}
