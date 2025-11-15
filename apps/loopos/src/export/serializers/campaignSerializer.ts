import type { CampaignData, ExportOptions } from '../types'

/**
 * Campaign Data Serializer
 *
 * Gathers campaign data from LoopOS and normalises it for export.
 */

export async function serializeCampaign(
  campaignId: string,
  userId: string,
  options: ExportOptions
): Promise<CampaignData> {
  // TODO: Fetch from database
  // const nodes = await getNodes(supabase, userId)
  // const journal = options.includeJournal ? await getJournalEntries(supabase, userId) : undefined
  // const moodboard = options.includeMoodboard ? await getMoodboardItems(supabase, userId) : undefined

  // Mock data for now
  const campaign: CampaignData = {
    id: campaignId,
    name: 'Radio Promo Campaign',
    createdAt: new Date().toISOString(),
    nodes: [
      {
        id: '1',
        title: 'Research Target Stations',
        description: 'Identify radio stations matching genre',
        status: 'completed',
      },
      {
        id: '2',
        title: 'Find Station Contacts',
        description: 'Gather email addresses',
        status: 'active',
      },
      {
        id: '3',
        title: 'Send Initial Pitch',
        description: 'Personalised emails',
        status: 'pending',
      },
    ],
  }

  if (options.includeJournal) {
    campaign.journalEntries = [
      {
        id: '1',
        content: 'Started campaign planning today. Feeling optimistic.',
        mood: 'inspired',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ]
  }

  if (options.includeInsights) {
    campaign.insights = {
      flowScore: 78,
      momentum: 'high',
      completedNodes: 1,
    }
  }

  if (options.includeMoodboard) {
    campaign.moodboardItems = [
      {
        id: '1',
        type: 'colour',
        content: '#3AA9BE',
        title: 'Brand Colour',
      },
    ]
  }

  return campaign
}
