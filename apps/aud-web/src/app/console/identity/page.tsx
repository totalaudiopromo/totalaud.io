'use client'

import { PageContainer } from '@/components/console/layout/PageContainer'
import { SectionHeader } from '@/components/console/ui/SectionHeader'
import { Card } from '@/components/console/ui/Card'
import { Badge } from '@/components/console/ui/Badge'
import { useIdentity } from '@/hooks/useIntelligence'

export default function IdentityPage() {
  const artistSlug = 'current-artist'
  const { data: identity, isLoading } = useIdentity(artistSlug)

  if (isLoading) {
    return (
      <PageContainer>
        <SectionHeader title="identity kernel" description="your unified artist identity profile" />
        <Card>
          <p className="text-tap-grey lowercase">loading identity profile...</p>
        </Card>
      </PageContainer>
    )
  }

  if (!identity) {
    return (
      <PageContainer>
        <SectionHeader title="identity kernel" description="your unified artist identity profile" />
        <Card>
          <p className="text-tap-grey lowercase">
            no identity data available yet. start building your profile in pitch mode.
          </p>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <SectionHeader title="identity kernel" description="your unified artist identity profile" />

      <div className="space-y-6">
        {/* Brand Voice */}
        <Card>
          <h3 className="text-lg font-semibold text-tap-white lowercase mb-4">brand voice</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-tap-grey uppercase tracking-wider mb-2">tone</p>
              <p className="text-sm text-tap-white lowercase">
                {identity.brandVoice?.tone || 'not set'}
              </p>
            </div>
            <div>
              <p className="text-xs text-tap-grey uppercase tracking-wider mb-2">themes</p>
              <div className="flex flex-wrap gap-2">
                {identity.brandVoice?.themes?.map((theme: string) => (
                  <Badge key={theme} variant="info">
                    {theme}
                  </Badge>
                )) || <span className="text-sm text-tap-grey">no themes set</span>}
              </div>
            </div>
          </div>
        </Card>

        {/* Scene Identity */}
        <Card>
          <h3 className="text-lg font-semibold text-tap-white lowercase mb-4">scene identity</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-tap-grey uppercase tracking-wider mb-2">primary scene</p>
              <Badge variant="success" size="md">
                {identity.sceneIdentity?.primaryScene || 'not set'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Bios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-tap-white lowercase mb-4">short bio</h3>
            <p className="text-sm text-tap-white lowercase leading-relaxed">
              {identity.bioShort || 'no short bio generated yet'}
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-tap-white lowercase mb-4">long bio</h3>
            <p className="text-sm text-tap-white lowercase leading-relaxed whitespace-pre-line">
              {identity.bioLong || 'no long bio generated yet'}
            </p>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
