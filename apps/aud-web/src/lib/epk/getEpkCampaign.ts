'use server'

import { getSupabaseServiceRoleClient } from '@/lib/supabase/serviceRole'
import type { AssetAttachment } from '@/types/asset-attachment'

export interface EpkCampaignData {
  id: string
  name: string
  artistName: string
  tagline?: string | null
  description?: string | null
  releaseDate?: string | null
  genre?: string | null
  contact: {
    email?: string | null
    website?: string | null
  }
  featuredTrack?: AssetAttachment | null
  gallery: AssetAttachment[]
  pressMaterials: AssetAttachment[]
}

interface RawAsset {
  id: string
  title: string | null
  kind: string
  url: string | null
  byte_size?: number | null
  mime_type?: string | null
  is_public: boolean | null
  created_at?: string | null
}

const attachmentKinds = {
  audio: ['audio'],
  image: ['image'],
  document: ['document', 'other'],
}

function toAttachment(asset: RawAsset): AssetAttachment | null {
  if (!asset.url) {
    return null
  }

  return {
    id: asset.id,
    title: asset.title ?? 'untitled asset',
    kind: (asset.kind || 'other') as AssetAttachment['kind'],
    url: asset.url,
    is_public: asset.is_public ?? false,
    byte_size: asset.byte_size ?? undefined,
    mime_type: asset.mime_type ?? undefined,
    created_at: asset.created_at ?? undefined,
  }
}

export async function getEpkCampaign(campaignId: string): Promise<EpkCampaignData | null> {
  const supabase = getSupabaseServiceRoleClient()

  const [
    { data: context, error: contextError },
    { data: assets, error: assetsError },
    { data: campaignRecord, error: campaignError },
  ] = await Promise.all([
    supabase.from('campaign_context').select('*').eq('id', campaignId).maybeSingle(),
    supabase
      .from('artist_assets')
      .select('id, title, kind, url, byte_size, mime_type, is_public, created_at')
      .eq('campaign_id', campaignId)
      .eq('is_public', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: true }),
    supabase
      .from('campaigns')
      .select('title, release_date')
      .eq('id', campaignId)
      .maybeSingle(),
  ])

  if (contextError) {
    console.error('Failed to load campaign context', contextError)
  }

  if (assetsError) {
    console.error('Failed to load campaign assets', assetsError)
  }

  if (campaignError) {
    console.error('Failed to load campaign metadata', campaignError)
  }

  if (!context && !campaignRecord) {
    return null
  }

  const contextRecord = (context ?? {}) as Record<string, any>
  const campaignRecordData = (campaignRecord ?? {}) as Record<string, any>

  const safeAssets: RawAsset[] = Array.isArray(assets) ? (assets as RawAsset[]) : []

  const audioAssets = safeAssets
    .filter((asset) => attachmentKinds.audio.includes(asset.kind))
    .map(toAttachment)
    .filter((asset): asset is AssetAttachment => asset !== null)

  const imageAssets = safeAssets
    .filter((asset) => attachmentKinds.image.includes(asset.kind))
    .map(toAttachment)
    .filter((asset): asset is AssetAttachment => asset !== null)

  const documentAssets = safeAssets
    .filter((asset) => attachmentKinds.document.includes(asset.kind))
    .map(toAttachment)
    .filter((asset): asset is AssetAttachment => asset !== null)

  const campaignName =
    (campaignRecordData.title as string | undefined) ??
    (contextRecord.title as string | undefined) ??
    (contextRecord.campaign_title as string | undefined) ??
    'untitled campaign'

  const artistName =
    (contextRecord.artist_name as string | undefined) ??
    (contextRecord.artist as string | undefined) ??
    'independent artist'

  const goal = contextRecord.goal as string | undefined
  const description =
    (contextRecord.description as string | undefined) ??
    (contextRecord.summary as string | undefined) ??
    null

  const contactEmail = (contextRecord.contact_email as string | undefined) ?? null
  const contactWebsite = (contextRecord.contact_website as string | undefined) ?? null

  return {
    id: campaignId,
    name: campaignName,
    artistName,
    tagline: (contextRecord.tagline as string | undefined) ?? (goal ? `${goal} campaign` : null),
    description,
    releaseDate:
      (campaignRecordData.release_date as string | undefined) ??
      (contextRecord.release_date as string | undefined) ??
      (contextRecord.launch_date as string | undefined) ??
      null,
    genre: (contextRecord.genre as string | undefined) ?? null,
    contact: {
      email: contactEmail,
      website: contactWebsite,
    },
    featuredTrack: audioAssets[0] ?? null,
    gallery: imageAssets,
    pressMaterials: documentAssets,
  }
}

