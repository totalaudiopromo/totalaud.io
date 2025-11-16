/**
 * Timeline Clip Types - Phase 9
 * DAW OS Agent Behaviour Engine
 */

import { z } from 'zod'

/**
 * Clip Behaviour Types - What the clip tells the agent to do
 */
export type ClipBehaviourType =
  | 'research' // Scout agent - discover contacts, opportunities
  | 'planning' // Coach agent - break down tasks, suggest sequences
  | 'followup' // Coach/Tracker - follow-up communications
  | 'analysis' // Insight agent - detect bottlenecks, generate insights
  | 'story' // Insight agent - create emotional story cards
  | 'custom' // Custom behaviour defined in payload

/**
 * Agent Type - Which agent should execute this clip
 */
export type AgentType = 'scout' | 'coach' | 'tracker' | 'insight'

/**
 * Execution Mode - How the clip should be executed
 */
export type ExecutionMode =
  | 'auto' // Automatic execution when playhead reaches clip
  | 'manual' // Only execute when user clicks
  | 'assist' // Execute but require user decision/approval

/**
 * Clip Status
 */
export type ClipStatus = 'pending' | 'active' | 'completed' | 'rejected' | 'failed'

/**
 * Timeline Clip Schema
 */
export const TimelineClipSchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid(),
  trackId: z.string().uuid(),
  agentType: z.enum(['scout', 'coach', 'tracker', 'insight']),
  behaviourType: z.enum(['research', 'planning', 'followup', 'analysis', 'story', 'custom']),
  executionMode: z.enum(['auto', 'manual', 'assist']),
  status: z.enum(['pending', 'active', 'completed', 'rejected', 'failed']),
  title: z.string(),
  description: z.string().optional(),
  startTime: z.number(), // In beats or seconds
  duration: z.number(), // In beats or seconds
  colour: z.string().optional(),
  payload: z.record(z.unknown()).optional(), // Behaviour-specific data
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
})

export type TimelineClip = z.infer<typeof TimelineClipSchema>

/**
 * Timeline Track - Container for clips
 */
export const TimelineTrackSchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid(),
  name: z.string(),
  agentType: z.enum(['scout', 'coach', 'tracker', 'insight']).optional(),
  colour: z.string().optional(),
  order: z.number(),
  muted: z.boolean().default(false),
  solo: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type TimelineTrack = z.infer<typeof TimelineTrackSchema>

/**
 * Playhead State
 */
export interface PlayheadState {
  position: number // Current position in beats/seconds
  playing: boolean
  looping: boolean
  loopStart: number
  loopEnd: number
}

/**
 * Timeline State
 */
export interface TimelineState {
  campaignId: string
  tracks: TimelineTrack[]
  clips: TimelineClip[]
  playhead: PlayheadState
  zoom: number
  snapToGrid: boolean
  gridDivision: number // 4 = quarter notes, 8 = eighth notes, etc.
  bpm: number // For tempo-synced timelines (DAW OS)
}

/**
 * Clip Execution Context - Passed to agent behaviours
 */
export interface ClipExecutionContext {
  clip: TimelineClip
  track: TimelineTrack
  campaignId: string
  userId: string
  osTheme: 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue'
  playheadPosition: number
  metadata: Record<string, unknown>
}

/**
 * Agent Behaviour Result
 */
export const AgentBehaviourResultSchema = z.object({
  success: z.boolean(),
  clipId: z.string().uuid(),
  agentType: z.enum(['scout', 'coach', 'tracker', 'insight']),
  behaviourType: z.string(),
  output: z.record(z.unknown()).optional(),
  message: z.string(),
  generatedClips: z.array(TimelineClipSchema).optional(), // New clips created by agent
  errors: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type AgentBehaviourResult = z.infer<typeof AgentBehaviourResultSchema>
