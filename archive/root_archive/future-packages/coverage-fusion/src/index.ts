/**
 * Coverage Fusion
 * Geospatial and timeline intelligence
 */

import type { FusionContext } from '@total-audio/fusion-layer'

export interface CoverageFusionInput {
  artistSlug: string
  timeRange: {
    start: Date
    end: Date
  }
  context: FusionContext
}

export interface CoverageFusionData {
  events: FusionEvent[]
  geographicClusters: GeographicCluster[]
  temporalDensity: TemporalDensity[]
  coverage: CoverageMetrics
  visualizations: Visualizations
}

export interface FusionEvent {
  id: string
  type: 'coverage' | 'campaign' | 'scene_event' | 'festival' | 'calendar'
  date: Date
  location: {
    country?: string
    city?: string
    region?: string
    coordinates?: { lat: number; lng: number }
  }
  title: string
  description: string
  importance: number
  metadata: Record<string, any>
}

export interface GeographicCluster {
  country: string
  region?: string
  eventCount: number
  importance: number
  coordinates: { lat: number; lng: number }
  events: string[]
}

export interface TemporalDensity {
  date: string
  eventCount: number
  importance: number
  types: Record<string, number>
}

export interface CoverageMetrics {
  totalEvents: number
  countriesReached: number
  citiesReached: number
  averageImportance: number
  coverageScore: number
  geographicSpread: number
}

export interface Visualizations {
  worldMap: MapData
  timeline: TimelineData
  heatmap: HeatmapData
}

export interface MapData {
  markers: Array<{
    lat: number
    lng: number
    count: number
    importance: number
    label: string
  }>
}

export interface TimelineData {
  periods: Array<{
    start: string
    end: string
    events: number
    importance: number
  }>
}

export interface HeatmapData {
  regions: Array<{
    region: string
    intensity: number
    events: number
  }>
}

export async function buildCoverageFusion(input: CoverageFusionInput): Promise<CoverageFusionData> {
  const { timeRange, context } = input

  // Collect all events from different sources
  const events = collectFusionEvents(context, timeRange)

  // Build geographic clusters
  const geographicClusters = buildGeographicClusters(events)

  // Calculate temporal density
  const temporalDensity = calculateTemporalDensity(events)

  // Calculate coverage metrics
  const coverage = calculateCoverageMetrics(events, geographicClusters)

  // Generate visualizations
  const visualizations = generateVisualizations(events, geographicClusters, temporalDensity)

  return {
    events,
    geographicClusters,
    temporalDensity,
    coverage,
    visualizations,
  }
}

function collectFusionEvents(
  context: FusionContext,
  timeRange: { start: Date; end: Date }
): FusionEvent[] {
  const events: FusionEvent[] = []

  // Coverage events from coverage map
  context.coverage.events.forEach((event) => {
    const eventDate = new Date(event.date)
    if (eventDate >= timeRange.start && eventDate <= timeRange.end) {
      events.push({
        id: event.id,
        type: 'coverage',
        date: eventDate,
        location: {
          country: event.country,
          city: event.city,
          region: event.region,
        },
        title: event.outlet || 'Coverage Event',
        description: event.type || 'Media coverage',
        importance: event.importance || 0.5,
        metadata: event,
      })
    }
  })

  // Campaign activities
  context.tracker.campaigns.forEach((campaign) => {
    const startDate = new Date(campaign.created_at)
    if (startDate >= timeRange.start && startDate <= timeRange.end) {
      events.push({
        id: campaign.id,
        type: 'campaign',
        date: startDate,
        location: {
          country: 'UK', // Default, could be enhanced
        },
        title: campaign.name,
        description: campaign.description || 'Campaign activity',
        importance: campaign.status === 'active' ? 0.8 : 0.5,
        metadata: campaign,
      })
    }
  })

  // Calendar events
  context.calendar.upcomingDeadlines.forEach((deadline) => {
    if (deadline.date >= timeRange.start && deadline.date <= timeRange.end) {
      events.push({
        id: deadline.id,
        type: deadline.type === 'festival' ? 'festival' : 'calendar',
        date: deadline.date,
        location: {
          country: deadline.location?.country,
          city: deadline.location?.city,
        },
        title: deadline.name,
        description: deadline.description || '',
        importance: deadline.importance || 0.7,
        metadata: deadline,
      })
    }
  })

  return events.sort((a, b) => a.date.getTime() - b.date.getTime())
}

