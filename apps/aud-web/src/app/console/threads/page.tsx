'use client'

import { PageContainer } from '@/components/console/layout/PageContainer'
import { SectionHeader } from '@/components/console/ui/SectionHeader'
import { Card } from '@/components/console/ui/Card'
import { Tabbed, Tab } from '@/components/console/ui/Tabbed'
import { NarrativeThreadView } from '@/components/console/intelligence/NarrativeThreadView'
import { useSignalThread } from '@/hooks/useIntelligence'
import { useAuth } from '@/hooks/useAuth'

export default function ThreadsPage() {
  const { displayName } = useAuth()
  const artistSlug = displayName?.toLowerCase().replace(/\s+/g, '-') || 'unknown-artist'

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
            no narrative thread yet. your story will build as you add ideas and create pitches.
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
            no campaign thread yet. start a campaign in pitch mode to track your outreach progress.
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
            no creative thread yet. add ideas in the workspace to build your creative timeline.
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
