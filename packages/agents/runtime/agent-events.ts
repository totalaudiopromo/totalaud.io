/**
 * Agent Events
 * Defines all agent-related events
 */

import type { TimelineClip, AnalogueCard } from '@totalaud/os-state/campaign'

export type AgentEventType =
  | 'clip_activated'
  | 'clip_completed'
  | 'clip_rejected'
  | 'card_created'
  | 'timeline_updated'
  | 'agent_error'
  | 'agent_output'
  | 'agent_request_input'
  | 'agent_started'
  | 'agent_finished'

export interface AgentEvent {
  type: AgentEventType
  timestamp: Date
  agentName?: string
  clipId?: string
  cardId?: string
  data?: unknown
}

export interface ClipActivatedEvent extends AgentEvent {
  type: 'clip_activated'
  clip: TimelineClip
  playheadPosition: number
}

export interface ClipCompletedEvent extends AgentEvent {
  type: 'clip_completed'
  clip: TimelineClip
  output?: unknown
}

export interface ClipRejectedEvent extends AgentEvent {
  type: 'clip_rejected'
  clipId: string
  reason: string
}

export interface CardCreatedEvent extends AgentEvent {
  type: 'card_created'
  card: AnalogueCard
  sourceClipId?: string
}

export interface TimelineUpdatedEvent extends AgentEvent {
  type: 'timeline_updated'
  changes: {
    clipsAdded?: string[]
    clipsModified?: string[]
    clipsRemoved?: string[]
  }
}

export interface AgentErrorEvent extends AgentEvent {
  type: 'agent_error'
  agentName: string
  error: Error | string
  clipId?: string
}

export interface AgentOutputEvent extends AgentEvent {
  type: 'agent_output'
  agentName: string
  output: unknown
  clipId?: string
}

export interface AgentRequestInputEvent extends AgentEvent {
  type: 'agent_request_input'
  agentName: string
  message: string
  options?: string[]
  context?: Record<string, unknown>
}

export interface AgentStartedEvent extends AgentEvent {
  type: 'agent_started'
  agentName: string
  clipId: string
  behaviour: string
}

export interface AgentFinishedEvent extends AgentEvent {
  type: 'agent_finished'
  agentName: string
  clipId: string
  success: boolean
  output?: unknown
}

export type AgentEventMap = {
  clip_activated: ClipActivatedEvent
  clip_completed: ClipCompletedEvent
  clip_rejected: ClipRejectedEvent
  card_created: CardCreatedEvent
  timeline_updated: TimelineUpdatedEvent
  agent_error: AgentErrorEvent
  agent_output: AgentOutputEvent
  agent_request_input: AgentRequestInputEvent
  agent_started: AgentStartedEvent
  agent_finished: AgentFinishedEvent
}

export type AgentEventListener<T extends AgentEventType> = (
  event: AgentEventMap[T]
) => void | Promise<void>