function buildGeographicClusters(events: FusionEvent[]): GeographicCluster[] {
  const clusterMap = new Map<string, GeographicCluster>()

  events.forEach((event) => {
    const country = event.location.country || 'Unknown'
    const key = country

    if (!clusterMap.has(key)) {
      // Approximate coordinates (could be enhanced with real geocoding)
      const coordinates = getCountryCoordinates(country)

      clusterMap.set(key, {
        country,
        region: event.location.region,
        eventCount: 0,
        importance: 0,
        coordinates,
        events: [],
      })
    }

    const cluster = clusterMap.get(key)!
    cluster.eventCount++
    cluster.importance += event.importance
    cluster.events.push(event.id)
  })

  return Array.from(clusterMap.values()).sort((a, b) => b.eventCount - a.eventCount)
}

function calculateTemporalDensity(events: FusionEvent[]): TemporalDensity[] {
  const densityMap = new Map<string, TemporalDensity>()

  events.forEach((event) => {
    const dateKey = event.date.toISOString().split('T')[0]

    if (!densityMap.has(dateKey)) {
      densityMap.set(dateKey, {
        date: dateKey,
        eventCount: 0,
        importance: 0,
        types: {},
      })
    }

    const density = densityMap.get(dateKey)!
    density.eventCount++
    density.importance += event.importance
    density.types[event.type] = (density.types[event.type] || 0) + 1
  })

  return Array.from(densityMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}

function calculateCoverageMetrics(
  events: FusionEvent[],
  clusters: GeographicCluster[]
): CoverageMetrics {
  const countries = new Set(events.map((e) => e.location.country).filter(Boolean))
  const cities = new Set(events.map((e) => e.location.city).filter(Boolean))

  const totalImportance = events.reduce((sum, e) => sum + e.importance, 0)
  const averageImportance = events.length > 0 ? totalImportance / events.length : 0

  // Coverage score: weighted by events, importance, and geographic spread
  const coverageScore = Math.min((events.length * averageImportance * countries.size) / 10, 100)

  // Geographic spread: 0-1 based on number of countries
  const geographicSpread = Math.min(countries.size / 20, 1.0)

  return {
    totalEvents: events.length,
    countriesReached: countries.size,
    citiesReached: cities.size,
    averageImportance,
    coverageScore,
    geographicSpread,
  }
}

function generateVisualizations(
  events: FusionEvent[],
  clusters: GeographicCluster[],
  temporalDensity: TemporalDensity[]
): Visualizations {
  // World map markers
  const worldMap: MapData = {
    markers: clusters.map((cluster) => ({
      lat: cluster.coordinates.lat,
      lng: cluster.coordinates.lng,
      count: cluster.eventCount,
      importance: cluster.importance / cluster.eventCount,
      label: cluster.country,
    })),
  }

  // Timeline periods (weekly aggregation)
  const timeline: TimelineData = {
    periods: aggregateIntoPeriods(temporalDensity, 7), // 7-day periods
  }

  // Regional heatmap
  const heatmap: HeatmapData = {
    regions: clusters.map((cluster) => ({
      region: cluster.country,
      intensity: Math.min(cluster.eventCount / 10, 1.0),
      events: cluster.eventCount,
    })),
  }

  return {
    worldMap,
    timeline,
    heatmap,
  }
}

function aggregateIntoPeriods(
  densities: TemporalDensity[],
  periodDays: number
): Array<{ start: string; end: string; events: number; importance: number }> {
  if (densities.length === 0) return []

  const periods: Array<{ start: string; end: string; events: number; importance: number }> = []
  let currentPeriod: { start: string; end: string; events: number; importance: number } | null =
    null

  densities.forEach((density, index) => {
    if (!currentPeriod || index % periodDays === 0) {
      if (currentPeriod) periods.push(currentPeriod)
      currentPeriod = {
        start: density.date,
        end: density.date,
        events: 0,
        importance: 0,
      }
    }

    if (currentPeriod) {
      currentPeriod.end = density.date
      currentPeriod.events += density.eventCount
      currentPeriod.importance += density.importance
    }
  })

  if (currentPeriod) periods.push(currentPeriod)

  return periods
}

// Approximate country coordinates (simplified)
function getCountryCoordinates(country: string): { lat: number; lng: number } {
  const coordinates: Record<string, { lat: number; lng: number }> = {
    UK: { lat: 51.5074, lng: -0.1278 },
    USA: { lat: 37.0902, lng: -95.7129 },
    Germany: { lat: 51.1657, lng: 10.4515 },
    France: { lat: 46.2276, lng: 2.2137 },
    Spain: { lat: 40.4637, lng: -3.7492 },
    Italy: { lat: 41.8719, lng: 12.5674 },
    Netherlands: { lat: 52.1326, lng: 5.2913 },
    Belgium: { lat: 50.5039, lng: 4.4699 },
    Sweden: { lat: 60.1282, lng: 18.6435 },
    Norway: { lat: 60.472, lng: 8.4689 },
  }

  return coordinates[country] || { lat: 0, lng: 0 }
}
