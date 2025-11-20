import { tapClient } from '../client'
import type { TAPAudienceInsight, TAPRecommendation } from '../types'

export const audioIntelApi = {
  // ============================================================================
  // AUDIENCE INSIGHTS
  // ============================================================================

  async getAudienceInsights(artistName: string, genre?: string): Promise<TAPAudienceInsight> {
    const params = new URLSearchParams({ artist_name: artistName })
    if (genre) params.append('genre', genre)

    return tapClient.get(`/audio-intel/insights?${params.toString()}`)
  },

  async getDemographicBreakdown(artistName: string): Promise<TAPAudienceInsight['demographics']> {
    const insights = await this.getAudienceInsights(artistName)
    return insights.demographics
  },

  async getListeningHabits(artistName: string): Promise<TAPAudienceInsight['listening_habits']> {
    const insights = await this.getAudienceInsights(artistName)
    return insights.listening_habits
  },

  // ============================================================================
  // RECOMMENDATIONS
  // ============================================================================

  async getBlogRecommendations(artistName: string, genre?: string): Promise<TAPRecommendation[]> {
    const insights = await this.getAudienceInsights(artistName, genre)
    return insights.recommendations.blogs
  },

  async getRadioRecommendations(artistName: string, genre?: string): Promise<TAPRecommendation[]> {
    const insights = await this.getAudienceInsights(artistName, genre)
    return insights.recommendations.radio_stations
  },

  async getPlaylistRecommendations(
    artistName: string,
    genre?: string
  ): Promise<TAPRecommendation[]> {
    const insights = await this.getAudienceInsights(artistName, genre)
    return insights.recommendations.playlists
  },

  async getAllRecommendations(
    artistName: string,
    genre?: string
  ): Promise<TAPAudienceInsight['recommendations']> {
    const insights = await this.getAudienceInsights(artistName, genre)
    return insights.recommendations
  },

  // ============================================================================
  // LOOPOS INTEGRATION HELPERS
  // ============================================================================

  /**
   * Enrich LoopOS campaign with audience insights
   */
  async enrichCampaign(
    artistName: string,
    genre?: string
  ): Promise<{
    insights: TAPAudienceInsight
    suggestedActions: string[]
  }> {
    const insights = await this.getAudienceInsights(artistName, genre)

    // Generate suggested actions based on insights
    const suggestedActions: string[] = []

    // Top platforms
    const topPlatform = Object.entries(insights.listening_habits.platforms).sort(
      ([, a], [, b]) => b - a
    )[0]
    if (topPlatform) {
      suggestedActions.push(`Focus on ${topPlatform[0]} - ${topPlatform[1]}% of audience`)
    }

    // Top locations
    if (insights.demographics.locations.length > 0) {
      suggestedActions.push(`Target ${insights.demographics.locations.slice(0, 3).join(', ')}`)
    }

    // High-relevance recommendations
    const topBlogs = insights.recommendations.blogs
      .filter((b) => b.relevance_score > 0.7)
      .slice(0, 3)
    if (topBlogs.length > 0) {
      suggestedActions.push(`Pitch to: ${topBlogs.map((b) => b.name).join(', ')}`)
    }

    return { insights, suggestedActions }
  },
}
