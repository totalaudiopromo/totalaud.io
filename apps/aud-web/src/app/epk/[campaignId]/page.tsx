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

  // In real implementation, fetch campaign data from Supabase
  // For demo, use placeholder data
  const campaignName = 'Night Drive - Press Kit'
  const artistName = 'Demo Artist'

  return {
    title: `${campaignName} | ${artistName}`,
    description: `Electronic press kit for ${campaignName} by ${artistName}. Includes audio, press photos, and promotional materials.`,
    openGraph: {
      title: `${campaignName} | ${artistName}`,
      description: `Electronic press kit for ${campaignName} by ${artistName}`,
      images: [
        {
          url: `/api/og/epk/${campaignId}`,
          width: 1200,
          height: 630,
          alt: `${campaignName} Press Kit`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${campaignName} | ${artistName}`,
      description: `Electronic press kit for ${campaignName} by ${artistName}`,
      images: [`/api/og/epk/${campaignId}`],
    },
  }
}

/**
 * Server Component - Fetch campaign data
 */
export default async function EPKPage({ params }: EPKPageProps) {
  const { campaignId } = params

  // In real implementation, fetch from Supabase
  // For demo, use mock data
  const campaignData = await fetchCampaignData(campaignId)

  if (!campaignData) {
    notFound()
  }

  return <EPKClient campaignData={campaignData} />
}

/**
 * Fetch campaign data from database
 * In real implementation, query Supabase
 */
async function fetchCampaignData(campaignId: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Mock campaign data
  return {
    id: campaignId,
    name: 'Night Drive',
    artistName: 'Demo Artist',
    tagline: 'A cinematic journey through sound',
    description:
      '"Night Drive" is an immersive electronic soundscape that blends ambient textures with driving rhythms. Drawing inspiration from late-night city exploration and introspective moments, this track creates a sonic atmosphere that\'s both intimate and expansive.',
    releaseDate: '2025-03-15',
    genre: 'Electronic / Ambient',
    contact: {
      email: 'demo@example.com',
      website: 'https://example.com',
    },
    featuredTrack: {
      id: 'track-1',
      title: 'Night Drive',
      url: '/demo-audio.mp3',
      duration: '4:32',
      kind: 'audio' as const,
      is_public: true,
    },
    gallery: [
      {
        id: 'image-1',
        title: 'Press Photo 1',
        url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
        kind: 'image' as const,
        is_public: true,
      },
      {
        id: 'image-2',
        title: 'Press Photo 2',
        url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
        kind: 'image' as const,
        is_public: true,
      },
      {
        id: 'image-3',
        title: 'Press Photo 3',
        url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
        kind: 'image' as const,
        is_public: true,
      },
    ],
    pressMaterials: [
      {
        id: 'doc-1',
        title: 'Artist Bio',
        url: '/demo-bio.pdf',
        size_bytes: 245000,
        kind: 'document' as const,
        is_public: true,
      },
      {
        id: 'doc-2',
        title: 'Press Release',
        url: '/demo-press-release.pdf',
        size_bytes: 189000,
        kind: 'document' as const,
        is_public: true,
      },
      {
        id: 'doc-3',
        title: 'Technical Rider',
        url: '/demo-rider.pdf',
        size_bytes: 312000,
        kind: 'document' as const,
        is_public: true,
      },
    ],
  }
}
