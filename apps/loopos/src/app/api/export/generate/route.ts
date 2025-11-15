import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { serializeCampaign } from '@/export/serializers/campaignSerializer'
import { exportCampaignToHTML, exportEPKToHTML, exportBriefToHTML } from '@/export/exporters/htmlExporter'
import { exportCampaignToJSON, exportEPKToJSON, exportBriefToJSON } from '@/export/exporters/jsonExporter'
import type { EPKData, BriefData } from '@/export/types'

const GenerateExportRequestSchema = z.object({
  type: z.enum(['campaign', 'epk', 'pr-brief', 'radio-brief', 'social-brief']),
  format: z.enum(['html', 'json', 'pdf']),
  options: z.object({
    includeJournal: z.boolean().optional(),
    includeMoodboard: z.boolean().optional(),
    includeInsights: z.boolean().optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, format, options } = GenerateExportRequestSchema.parse(body)

    // TODO: Get actual user ID from auth
    const userId = 'demo-user-id'

    let content: string

    if (type === 'campaign') {
      const campaignData = await serializeCampaign('demo-campaign-id', userId, {
        includeJournal: options?.includeJournal ?? false,
        includeMoodboard: options?.includeMoodboard ?? false,
        includeInsights: options?.includeInsights ?? false,
        format,
      })

      content = format === 'html'
        ? exportCampaignToHTML(campaignData)
        : exportCampaignToJSON(campaignData)

    } else if (type === 'epk') {
      // Mock EPK data
      const epkData: EPKData = {
        artistName: 'The Satellites',
        projectName: 'Midnight Frequencies',
        bio: 'Indie rock band from Manchester blending shoegaze textures with driving post-punk energy.',
        releaseDate: '2025-03-15',
        tracks: ['Midnight Frequencies', 'Radio Silence', 'Static Dreams'],
        links: {
          spotify: 'https://spotify.com/artist/demo',
          instagram: 'https://instagram.com/thesatellites',
        },
        forFansOf: ['Fontaines D.C.', 'Slow Dive', 'The National'],
      }

      content = format === 'html'
        ? exportEPKToHTML(epkData)
        : exportEPKToJSON(epkData)

    } else {
      // Brief types (pr/radio/social)
      const briefData: BriefData = {
        briefType: type === 'pr-brief' ? 'pr' : type === 'radio-brief' ? 'radio' : 'social',
        artistName: 'The Satellites',
        projectName: 'Midnight Frequencies',
        genre: 'Indie Rock / Post-Punk',
        releaseDate: '2025-03-15',
        keyAngles: [
          'Manchester\'s answer to modern post-punk revival',
          'Debut album recorded in analogue studios',
          'Sold-out hometown shows pre-release',
        ],
        targetAudience: '18-35 year old indie/alternative fans, BBC Radio 6 listeners',
        objectives: [
          'Secure BBC Radio 6 playlist add',
          '10+ regional station adds',
          'Feature coverage in NME, DIY, The Line of Best Fit',
        ],
        timeline: '6 weeks pre-release campaign',
      }

      content = format === 'html'
        ? exportBriefToHTML(briefData)
        : exportBriefToJSON(briefData)
    }

    return NextResponse.json({ content })

  } catch (error) {
    console.error('Export generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
