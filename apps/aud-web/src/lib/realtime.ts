/**
 * Realtime Event Management
 *
 * Manages Supabase realtime subscriptions for Console live updates
 * Stage 6: Real-time campaign tracking
 */

import { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabaseClient, type CampaignEvent } from './supabaseClient'

export interface RealtimeConfig {
  campaignId: string
  onEvent: (event: CampaignEvent) => void
  onMetricsUpdate?: () => void
  onInsightGenerated?: () => void
}

let activeChannel: RealtimeChannel | null = null

/**
 * Subscribe to realtime campaign events
 * Automatically streams new events into the Console activity feed
 */
export async function subscribeToCampaignEvents(config: RealtimeConfig): Promise<RealtimeChannel> {
  const supabase = getSupabaseClient()
  const { campaignId, onEvent, onMetricsUpdate, onInsightGenerated } = config

  // Unsubscribe from existing channel if any
  if (activeChannel) {
    console.log('Unsubscribing from previous channel')
    await supabase.removeChannel(activeChannel)
    activeChannel = null
  }

  console.log('Subscribing to campaign events', { campaignId })

  // Create new channel for this campaign
  const channel = supabase
    .channel(`campaign:${campaignId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'campaign_events',
        filter: `campaign_id=eq.${campaignId}`,
      },
      (payload) => {
        const startTime = performance.now()
        console.log('Event received', { payload })

        const newEvent = payload.new as CampaignEvent
        onEvent(newEvent)

        const latency = performance.now() - startTime
        console.log('Event propagated', { latency: `${latency.toFixed(2)}ms` })

        if (latency > 200) {
          console.warn('High latency detected', { latency: `${latency.toFixed(2)}ms` })
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'campaign_metrics',
        filter: `campaign_id=eq.${campaignId}`,
      },
      (payload) => {
        console.log('Metrics updated', { payload })
        if (onMetricsUpdate) {
          onMetricsUpdate()
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'campaign_insights',
        filter: `campaign_id=eq.${campaignId}`,
      },
      (payload) => {
        console.log('Insight generated', { payload })
        if (onInsightGenerated) {
          onInsightGenerated()
        }
      }
    )
    .subscribe((status) => {
      console.log('Subscription status', { status })

      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to campaign events', { campaignId })
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Channel error', new Error('Failed to subscribe to campaign events'))
      } else if (status === 'TIMED_OUT') {
        console.error('Subscription timeout', new Error('Realtime connection timed out'))
      }
    })

  activeChannel = channel
  return channel
}

/**
 * Unsubscribe from all realtime channels
 */
export async function unsubscribeFromCampaignEvents(): Promise<void> {
  if (!activeChannel) {
    console.log('No active channel to unsubscribe from')
    return
  }

  const supabase = getSupabaseClient()
  console.log('Unsubscribing from campaign events')

  await supabase.removeChannel(activeChannel)
  activeChannel = null
}

/**
 * Get current subscription status
 */
export function getSubscriptionStatus(): 'subscribed' | 'unsubscribed' | 'error' {
  if (!activeChannel) return 'unsubscribed'

  const state = activeChannel.state
  if (state === 'joined') return 'subscribed'
  if (state === 'errored' || state === 'closed') return 'error'
  return 'unsubscribed'
}
