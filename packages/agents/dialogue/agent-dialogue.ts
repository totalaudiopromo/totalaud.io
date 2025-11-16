/**
 * Agent Dialogue System
 * Structured messaging system for agent-to-user communication
 */

import type { ThemeId } from '@totalaud/os-state/campaign'

export type AgentName = 'scout' | 'coach' | 'tracker' | 'insight'

export type DialoguePriority = 'low' | 'medium' | 'high' | 'critical'

export interface AgentMessage {
  id: string
  agent: AgentName
  message: string
  priority: DialoguePriority
  requiresUserDecision: boolean
  options?: string[]
  context?: Record<string, unknown>
  clipId?: string
  timestamp: Date
  expiresAt?: Date
}

export interface AgentDialogueOptions {
  maxMessages: number
  autoExpireMinutes: number
}

export class AgentDialogueManager {
  private messages: Map<string, AgentMessage> = new Map()
  private listeners: Array<(message: AgentMessage) => void> = []
  private options: AgentDialogueOptions

  constructor(options?: Partial<AgentDialogueOptions>) {
    this.options = {
      maxMessages: 50,
      autoExpireMinutes: 30,
      ...options,
    }
  }

  /**
   * Send a message from an agent
   */
  sendMessage(
    agent: AgentName,
    message: string,
    options?: {
      priority?: DialoguePriority
      requiresUserDecision?: boolean
      options?: string[]
      context?: Record<string, unknown>
      clipId?: string
      expiresInMinutes?: number
    }
  ): AgentMessage {
    const agentMessage: AgentMessage = {
      id: crypto.randomUUID(),
      agent,
      message,
      priority: options?.priority || 'medium',
      requiresUserDecision: options?.requiresUserDecision || false,
      options: options?.options,
      context: options?.context,
      clipId: options?.clipId,
      timestamp: new Date(),
      expiresAt: options?.expiresInMinutes
        ? new Date(Date.now() + options.expiresInMinutes * 60 * 1000)
        : new Date(Date.now() + this.options.autoExpireMinutes * 60 * 1000),
    }

    this.messages.set(agentMessage.id, agentMessage)

    // Trim old messages
    if (this.messages.size > this.options.maxMessages) {
      const oldestKeys = Array.from(this.messages.keys()).slice(
        0,
        this.messages.size - this.options.maxMessages
      )
      oldestKeys.forEach((key) => this.messages.delete(key))
    }

    // Notify listeners
    this.listeners.forEach((listener) => listener(agentMessage))

    return agentMessage
  }

  /**
   * Get all active messages
   */
  getMessages(filter?: {
    agent?: AgentName
    priority?: DialoguePriority
    requiresDecision?: boolean
    clipId?: string
  }): AgentMessage[] {
    let messages = Array.from(this.messages.values())

    // Remove expired messages
    const now = new Date()
    messages = messages.filter((msg) => !msg.expiresAt || msg.expiresAt > now)

    // Apply filters
    if (filter?.agent) {
      messages = messages.filter((msg) => msg.agent === filter.agent)
    }

    if (filter?.priority) {
      messages = messages.filter((msg) => msg.priority === filter.priority)
    }

    if (filter?.requiresDecision !== undefined) {
      messages = messages.filter(
        (msg) => msg.requiresUserDecision === filter.requiresDecision
      )
    }

    if (filter?.clipId) {
      messages = messages.filter((msg) => msg.clipId === filter.clipId)
    }

    return messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Dismiss a message
   */
  dismissMessage(messageId: string): boolean {
    return this.messages.delete(messageId)
  }

  /**
   * Subscribe to new messages
   */
  subscribe(listener: (message: AgentMessage) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  /**
   * Clear all messages
   */
  clearAll(): void {
    this.messages.clear()
  }

  /**
   * Get messages requiring user decision
   */
  getPendingDecisions(): AgentMessage[] {
    return this.getMessages({ requiresDecision: true })
  }
}

/**
 * Format message for OS personality
 */
export function formatMessageForOS(message: AgentMessage, osTheme: ThemeId): string {
  const agentPrefix = message.agent.toUpperCase()

  switch (osTheme) {
    case 'ascii':
      // Command-line style
      return `[${agentPrefix}] ${message.message}${message.requiresUserDecision ? ' [Y/N]' : ''}`

    case 'xp':
      // Friendly Windows XP style
      return `💬 ${capitalise(message.agent)} says: ${message.message}${message.requiresUserDecision ? ' What would you like to do?' : ''}`

    case 'aqua':
      // Narrative Mac OS style
      return `${capitalise(message.agent)} noticed: ${message.message}${message.requiresUserDecision ? ' Your input would be valuable.' : ''}`

    case 'daw':
      // Technical DAW style
      return `[${agentPrefix}] ${message.message}${message.requiresUserDecision ? ' | ACTION REQUIRED' : ''}`

    case 'analogue':
      // Warm human style
      return `${capitalise(message.agent)} feels: ${message.message}${message.requiresUserDecision ? ' What do you think?' : ''}`

    default:
      return message.message
  }
}

function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Global dialogue manager
export const agentDialogue = new AgentDialogueManager()
