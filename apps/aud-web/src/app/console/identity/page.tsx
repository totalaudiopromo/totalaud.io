'use client'

import Link from 'next/link'
import { PageContainer } from '@/components/console/layout/PageContainer'
import { SectionHeader } from '@/components/console/ui/SectionHeader'
import { Card } from '@/components/console/ui/Card'
import { Badge } from '@/components/console/ui/Badge'
import { useIdentity } from '@/hooks/useIntelligence'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'

export default function IdentityPage() {
  const { user, displayName } = useAuth()
  const { tier } = useSubscription()
  const artistSlug = displayName?.toLowerCase().replace(/\s+/g, '-') || 'unknown-artist'
  const { data: identity, isLoading } = useIdentity(artistSlug)

  if (isLoading) {
    return (
      <PageContainer>
        <SectionHeader title="identity kernel" description="what the workspace knows about you" />
        <Card>
          <p className="text-ta-grey lowercase">loading identity profile...</p>
        </Card>
      </PageContainer>
    )
  }

  if (!identity) {
    return (
      <PageContainer>
        <SectionHeader title="identity kernel" description="what the workspace knows about you" />
        <Card>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ta-grey uppercase tracking-wider">display name</span>
                <span className="text-sm text-ta-white">{displayName || 'not set'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ta-grey uppercase tracking-wider">email</span>
                <span className="text-sm text-ta-white">{user?.email || 'not available'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ta-grey uppercase tracking-wider">plan</span>
                <Badge variant="info">{tier || 'free'}</Badge>
              </div>
            </div>
            <div className="pt-3 border-t border-ta-panel/50">
              <Link href="/settings" className="text-sm text-ta-cyan hover:underline lowercase">
                account settings
              </Link>
            </div>
            <p className="text-sm text-ta-grey lowercase pt-2">
              your identity builds as you use the workspace. the more you create, the clearer it
              gets.
            </p>
          </div>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <SectionHeader title="identity kernel" description="what the workspace knows about you" />

      <div className="space-y-6">
        {/* Brand Voice */}
        <Card>
          <h3 className="text-lg font-semibold text-ta-white lowercase mb-4">brand voice</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-ta-grey uppercase tracking-wider mb-2">tone</p>
              <p className="text-sm text-ta-white lowercase">
                {identity.brandVoice?.tone || 'not set'}
              </p>
            </div>
            <div>
              <p className="text-xs text-ta-grey uppercase tracking-wider mb-2">themes</p>
              <div className="flex flex-wrap gap-2">
                {identity.brandVoice?.themes?.map((theme: string) => (
                  <Badge key={theme} variant="info">
                    {theme}
                  </Badge>
                )) || <span className="text-sm text-ta-grey">no themes set</span>}
              </div>
            </div>
          </div>
        </Card>

        {/* Scene Identity */}
        <Card>
          <h3 className="text-lg font-semibold text-ta-white lowercase mb-4">scene identity</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-ta-grey uppercase tracking-wider mb-2">primary scene</p>
              <Badge variant="success" size="md">
                {identity.sceneIdentity?.primaryScene || 'not set'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Bios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-ta-white lowercase mb-4">short bio</h3>
            <p className="text-sm text-ta-white lowercase leading-relaxed">
              {identity.bioShort || 'no short bio generated yet'}
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-ta-white lowercase mb-4">long bio</h3>
            <p className="text-sm text-ta-white lowercase leading-relaxed whitespace-pre-line">
              {identity.bioLong || 'no long bio generated yet'}
            </p>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
