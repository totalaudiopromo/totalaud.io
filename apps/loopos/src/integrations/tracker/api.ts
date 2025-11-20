import { tapClient } from '../client'
import type { TAPSubmission, TAPFollowUp } from '../types'
import type { Node } from '@total-audio/loopos-db'

export const trackerApi = {
  // ============================================================================
  // SUBMISSIONS
  // ============================================================================

  async createSubmission(data: {
    target_name: string
    target_type: 'blog' | 'radio' | 'playlist' | 'press' | 'other'
    pitch_angle: string
    contact_email?: string
    contact_name?: string
    notes?: string
  }): Promise<TAPSubmission> {
    return tapClient.post('/tracker/submissions', data)
  },

  async listSubmissions(filters?: {
    status?: string
    target_type?: string
  }): Promise<TAPSubmission[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.target_type) params.append('target_type', filters.target_type)

    const query = params.toString()
    return tapClient.get(`/tracker/submissions${query ? `?${query}` : ''}`)
  },

  async getSubmission(submissionId: string): Promise<TAPSubmission> {
    return tapClient.get(`/tracker/submissions/${submissionId}`)
  },

  async updateSubmission(
    submissionId: string,
    updates: Partial<TAPSubmission>
  ): Promise<TAPSubmission> {
    return tapClient.patch(`/tracker/submissions/${submissionId}`, updates)
  },

  async deleteSubmission(submissionId: string): Promise<void> {
    return tapClient.delete(`/tracker/submissions/${submissionId}`)
  },

  // ============================================================================
  // FOLLOW-UPS
  // ============================================================================

  async createFollowUp(data: {
    submission_id: string
    scheduled_date: string
    notes?: string
  }): Promise<TAPFollowUp> {
    return tapClient.post('/tracker/follow-ups', data)
  },

  async listFollowUps(submissionId?: string): Promise<TAPFollowUp[]> {
    const query = submissionId ? `?submission_id=${submissionId}` : ''
    return tapClient.get(`/tracker/follow-ups${query}`)
  },

  async markFollowUpComplete(followUpId: string): Promise<TAPFollowUp> {
    return tapClient.patch(`/tracker/follow-ups/${followUpId}`, { completed: true })
  },

  // ============================================================================
  // LOOPOS INTEGRATION HELPERS
  // ============================================================================

  /**
   * Convert LoopOS nodes to Tracker submissions
   */
  async convertNodesToSubmissions(nodes: Node[]): Promise<TAPSubmission[]> {
    const submissions: TAPSubmission[] = []

    for (const node of nodes) {
      // Extract submission data from node metadata
      const submission = await this.createSubmission({
        target_name: (node.metadata?.target_name as string) || node.title,
        target_type: (node.metadata?.target_type as any) || 'other',
        pitch_angle: node.content,
        contact_email: node.metadata?.contact_email as string,
        contact_name: node.metadata?.contact_name as string,
        notes: node.metadata?.notes as string,
      })
      submissions.push(submission)
    }

    return submissions
  },

  /**
   * Generate pitch angle based on LoopOS context
   */
  async generatePitchAngle(context: {
    artistName: string
    trackTitle: string
    genre: string
    targetType: string
    playbook?: any
    packs?: any
  }): Promise<string> {
    // This would call an AI service (like Anthropic) to generate the pitch
    // For now, return a template
    return `${context.artistName}'s new ${context.genre} track "${context.trackTitle}" - perfect for ${context.targetType} featuring [unique angle from playbook/packs]`
  },

  /**
   * Preview submission outcomes based on past data
   */
  async previewOutcomes(
    targetName: string,
    targetType: string
  ): Promise<{
    averageResponseTime: string
    successRate: number
    tips: string[]
  }> {
    // This would analyze historical data from Tracker
    // For now, return mock data
    return {
      averageResponseTime: '7-14 days',
      successRate: 0.35,
      tips: [
        'Best time to submit: Tuesday-Thursday mornings',
        'Follow up after 1 week if no response',
        'Personalise your pitch with their recent coverage',
      ],
    }
  },
}
