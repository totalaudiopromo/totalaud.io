/**
 * Email Campaign Data Loader
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { EmailContext, ListContext, LoaderOptions, LoaderResult } from '../types'

export async function loadEmailContext(
  supabase: SupabaseClient,
  options: LoaderOptions
): Promise<LoaderResult<EmailContext>> {
  const startTime = Date.now()

  try {
    const { data: campaigns } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('user_id', options.userId)
      .order('created_at', { ascending: false })
      .limit(options.limit || 50)

    const { data: activities } = await supabase
      .from('campaign_activity_feed')
      .select('*')
      .eq('user_id', options.userId)
      .in('event_type', ['sent', 'opened', 'clicked', 'replied'])
      .order('created_at', { ascending: false })
      .limit(50)

    const scheduledCampaigns = campaigns?.filter((c) => c.schedule_type === 'scheduled').length || 0

    let totalSent = 0
    let totalOpens = 0
    let totalClicks = 0
    let totalReplies = 0

    campaigns?.forEach((c) => {
      totalSent += c.sent_count || 0
      totalOpens += c.open_count || 0
      totalClicks += c.click_count || 0
      totalReplies += c.reply_count || 0
    })

    const avgOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0
    const avgClickRate = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0
    const avgReplyRate = totalSent > 0 ? (totalReplies / totalSent) * 100 : 0

    return {
      data: {
        campaigns:
          campaigns?.map((c) => ({
            id: c.id,
            name: c.name,
            subject: c.subject,
            status: c.status,
            scheduledFor: c.scheduled_for ? new Date(c.scheduled_for) : undefined,
            sentAt: c.sent_at ? new Date(c.sent_at) : undefined,
            recipientCount: c.contact_ids?.length || 0,
            openRate: c.sent_count > 0 ? (c.open_count / c.sent_count) * 100 : 0,
            clickRate: c.sent_count > 0 ? (c.click_count / c.sent_count) * 100 : 0,
          })) || [],
        totalCampaigns: campaigns?.length || 0,
        scheduledCampaigns,
        recentActivity:
          activities?.map((a) => ({
            id: a.id,
            campaignId: a.campaign_id,
            contactId: a.contact_id,
            type: a.event_type,
            timestamp: new Date(a.created_at),
          })) || [],
        performanceMetrics: {
          totalSent,
          avgOpenRate,
          avgClickRate,
          avgReplyRate,
        },
      },
      loadTime: Date.now() - startTime,
      cached: false,
    }
  } catch (error) {
    return {
      data: {
        campaigns: [],
        totalCampaigns: 0,
        scheduledCampaigns: 0,
        recentActivity: [],
        performanceMetrics: {
          totalSent: 0,
          avgOpenRate: 0,
          avgClickRate: 0,
          avgReplyRate: 0,
        },
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      loadTime: Date.now() - startTime,
      cached: false,
    }
  }
}

export async function loadListContext(
  supabase: SupabaseClient,
  options: LoaderOptions
): Promise<LoaderResult<ListContext>> {
  const startTime = Date.now()

  try {
    const { data: segments } = await supabase
      .from('smart_segments')
      .select('*')
      .eq('user_id', options.userId)
      .order('updated_at', { ascending: false })

    const totalContacts = segments?.reduce((sum, s) => sum + (s.contact_count || 0), 0) || 0

    return {
      data: {
        segments:
          segments?.map((s) => ({
            id: s.id,
            name: s.name,
            contactCount: s.contact_count || 0,
            isDynamic: s.is_dynamic,
            aiGenerated: s.ai_generated,
            lastComputed: s.last_computed_at ? new Date(s.last_computed_at) : undefined,
          })) || [],
        totalSegments: segments?.length || 0,
        totalContacts,
        recentlyUpdated:
          segments?.slice(0, 5).map((s) => ({
            id: s.id,
            name: s.name,
            contactCount: s.contact_count || 0,
            isDynamic: s.is_dynamic,
            aiGenerated: s.ai_generated,
            lastComputed: s.last_computed_at ? new Date(s.last_computed_at) : undefined,
          })) || [],
      },
      loadTime: Date.now() - startTime,
      cached: false,
    }
  } catch (error) {
    return {
      data: {
        segments: [],
        totalSegments: 0,
        totalContacts: 0,
        recentlyUpdated: [],
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      loadTime: Date.now() - startTime,
      cached: false,
    }
  }
}
