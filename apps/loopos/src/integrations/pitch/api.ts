import { tapClient } from '../client'
import type { TAPPressRelease, TAPEPKCopy, TAPPluggerBrief } from '../types'

export const pitchApi = {
  // ============================================================================
  // PRESS RELEASE
  // ============================================================================

  async generatePressRelease(data: {
    artist_name: string
    track_title?: string
    album_title?: string
    release_date?: string
    key_points: string[]
    quotes?: string[]
    links?: string[]
  }): Promise<TAPPressRelease> {
    return tapClient.post('/pitch/press-release', data)
  },

  async getPressRelease(id: string): Promise<TAPPressRelease> {
    return tapClient.get(`/pitch/press-release/${id}`)
  },

  async updatePressRelease(
    id: string,
    updates: Partial<TAPPressRelease>
  ): Promise<TAPPressRelease> {
    return tapClient.patch(`/pitch/press-release/${id}`, updates)
  },

  // ============================================================================
  // EPK COPY
  // ============================================================================

  async generateEPKCopy(data: {
    artist_name: string
    genre?: string
    career_highlights?: string[]
    press_quotes?: string[]
    achievements?: string[]
    links?: {
      website?: string
      spotify?: string
      instagram?: string
      youtube?: string
    }
  }): Promise<TAPEPKCopy> {
    return tapClient.post('/pitch/epk', data)
  },

  async getEPKCopy(id: string): Promise<TAPEPKCopy> {
    return tapClient.get(`/pitch/epk/${id}`)
  },

  async updateEPKCopy(id: string, updates: Partial<TAPEPKCopy>): Promise<TAPEPKCopy> {
    return tapClient.patch(`/pitch/epk/${id}`, updates)
  },

  // ============================================================================
  // RADIO PLUGGER BRIEF
  // ============================================================================

  async generatePluggerBrief(data: {
    artist_name: string
    track_title: string
    genre: string
    key_selling_points: string[]
    target_audience?: string
    similar_artists?: string[]
  }): Promise<TAPPluggerBrief> {
    return tapClient.post('/pitch/plugger-brief', data)
  },

  async getPluggerBrief(id: string): Promise<TAPPluggerBrief> {
    return tapClient.get(`/pitch/plugger-brief/${id}`)
  },

  async updatePluggerBrief(
    id: string,
    updates: Partial<TAPPluggerBrief>
  ): Promise<TAPPluggerBrief> {
    return tapClient.patch(`/pitch/plugger-brief/${id}`, updates)
  },

  // ============================================================================
  // LOOPOS INTEGRATION HELPERS
  // ============================================================================

  /**
   * Generate all pitch materials from LoopOS context
   */
  async generateAllMaterials(context: {
    artistName: string
    trackTitle?: string
    albumTitle?: string
    genre: string
    releaseDate?: string
    playbook?: any
    packs?: any
    journalInsights?: string[]
  }): Promise<{
    pressRelease: TAPPressRelease
    epk: TAPEPKCopy
    pluggerBrief: TAPPluggerBrief
  }> {
    // Extract key points from context
    const keyPoints = [...(context.playbook?.highlights || []), ...(context.journalInsights || [])]

    // Generate press release
    const pressRelease = await this.generatePressRelease({
      artist_name: context.artistName,
      track_title: context.trackTitle,
      album_title: context.albumTitle,
      release_date: context.releaseDate,
      key_points: keyPoints.slice(0, 5),
    })

    // Generate EPK
    const epk = await this.generateEPKCopy({
      artist_name: context.artistName,
      genre: context.genre,
      career_highlights: context.playbook?.achievements || [],
    })

    // Generate plugger brief
    const pluggerBrief = await this.generatePluggerBrief({
      artist_name: context.artistName,
      track_title: context.trackTitle || 'Latest Release',
      genre: context.genre,
      key_selling_points: keyPoints.slice(0, 3),
    })

    return { pressRelease, epk, pluggerBrief }
  },

  /**
   * Generate pitch materials from LoopOS Playbook + Packs
   */
  async generateFromPlaybook(
    artistName: string,
    playbookContent: any,
    packs: any[]
  ): Promise<{
    pressRelease: TAPPressRelease
    epk: TAPEPKCopy
  }> {
    // Extract relevant content from playbook
    const highlights =
      playbookContent.chapters
        ?.map((ch: any) => ch.key_points)
        .flat()
        .slice(0, 5) || []

    // Extract pack insights
    const packInsights = packs
      .map((p) => p.content?.insights || [])
      .flat()
      .slice(0, 3)

    const pressRelease = await this.generatePressRelease({
      artist_name: artistName,
      key_points: [...highlights, ...packInsights],
    })

    const epk = await this.generateEPKCopy({
      artist_name: artistName,
      career_highlights: highlights,
    })

    return { pressRelease, epk }
  },
}
