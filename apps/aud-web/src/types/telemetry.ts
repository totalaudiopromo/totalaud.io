/**
 * Telemetry event contract for FlowCore.
 * Defines allowed event types and their metadata structures.
 */

export type TelemetryEventType =
  | 'save'
  | 'share'
  | 'agentRun'
  | 'pitch_sent'
  | 'tracker_update'
  | 'tabChange'
  | 'idle'
  | 'sessionStart'
  | 'sessionEnd'
  | 'dashboard_opened'
  | 'flow_hub_opened'
  | 'flow_hub_tab_changed'
  | 'flow_brief_generated'
  | 'epk_metrics_viewed'
  | 'epk_asset_tracked'
  | 'epk_collaborators_loaded'
  | 'epk_invite_sent'
  | 'epk_invite_revoked'
  | 'epk_collaborator_removed'
  | 'epk_comments_loaded'
  | 'epk_comment_created'
  | 'epk_comment_updated'
  | 'epk_comment_deleted'

export interface TelemetryEventMetadataMap {
  save: {
    action?: string
    [key: string]: unknown
  }
  share: {
    target?: string
    [key: string]: unknown
  }
  agentRun: {
    agentName?: string
    success?: boolean
    [key: string]: unknown
  }
  pitch_sent: {
    campaignId?: string
    contactName?: string
    assetIds?: string[]
    [key: string]: unknown
  }
  tracker_update: {
    campaignId?: string
    logCount?: number
    source?: string
    [key: string]: unknown
  }
  tabChange: {
    fromTab?: string
    toTab?: string
    [key: string]: unknown
  }
  idle: {
    reason?: string
    [key: string]: unknown
  }
  sessionStart: Record<string, unknown>
  sessionEnd: Record<string, unknown>
  dashboard_opened: {
    campaignId?: string
    period?: string | number
    dataPoints?: number
    [key: string]: unknown
  }
  flow_hub_opened: {
    period?: number
    [key: string]: unknown
  }
  flow_hub_tab_changed: {
    tab?: string
    [key: string]: unknown
  }
  flow_brief_generated: {
    period?: number
    forceRefresh?: boolean
    cached?: boolean
    [key: string]: unknown
  }
  epk_metrics_viewed: {
    epkId?: string
    groupBy?: string
    eventCount?: number
    [key: string]: unknown
  }
  epk_asset_tracked: {
    epkId?: string
    assetId?: string
    eventType?: string
    [key: string]: unknown
  }
  epk_collaborators_loaded: {
    collaboratorCount?: number
    [key: string]: unknown
  }
  epk_invite_sent: {
    role?: string
    invitedEmail?: string
    inviteId?: string
    [key: string]: unknown
  }
  epk_invite_revoked: {
    inviteId?: string
    [key: string]: unknown
  }
  epk_collaborator_removed: {
    collaboratorId?: string
    [key: string]: unknown
  }
  epk_comments_loaded: {
    commentCount?: number
    [key: string]: unknown
  }
  epk_comment_created: {
    hasParent?: boolean
    commentId?: string
    [key: string]: unknown
  }
  epk_comment_updated: {
    commentId?: string
    [key: string]: unknown
  }
  epk_comment_deleted: {
    commentId?: string
    [key: string]: unknown
  }
}

export type TelemetryMetadata<T extends TelemetryEventType> = TelemetryEventMetadataMap[T]

export interface TelemetryEvent<T extends TelemetryEventType = TelemetryEventType> {
  event_type: T
  metadata?: TelemetryMetadata<T>
  duration_ms?: number
  created_at?: string
}
