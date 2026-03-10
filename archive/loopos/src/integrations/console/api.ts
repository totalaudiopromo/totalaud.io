import { tapClient } from '../client'
import type { TAPTask, TAPCreativeRef, TAPCampaign } from '../types'
import type { Node } from '@total-audio/loopos-db'

export const consoleApi = {
  // ============================================================================
  // TASKS
  // ============================================================================

  async createTask(data: {
    title: string
    description: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    due_date?: string
    tags?: string[]
  }): Promise<TAPTask> {
    return tapClient.post('/console/tasks', data)
  },

  async listTasks(filters?: {
    status?: string
    priority?: string
    tags?: string[]
  }): Promise<TAPTask[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.priority) params.append('priority', filters.priority)
    if (filters?.tags) params.append('tags', filters.tags.join(','))

    const query = params.toString()
    return tapClient.get(`/console/tasks${query ? `?${query}` : ''}`)
  },

  async updateTask(taskId: string, updates: Partial<TAPTask>): Promise<TAPTask> {
    return tapClient.patch(`/console/tasks/${taskId}`, updates)
  },

  async deleteTask(taskId: string): Promise<void> {
    return tapClient.delete(`/console/tasks/${taskId}`)
  },

  // ============================================================================
  // CREATIVE REFERENCES
  // ============================================================================

  async createCreativeRef(data: {
    type: 'image' | 'video' | 'audio' | 'document' | 'link'
    title: string
    url: string
    description?: string
    tags?: string[]
  }): Promise<TAPCreativeRef> {
    return tapClient.post('/console/creative-refs', data)
  },

  async listCreativeRefs(filters?: { type?: string; tags?: string[] }): Promise<TAPCreativeRef[]> {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.tags) params.append('tags', filters.tags.join(','))

    const query = params.toString()
    return tapClient.get(`/console/creative-refs${query ? `?${query}` : ''}`)
  },

  async deleteCreativeRef(refId: string): Promise<void> {
    return tapClient.delete(`/console/creative-refs/${refId}`)
  },

  // ============================================================================
  // CAMPAIGNS
  // ============================================================================

  async createCampaign(data: {
    name: string
    start_date?: string
    end_date?: string
    goals?: string[]
  }): Promise<TAPCampaign> {
    return tapClient.post('/console/campaigns', data)
  },

  async listCampaigns(): Promise<TAPCampaign[]> {
    return tapClient.get('/console/campaigns')
  },

  async updateCampaign(campaignId: string, updates: Partial<TAPCampaign>): Promise<TAPCampaign> {
    return tapClient.patch(`/console/campaigns/${campaignId}`, updates)
  },

  // ============================================================================
  // LOOPOS INTEGRATION HELPERS
  // ============================================================================

  /**
   * Export a LoopOS node sequence to Console tasks
   */
  async exportNodeSequence(nodes: Node[]): Promise<TAPTask[]> {
    const tasks: TAPTask[] = []

    for (const node of nodes) {
      const task = await this.createTask({
        title: node.title,
        description: node.content,
        priority: (node.metadata?.priority as any) || 'medium',
        due_date: node.metadata?.due_date as string,
        tags: (node.metadata?.tags as string[]) || [node.type],
      })
      tasks.push(task)
    }

    return tasks
  },

  /**
   * Sync task status back to LoopOS
   */
  async syncTaskStatus(taskId: string): Promise<TAPTask> {
    return tapClient.get(`/console/tasks/${taskId}`)
  },
}
