/**
 * Intelligence Data Loaders
 * Contact Intel, Press Kit Intel, Writer's Room, Reply Intel, Campaign Watcher
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  ContactIntelContext,
  PressKitIntelContext,
  WriterRoomContext,
  ReplyIntelContext,
  CampaignWatcherContext,
  PitchContext,
  ReleaseContext,
  IntegrationContext,
  LoaderOptions,
  LoaderResult,
} from '../types'

export async function loadContactIntelContext(
  supabase: SupabaseClient,
  options: LoaderOptions
): Promise<LoaderResult<ContactIntelContext>> {
  const startTime = Date.now()

  try {
    const { data: graphs } = await supabase
      .from('contact_intel_graph')
      .select('*')
      .eq('user_id', options.userId)
      .order('responsiveness_score', { ascending: false })
      .limit(100)

    const avgScore =
      graphs && graphs.length > 0
        ? graphs.reduce((sum, g) => sum + (g.responsiveness_score || 0), 0) / graphs.length
        : 0

    return {
      data: {
        graphs:
          graphs?.map((g) => ({
            contactId: g.contact_id,
            genreAffinity: g.genre_affinity || {},
            responsivenessScore: g.responsiveness_score || 0,
            preferredPitchStyle: g.pitch_style_preference || [],
            bestTimeToSend: {
              hourOfDay: g.time_of_day_success?.preferred || [],
              dayOfWeek: g.day_of_week_success?.preferred || [],
            },
            avgResponseTimeHours: g.average_response_time_hours || 0,
            conversionRate: g.conversion_rate || 0,
          })) || [],
        totalContacts: graphs?.length || 0,
        avgResponsivenessScore: avgScore,
        topPerformingContacts:
          graphs?.slice(0, 10).map((g) => ({
            contactId: g.contact_id,
            genreAffinity: g.genre_affinity || {},
            responsivenessScore: g.responsiveness_score || 0,
            preferredPitchStyle: g.pitch_style_preference || [],
            bestTimeToSend: {
              hourOfDay: g.time_of_day_success?.preferred || [],
              dayOfWeek: g.day_of_week_success?.preferred || [],
            },
            avgResponseTimeHours: g.average_response_time_hours || 0,
            conversionRate: g.conversion_rate || 0,
          })) || [],
      },
      loadTime: Date.now() - startTime,
      cached: false,
    }
  } catch (error) {
    return {
      data: {
        graphs: [],
        totalContacts: 0,
        avgResponsivenessScore: 0,
        topPerformingContacts: [],
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      loadTime: Date.now() - startTime,
      cached: false,
    }
  }
}

export async function loadPressKitIntelContext(
  supabase: SupabaseClient,
  options: LoaderOptions
): Promise<LoaderResult<PressKitIntelContext>> {
  const startTime = Date.now()

  try {
    const { data: reports } = await supabase
      .from('presskit_intel_reports')
      .select('*')
      .eq('user_id', options.userId)
      .order('created_at', { ascending: false })
      .limit(10)

    const avgQualityScore =
      reports && reports.length > 0
        ? reports.reduce((sum, r) => sum + (r.kit_quality_score || 0), 0) / reports.length
        : 0

    return {
      data: {
        reports:
          reports?.map((r) => ({
            id: r.id,
            artistName: r.artist_name,
            qualityScore: r.kit_quality_score || 0,
            completenessScore: r.completeness_score || 0,
            professionalismScore: r.professionalism_score || 0,
            issues: r.issues || [],
            suggestions: r.suggestions || [],
            strengths: r.strengths || [],
          })) || [],
        latestReport: reports?.[0]
          ? {
              id: reports[0].id,
              artistName: reports[0].artist_name,
              qualityScore: reports[0].kit_quality_score || 0,
              completenessScore: reports[0].completeness_score || 0,
              professionalismScore: reports[0].professionalism_score || 0,
              issues: reports[0].issues || [],
              suggestions: reports[0].suggestions || [],
              strengths: reports[0].strengths || [],
            }
          : undefined,
        avgQualityScore,
      },
      loadTime: Date.now() - startTime,
      cached: false,
    }
  } catch (error) {
    return {
      data: {
        reports: [],
        avgQualityScore: 0,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      loadTime: Date.now() - startTime,
      cached: false,
    }
  }
}

export async function loadWriterRoomContext(
  supabase: SupabaseClient,
  options: LoaderOptions
): Promise<LoaderResult<WriterRoomContext>> {
  const startTime = Date.now()

  try {
    const { data: results } = await supabase
      .from('writers_room_results')
      .select('*')
      .eq('user_id', options.userId)
      .order('created_at', { ascending: false })
      .limit(20)

    return {
      data: {
        results:
          results?.map((r) => ({
            id: r.id,
            artistName: r.artist_name,
            releaseName: r.release_name,
            angles: r.angles || [],
            taglines: r.taglines || [],
            tiktokHooks: r.tiktok_hooks || [],
            radioTalkingPoints: r.radio_talking_points || [],
            narratives: r.narratives || [],
            createdAt: new Date(r.created_at),
          })) || [],
        recentGenerated:
          results?.slice(0, 5).map((r) => ({
            id: r.id,
            artistName: r.artist_name,
            releaseName: r.release_name,
            angles: r.angles || [],
            taglines: r.taglines || [],
            tiktokHooks: r.tiktok_hooks || [],
            radioTalkingPoints: r.radio_talking_points || [],
            narratives: r.narratives || [],
            createdAt: new Date(r.created_at),
          })) || [],
      },
      loadTime: Date.now() - startTime,
      cached: false,
    }
  } catch (error) {
    return {
      data: {
        results: [],
        recentGenerated: [],
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      loadTime: Date.now() - startTime,
      cached: false,
    }
  }
}

export async function loadReplyIntelContext(
  supabase: SupabaseClient,
  options: LoaderOptions
): Promise<LoaderResult<ReplyIntelContext>> {
  const startTime = Date.now()

  try {
    const { data: classifications } = await supabase
      .from('reply_intel_cache')
      .select('*')
      .eq('user_id', options.userId)
      .order('created_at', { ascending: false })
      .limit(50)

    const highValueLeads =
      classifications?.filter((c) => c.classification === 'high_value_lead') || []
    const needsFollowup = classifications?.filter((c) => c.requires_followup) || []

    const avgInterestScore =
      classifications && classifications.length > 0
        ? classifications.reduce((sum, c) => sum + (c.interest_score || 0), 0) /
          classifications.length
        : 0

    const avgUrgencyScore =
      classifications && classifications.length > 0
        ? classifications.reduce((sum, c) => sum + (c.urgency_score || 0), 0) /
          classifications.length
        : 0

    return {
      data: {
        classifications:
          classifications?.map((c) => ({
            id: c.id,
            campaignId: c.campaign_id,
            contactId: c.contact_id,
            classification: c.classification,
            interestScore: c.interest_score || 0,
            urgencyScore: c.urgency_score || 0,
            requiresFollowup: c.requires_followup,
            suggestedResponse: c.suggested_response,
            timestamp: new Date(c.created_at),
          })) || [],
        highValueLeads: highValueLeads.map((c) => ({
          id: c.id,
          campaignId: c.campaign_id,
          contactId: c.contact_id,
          classification: c.classification,
          interestScore: c.interest_score || 0,
          urgencyScore: c.urgency_score || 0,
          requiresFollowup: c.requires_followup,
          suggestedResponse: c.suggested_response,
          timestamp: new Date(c.created_at),
        })),
        needsFollowup: needsFollowup.map((c) => ({
          id: c.id,
          campaignId: c.campaign_id,
          contactId: c.contact_id,
          classification: c.classification,
          interestScore: c.interest_score || 0,
          urgencyScore: c.urgency_score || 0,
          requiresFollowup: c.requires_followup,
          suggestedResponse: c.suggested_response,
          timestamp: new Date(c.created_at),
        })),
        avgInterestScore,
        avgUrgencyScore,
      },
      loadTime: Date.now() - startTime,
      cached: false,
    }
  } catch (error) {
    return {
      data: {
        classifications: [],
        highValueLeads: [],
        needsFollowup: [],
        avgInterestScore: 0,
        avgUrgencyScore: 0,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      loadTime: Date.now() - startTime,
      cached: false,
    }
  }
}

export async function loadCampaignWatcherContext(
  supabase: SupabaseClient,
  options: LoaderOptions
): Promise<LoaderResult<CampaignWatcherContext>> {
  const startTime = Date.now()

  try {
    const { data: feed } = await supabase
      .from('campaign_activity_feed')
      .select('*')
      .eq('user_id', options.userId)
      .order('created_at', { ascending: false })
      .limit(100)

    const eventsByType: Record<string, number> = {}
    feed?.forEach((event) => {
      eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1
    })

    return {
      data: {
        feed:
          feed?.map((f) => ({
            id: f.id,
            campaignId: f.campaign_id,
            eventType: f.event_type,
            eventData: f.event_data || {},
            timestamp: new Date(f.created_at),
          })) || [],
        recentEvents:
          feed?.slice(0, 20).map((f) => ({
            id: f.id,
            campaignId: f.campaign_id,
            eventType: f.event_type,
            eventData: f.event_data || {},
            timestamp: new Date(f.created_at),
          })) || [],
        eventsByType,
      },
      loadTime: Date.now() - startTime,
      cached: false,
    }
  } catch (error) {
    return {
      data: {
        feed: [],
        recentEvents: [],
        eventsByType: {},
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      loadTime: Date.now() - startTime,
      cached: false,
    }
  }
}

export async function loadPitchContext(
  supabase: SupabaseClient,
  options: LoaderOptions
): Promise<LoaderResult<PitchContext>> {
  const startTime = Date.now()

  try {
    // Load pitches from pitch generator (if table exists)
    const { data: pitches } = await supabase
      .from('pitches')
      .select('*')
      .eq('user_id', options.userId)
      .order('created_at', { ascending: false })
      .limit(50)

    const { data: voiceProfile } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('user_id', options.userId)
      .single()

    return {
      data: {
        pitches:
          pitches?.map((p) => ({
            id: p.id,
            artistName: p.artist_name || '',
            subject: p.subject || '',
            tone: p.tone || 'professional',
            createdAt: new Date(p.created_at),
            sent: p.metadata?.sent || false,
            opened: p.metadata?.opened || false,
            replied: p.metadata?.replied || false,
          })) || [],
        totalPitches: pitches?.length || 0,
        templates: [],
        voiceProfile: voiceProfile
          ? {
              id: voiceProfile.id,
              tone: voiceProfile.tone || 'professional',
              characteristics: voiceProfile.characteristics || [],
              examples: voiceProfile.examples || [],
            }
          : undefined,
        recentActivity: [],
      },
      loadTime: Date.now() - startTime,
      cached: false,
    }
  } catch (error) {
    return {
      data: {
        pitches: [],
        totalPitches: 0,
        templates: [],
        recentActivity: [],
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      loadTime: Date.now() - startTime,
      cached: false,
    }
  }
}

export async function loadReleaseContext(
  supabase: SupabaseClient,
  options: LoaderOptions
): Promise<LoaderResult<ReleaseContext>> {
  const startTime = Date.now()

  try {
    const { data: plans } = await supabase
      .from('release_plans')
      .select('*')
      .eq('user_id', options.userId)
      .order('release_date', { ascending: true })

    const upcoming = plans?.filter((p) => new Date(p.release_date) > new Date()) || []
    const inProgress = plans?.filter((p) => p.status === 'in_progress') || []
    const completed = plans?.filter((p) => p.status === 'completed') || []

    const mapPlan = (p: any) => ({
      id: p.id,
      artistName: p.artist_name,
      releaseName: p.release_name,
      releaseType: p.release_type,
      releaseDate: new Date(p.release_date),
      status: p.status,
      completionPercentage: p.metadata?.completionPercentage || 0,
    })

    return {
      data: {
        plans: plans?.map(mapPlan) || [],
        upcoming: upcoming.map(mapPlan),
        inProgress: inProgress.map(mapPlan),
        completed: completed.map(mapPlan),
      },
      loadTime: Date.now() - startTime,
      cached: false,
    }
  } catch (error) {
    return {
      data: {
        plans: [],
        upcoming: [],
        inProgress: [],
        completed: [],
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      loadTime: Date.now() - startTime,
      cached: false,
    }
  }
}

export async function loadIntegrationContext(
  supabase: SupabaseClient,
  options: LoaderOptions
): Promise<LoaderResult<IntegrationContext>> {
  const startTime = Date.now()

  try {
    const { data: integrations } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', options.userId)

    const syncStatus: Record<string, any> = {}
    integrations?.forEach((integration) => {
      syncStatus[integration.provider] = {
        isActive: integration.status === 'active',
        lastSync: integration.last_sync_at ? new Date(integration.last_sync_at) : undefined,
        errorCount: integration.metadata?.errorCount || 0,
      }
    })

    const available = [
      'spotify',
      'apple_music',
      'youtube',
      'soundcloud',
      'bandcamp',
      'instagram',
      'tiktok',
      'twitter',
    ]

    return {
      data: {
        connected:
          integrations?.map((i) => ({
            id: i.id,
            provider: i.provider,
            status: i.status,
            lastSync: i.last_sync_at ? new Date(i.last_sync_at) : undefined,
            scopes: i.scopes || [],
          })) || [],
        available,
        syncStatus,
      },
      loadTime: Date.now() - startTime,
      cached: false,
    }
  } catch (error) {
    return {
      data: {
        connected: [],
        available: [],
        syncStatus: {},
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      loadTime: Date.now() - startTime,
      cached: false,
    }
  }
}
