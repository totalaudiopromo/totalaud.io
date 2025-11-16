/**
 * Coach Agent Behaviour
 * Task breakdown, structure improvement, and guidance
 */

import type { TimelineClip } from '@totalaud/os-state/campaign'
import type {
  AgentBehaviour,
  AgentBehaviourOutput,
} from '../runtime/agent-runner'
import type { AgentContext } from '../runtime/agent-context'
import { DEFAULT_AGENT_CAPABILITIES } from '../runtime/agent-context'
import type { ClipBehaviour } from '@totalaud/timeline/clip-interpreter'

export const coachBehaviour: AgentBehaviour = {
  name: 'coach',
  description: 'Coaching agent - breaks down tasks and improves structure',
  supportedClipTypes: ['planning', 'custom'],
  capabilities: {
    ...DEFAULT_AGENT_CAPABILITIES,
    canRequestInput: true, // Coach often needs clarification
  },

  canExecute(clip: TimelineClip, context: AgentContext): boolean {
    const metadata = clip.metadata as ClipBehaviour | undefined
    return (
      clip.agentSource === 'coach' &&
      (metadata?.behaviourType === 'planning' || metadata?.behaviourType === 'custom')
    )
  },

  async execute(clip: TimelineClip, context: AgentContext): Promise<AgentBehaviourOutput> {
    const metadata = clip.metadata as ClipBehaviour | undefined
    const payload = metadata?.payload || {}

    try {
      // Analyse the task
      const analysis = await analyseTask(clip, context)

      // Check if task is too vague
      if (analysis.needsClarification) {
        return {
          success: true,
          message: 'Task needs clarification from user',
          data: analysis,
          requiresUserInput: true,
          userInputPrompt: `This task "${clip.name}" seems vague. ${analysis.clarificationQuestion}`,
        }
      }

      // Break down into subtasks
      const subtasks = await breakdownTask(clip, analysis, context)

      // Create clips for each subtask
      const clipsToCreate = subtasks.map((subtask, index) => ({
        name: `${subtask.name}`,
        trackId: clip.trackId,
        startTime: clip.startTime + clip.duration + index * subtask.estimatedDuration,
        duration: subtask.estimatedDuration,
        colour: '#8B5CF6',
        agentSource: subtask.suggestedAgent as 'scout' | 'coach' | 'tracker' | 'insight',
        cardLinks: [],
        metadata: {
          behaviourType: subtask.behaviourType,
          executionMode: 'assist',
          payload: {
            parentClip: clip.id,
            taskIndex: index,
            ...subtask.metadata,
          },
        },
      }))

      // Generate pride card for good planning
      const cardsToCreate = [
        {
          type: 'clarity',
          content: `Coach broke "${clip.name}" into ${subtasks.length} clear steps. Ready to execute!`,
          linkedClipId: clip.id,
        },
      ]

      return {
        success: true,
        message: `Task broken down into ${subtasks.length} subtasks`,
        data: { subtasks, analysis },
        clipsToCreate,
        cardsToCreate,
      }
    } catch (error) {
      return {
        success: false,
        message: `Planning failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  },
}

/**
 * Analyse task complexity and clarity
 */
async function analyseTask(
  clip: TimelineClip,
  context: AgentContext
): Promise<TaskAnalysis> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const taskName = clip.name.toLowerCase()

  // Check if task is vague
  const vagueTriggers = ['do', 'work on', 'handle', 'deal with', 'figure out']
  const isVague = vagueTriggers.some((trigger) => taskName.includes(trigger))

  return {
    taskName: clip.name,
    complexity: clip.duration > 20 ? 'high' : clip.duration > 10 ? 'medium' : 'low',
    needsClarification: isVague,
    clarificationQuestion: isVague
      ? 'Could you specify what exact actions should be taken?'
      : undefined,
    estimatedSubtasks: Math.ceil(clip.duration / 5),
    suggestedDuration: clip.duration,
  }
}

/**
 * Break down task into subtasks
 */
async function breakdownTask(
  clip: TimelineClip,
  analysis: TaskAnalysis,
  context: AgentContext
): Promise<Subtask[]> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const subtasks: Subtask[] = []
  const taskName = clip.name

  // Intelligent task breakdown based on task name
  if (taskName.toLowerCase().includes('outreach')) {
    subtasks.push(
      {
        name: 'Draft outreach message',
        estimatedDuration: 5,
        behaviourType: 'custom',
        suggestedAgent: 'coach',
        metadata: { action: 'draft' },
      },
      {
        name: 'Identify targets',
        estimatedDuration: 8,
        behaviourType: 'research',
        suggestedAgent: 'scout',
        metadata: { targetCount: 20 },
      },
      {
        name: 'Send emails',
        estimatedDuration: 3,
        behaviourType: 'custom',
        suggestedAgent: 'tracker',
        metadata: { action: 'send' },
      },
      {
        name: 'Schedule follow-ups',
        estimatedDuration: 4,
        behaviourType: 'followup',
        suggestedAgent: 'tracker',
        metadata: { delayDays: 7 },
      }
    )
  } else {
    // Generic breakdown
    const count = Math.min(analysis.estimatedSubtasks, 5)
    for (let i = 0; i < count; i++) {
      subtasks.push({
        name: `${taskName} - Step ${i + 1}`,
        estimatedDuration: Math.ceil(clip.duration / count),
        behaviourType: 'custom',
        suggestedAgent: 'coach',
        metadata: {},
      })
    }
  }

  return subtasks
}

interface TaskAnalysis {
  taskName: string
  complexity: 'low' | 'medium' | 'high'
  needsClarification: boolean
  clarificationQuestion?: string
  estimatedSubtasks: number
  suggestedDuration: number
}

interface Subtask {
  name: string
  estimatedDuration: number
  behaviourType: string
  suggestedAgent: string
  metadata: Record<string, unknown>
}
