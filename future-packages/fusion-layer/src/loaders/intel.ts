/**
 * Intel Data Loader
 *
 * Loads and normalizes Audio Intel contact and enrichment data
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { IntelContext, LoaderOptions, LoaderResult } from '../types'

export async function loadIntelContext(
  supabase: SupabaseClient,
  options: LoaderOptions
): Promise<LoaderResult<IntelContext>> {
  const startTime = Date.now()

  try {
    // Load contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('intel_contacts')
      .select('*')
      .eq('user_id', options.userId)
      .order('created_at', { ascending: false })
      .limit(options.limit || 100)

    if (contactsError) {
      throw contactsError
    }

    // Load recent enrichments (if intel_logs table exists)
    const { data: enrichments } = await supabase
      .from('intel_logs')
      .select('*')
      .eq('user_id', options.userId)
      .eq('action', 'enrichment')
      .order('created_at', { ascending: false })
      .limit(20)

    // Calculate metrics
    const totalContacts = contacts?.length || 0
    const successfulEnrichments = enrichments?.filter((e) => e.metadata?.success) || []
    const enrichmentRate =
      enrichments && enrichments.length > 0
        ? (successfulEnrichments.length / enrichments.length) * 100
        : 0

    // Extract top genres and regions
    const genres = new Map<string, number>()
    const regions = new Map<string, number>()

    contacts?.forEach((contact) => {
      if (contact.metadata?.genres) {
        contact.metadata.genres.forEach((g: string) => {
          genres.set(g, (genres.get(g) || 0) + 1)
        })
      }
      if (contact.metadata?.region) {
        regions.set(contact.metadata.region, (regions.get(contact.metadata.region) || 0) + 1)
      }
    })

    const topGenres = Array.from(genres.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((e) => e[0])

    const topRegions = Array.from(regions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((e) => e[0])

    const context: IntelContext = {
      contacts:
        contacts?.map((c) => ({
          id: c.id,
          name: c.name || c.metadata?.name || 'Unknown',
          email: c.email,
          outlet: c.metadata?.outlet,
          role: c.metadata?.role,
          genre: c.metadata?.genres,
          region: c.metadata?.region,
          lastEnriched: c.updated_at ? new Date(c.updated_at) : undefined,
          enrichmentScore: c.metadata?.enrichmentScore,
        })) || [],
      totalContacts,
      recentEnrichments:
        enrichments?.map((e) => ({
          id: e.id,
          contactId: e.metadata?.contactId,
          timestamp: new Date(e.created_at),
          fields: e.metadata?.fields || [],
          success: e.metadata?.success || false,
        })) || [],
      enrichmentRate,
      topGenres,
      topRegions,
    }

    return {
      data: context,
      loadTime: Date.now() - startTime,
      cached: false,
    }
  } catch (error) {
    return {
      data: {
        contacts: [],
        totalContacts: 0,
        recentEnrichments: [],
        enrichmentRate: 0,
        topGenres: [],
        topRegions: [],
      },
      error: error instanceof Error ? error.message : 'Unknown error loading Intel context',
      loadTime: Date.now() - startTime,
      cached: false,
    }
  }
}
