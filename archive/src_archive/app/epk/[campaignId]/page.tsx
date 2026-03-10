/**
 * Public EPK Page
 * Phase 15.2-D: Full Agent UI Integration
 *
 * Purpose:
 * - Public-facing electronic press kit
 * - Showcases campaign assets (audio, images, documents)
 * - Shareable link for media contacts
 * - Sections: Hero, Featured Track, Gallery, Press Materials, Contact
 *
 * Route: /epk/[campaignId]
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EPKClient } from './EPKClient'
import { getEpkCampaign } from '@/lib/epk/getEpkCampaign'

interface EPKPageProps {
  params: {
    campaignId: string
  }
}

/**
 * Generate metadata for SEO and social sharing
 */
export async function generateMetadata({ params }: EPKPageProps): Promise<Metadata> {
  const { campaignId } = params
  const campaign = await getEpkCampaign(campaignId)

  if (!campaign) {
    return {
      title: 'Electronic Press Kit',
      description: 'Live campaign press assets powered by TotalAud.io.',
    }
  }

  const description =
    campaign.tagline ??
    campaign.description?.slice(0, 140) ??
    `Electronic press kit for ${campaign.name}.`

  return {
    title: `${campaign.name} | ${campaign.artistName}`,
    description,
    openGraph: {
      title: `${campaign.name} | ${campaign.artistName}`,
      description,
      images: [
        {
          url: `/api/og/epk/${campaignId}`,
          width: 1200,
          height: 630,
          alt: `${campaign.name} Press Kit`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${campaign.name} | ${campaign.artistName}`,
      description,
      images: [`/api/og/epk/${campaignId}`],
    },
  }
}

/**
 * Server Component - Fetch campaign data
 */
export default async function EPKPage({ params }: EPKPageProps) {
  const { campaignId } = params
  const campaignData = await getEpkCampaign(campaignId)

  if (!campaignData) {
    notFound()
  }

  return <EPKClient campaignData={campaignData} />
}
