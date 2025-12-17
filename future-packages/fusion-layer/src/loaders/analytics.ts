/**
 * Analytics Loaders
 * Success Profiles, Simulator, Coverage, Calendar
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  SuccessProfileContext,
  SimulatorContext,
  CoverageContext,
  CalendarContext,
  LoaderOptions,
  LoaderResult,
} from '../types'

export async function loadSuccessProfileContext(
  supabase: SupabaseClient,
  options: LoaderOptions
): Promise<LoaderResult<SuccessProfileContext>> {
  const startTime = Date.now()

  try {
    const { data: profiles } = await supabase
      .from('success_profiles')
      .select('*')
      .order('confidence_score', { ascending: false })
      .limit(50)

    return {
      data: {
        profiles:
          profiles?.map((p) => ({
            id: p.id,
            genre: p.genre,
            profileType: p.profile_type,
            insights: p.insights?.items || [],
            typicalTimeline: p.typical_timeline?.phases || [],
            keyOutlets: p.key_outlets?.items || [],
            bestPractices: p.best_practices?.items || [],
            warningSign: p.warning_signs?.items || [],
            confidenceScore: p.confidence_score || 0,
          })) || [],
        relevantProfiles: [], // Would filter based on user's genres
      },
      loadTime: Date.now() - startTime,
      cached: false,
    }
  } catch (error) {
    return {
      data: {
        profiles: [],
        relevantProfiles: [],
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      loadTime: Date.now() - startTime,
      cached: false,
    }
  }
}

export async function loadSimulatorContext(
  supabase: SupabaseClient,
  options: LoaderOptions
): Promise<LoaderResult<SimulatorContext>> {
  const startTime = Date.now()

  try {
    const { data: simulations } = await supabase
      .from('campaign_simulator_results')
      .select('*')
      .eq('user_id', options.userId)
      .order('created_at', { ascending: false })
      .limit(20)

    return {
      data: {
        simulations:
          simulations?.map((s) => ({
            id: s.id,
            name: s.simulation_name,
            inputs: s.inputs || {},
            predictedOutcomes: s.predicted_outcomes?.outcomes || [],
            suggestions: s.suggestions || [],
            weakPoints: s.weak_points || [],
            confidenceScore: s.confidence_scores?.overall || 0,
            createdAt: new Date(s.created_at),
          })) || [],
        recentSimulations:
          simulations?.slice(0, 5).map((s) => ({
            id: s.id,
            name: s.simulation_name,
            inputs: s.inputs || {},
            predictedOutcomes: s.predicted_outcomes?.outcomes || [],
            suggestions: s.suggestions || [],
            weakPoints: s.weak_points || [],
            confidenceScore: s.confidence_scores?.overall || 0,
            createdAt: new Date(s.created_at),
          })) || [],
      },
      loadTime: Date.now() - startTime,
      cached: false,
    }
  } catch (error) {
    return {
      data: {
        simulations: [],
        recentSimulations: [],
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      loadTime: Date.now() - startTime,
      cached: false,
    }
  }
}

export async function loadCoverageContext(
  supabase: SupabaseClient,
  options: LoaderOptions
): Promise<LoaderResult<CoverageContext>> {
  const startTime = Date.now()

  try {
    const { data: events } = await supabase
      .from('coverage_map_events')
      .select('*')
      .eq('user_id', options.userId)
      .order('created_at', { ascending: false })
      .limit(100)

    const byCountry: Record<string, number> = {}
    const byType: Record<string, number> = {}
    let totalReach = 0

    events?.forEach((event) => {
      if (event.country) {
        byCountry[event.country] = (byCountry[event.country] || 0) + 1
      }
      if (event.coverage_type) {
        byType[event.coverage_type] = (byType[event.coverage_type] || 0) + 1
      }
      totalReach += event.reach_estimate || 0
    })

    return {
      data: {
        events:
          events?.map((e) => ({
            id: e.id,
            artistName: e.artist_name,
            outlet: e.outlet,
            outletType: e.outlet_type || '',
            country: e.country || '',
            coverageType: e.coverage_type || '',
            url: e.url,
            reachEstimate: e.reach_estimate || 0,
            publicationDate: e.publication_date ? new Date(e.publication_date) : undefined,
          })) || [],
        byCountry,
        byType,
        totalReach,
      },
      loadTime: Date.now() - startTime,
      cached: false,
    }
  } catch (error) {
    return {
      data: {
        events: [],
        byCountry: {},
        byType: {},
        totalReach: 0,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      loadTime: Date.now() - startTime,
      cached: false,
    }
  }
}

export async function loadCalendarContext(
  supabase: SupabaseClient,
  options: LoaderOptions
): Promise<LoaderResult<CalendarContext>> {
  const startTime = Date.now()

  try {
    const { data: events } = await supabase
      .from('industry_calendar_events')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(100)

    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const upcomingDeadlines =
      events?.filter(
        (e) =>
          e.category === 'submission_deadline' &&
          new Date(e.date) >= now &&
          new Date(e.date) <= thirtyDaysFromNow
      ) || []

    return {
      data: {
        events:
          events?.map((e) => ({
            id: e.id,
            name: e.name,
            category: e.category,
            date: new Date(e.date),
            endDate: e.end_date ? new Date(e.end_date) : undefined,
            region: e.region,
            country: e.country,
            description: e.description,
            websiteUrl: e.website_url,
          })) || [],
        upcomingDeadlines: upcomingDeadlines.map((e) => ({
          id: e.id,
          name: e.name,
          category: e.category,
          date: new Date(e.date),
          endDate: e.end_date ? new Date(e.end_date) : undefined,
          region: e.region,
          country: e.country,
          description: e.description,
          websiteUrl: e.website_url,
        })),
        relevantEvents: [], // Would filter based on user's genres/regions
      },
      loadTime: Date.now() - startTime,
      cached: false,
    }
  } catch (error) {
    return {
      data: {
        events: [],
        upcomingDeadlines: [],
        relevantEvents: [],
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      loadTime: Date.now() - startTime,
      cached: false,
    }
  }
}
