/**
 * Tracker Data Loader
 *
 * Loads and normalizes Campaign Tracker data
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { TrackerContext, LoaderOptions, LoaderResult } from '../types'

export async function loadTrackerContext(
  supabase: SupabaseClient,
  options: LoaderOptions
): Promise<LoaderResult<TrackerContext>> {
  const startTime = Date.now()

  try {
    // Build workspace filter
    let query = supabase.from('campaigns').select('*').eq('user_id', options.userId)

    if (options.workspaceId) {
      query = query.eq('workspace_id', options.workspaceId)
    }

    const { data: campaigns, error: campaignsError } = await query
      .order('created_at', { ascending: false })
      .limit(options.limit || 50)

    if (campaignsError) {
      throw campaignsError
    }

    // Load recent activities
    const { data: activities } = await supabase
      .from('campaign_activity_feed')
      .select('*')
      .eq('user_id', options.userId)
      .order('created_at', { ascending: false })
      .limit(20)

    // Calculate metrics
    const totalCampaigns = campaigns?.length || 0
    const activeCampaigns =
      campaigns?.filter((c) => c.status === 'active' || c.status === 'in_progress').length || 0

    // Aggregate performance metrics
    let totalSent = 0
    let totalOpened = 0
    let totalReplied = 0
    let totalResponseTime = 0
    let responseCount = 0

    campaigns?.forEach((campaign) => {
      if (campaign.metadata?.metrics) {
        totalSent += campaign.metadata.metrics.sent || 0
        totalOpened += campaign.metadata.metrics.opened || 0
        totalReplied += campaign.metadata.metrics.replied || 0
        if (campaign.metadata.metrics.avgResponseTime) {
          totalResponseTime += campaign.metadata.metrics.avgResponseTime
          responseCount++
        }
      }
    })

    const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0
    const successRate = totalSent > 0 ? (totalReplied / totalSent) * 100 : 0

    const context: TrackerContext = {
      campaigns:
        campaigns?.map((c) => ({
          id: c.id,
          artistName: c.artist_name,
          releaseName: c.release_name || '',
          status: c.status,
          startDate: new Date(c.created_at),
          contactCount: c.metadata?.contactCount || 0,
          responseRate: c.metadata?.metrics?.responseRate || 0,
        })) || [],
      totalCampaigns,
      activeCampaigns,
      recentActivities:
        activities?.map((a) => ({
          id: a.id,
          campaignId: a.campaign_id,
          type: a.event_type,
          timestamp: new Date(a.created_at),
          metadata: a.event_data || {},
        })) || [],
      performanceMetrics: {
        totalSent,
        totalOpened,
        totalReplied,
        avgResponseTime,
        successRate,
      },
    }

    return {
      data: context,
      loadTime: Date.now() - startTime,
      cached: false,
    }
  } catch (error) {
    return {
      data: {
        campaigns: [],
        totalCampaigns: 0,
        activeCampaigns: 0,
        recentActivities: [],
        performanceMetrics: {
          totalSent: 0,
          totalOpened: 0,
          totalReplied: 0,
          avgResponseTime: 0,
          successRate: 0,
        },
      },
      error: error instanceof Error ? error.message : 'Unknown error loading Tracker context',
      loadTime: Date.now() - startTime,
      cached: false,
    }
  }
}
