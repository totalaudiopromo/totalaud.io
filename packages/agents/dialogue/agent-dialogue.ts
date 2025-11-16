/**
 * Agent Dialogue System - Phase 9
 * Communication between agents and users with OS-specific formatting
 */

import type { AgentType } from '@total-audio/timeline'
import type { OSTheme } from '../runtime/agent-context'

/**
 * Dialogue Message Type
 */
export type DialogueMessageType = 'info' | 'question' | 'warning' | 'success' | 'error'

/**
 * Agent Dialogue Message
 */
export interface AgentDialogueMessage {
  id: string
  agentType: AgentType
  type: DialogueMessageType
  message: string
  requiresUserDecision: boolean
  options?: string[]
  context?: Record<string, unknown>
  timestamp: string
  clipId?: string
}

/**
 * OS-Specific Message Formatter
 */
export interface OSMessageFormatter {
  /**
   * Format message for the OS theme
   */
  format(message: AgentDialogueMessage): FormattedMessage

  /**
   * Get agent prefix/icon for the OS theme
   */
  getAgentPrefix(agentType: AgentType): string

  /**
   * Get message colour for the OS theme
   */
  getMessageColour(type: DialogueMessageType): string
}

/**
 * Formatted Message (OS-specific)
 */
export interface FormattedMessage {
  prefix: string
  message: string
  colour: string
  style: Record<string, string>
  icon?: string
}

/**
 * ASCII OS Formatter
 */
class AsciiFormatter implements OSMessageFormatter {
  format(message: AgentDialogueMessage): FormattedMessage {
    const prefix = this.getAgentPrefix(message.agentType)
    const colour = this.getMessageColour(message.type)

    return {
      prefix: `[${prefix}]`,
      message: `> ${message.message}`,
      colour,
      style: {
        fontFamily: 'monospace',
        textTransform: 'lowercase',
        letterSpacing: '0.5px',
      },
    }
  }

  getAgentPrefix(agentType: AgentType): string {
    const prefixes: Record<AgentType, string> = {
      scout: 'scr',
      coach: 'cch',
      tracker: 'trk',
      insight: 'ins',
    }
    return prefixes[agentType] || 'agt'
  }

  getMessageColour(type: DialogueMessageType): string {
    const colours: Record<DialogueMessageType, string> = {
      info: '#00FF00',
      question: '#00FFFF',
      warning: '#FFFF00',
      success: '#00FF00',
      error: '#FF0000',
    }
    return colours[type]
  }
}

/**
 * XP OS Formatter
 */
class XpFormatter implements OSMessageFormatter {
  format(message: AgentDialogueMessage): FormattedMessage {
    const prefix = this.getAgentPrefix(message.agentType)
    const colour = this.getMessageColour(message.type)

    return {
      prefix: `${prefix}:`,
      message: message.message,
      colour,
      style: {
        fontFamily: 'Tahoma, Arial, sans-serif',
        textTransform: 'none',
      },
      icon: this.getIcon(message.agentType),
    }
  }

  getAgentPrefix(agentType: AgentType): string {
    const prefixes: Record<AgentType, string> = {
      scout: 'Scout',
      coach: 'Coach',
      tracker: 'Tracker',
      insight: 'Insight',
    }
    return prefixes[agentType]
  }

  getMessageColour(type: DialogueMessageType): string {
    const colours: Record<DialogueMessageType, string> = {
      info: '#0066CC',
      question: '#FF6600',
      warning: '#CC9900',
      success: '#009900',
      error: '#CC0000',
    }
    return colours[type]
  }

  getIcon(agentType: AgentType): string {
    const icons: Record<AgentType, string> = {
      scout: '🔍',
      coach: '💡',
      tracker: '📊',
      insight: '🧠',
    }
    return icons[agentType]
  }
}

/**
 * Aqua OS Formatter
 */
class AquaFormatter implements OSMessageFormatter {
  format(message: AgentDialogueMessage): FormattedMessage {
    const prefix = this.getAgentPrefix(message.agentType)
    const colour = this.getMessageColour(message.type)

    return {
      prefix,
      message: message.message,
      colour,
      style: {
        fontFamily: 'SF Pro, -apple-system, sans-serif',
        textTransform: 'none',
        backdropFilter: 'blur(20px)',
      },
    }
  }

  getAgentPrefix(agentType: AgentType): string {
    return agentType.charAt(0).toUpperCase() + agentType.slice(1)
  }

  getMessageColour(type: DialogueMessageType): string {
    const colours: Record<DialogueMessageType, string> = {
      info: '#007AFF',
      question: '#FF9500',
      warning: '#FF9500',
      success: '#34C759',
      error: '#FF3B30',
    }
    return colours[type]
  }
}

/**
 * DAW OS Formatter
 */
class DawFormatter implements OSMessageFormatter {
  format(message: AgentDialogueMessage): FormattedMessage {
    const prefix = this.getAgentPrefix(message.agentType)
    const colour = this.getMessageColour(message.type)

    return {
      prefix: `[${prefix}]`,
      message: message.message,
      colour,
      style: {
        fontFamily: 'monospace',
        textTransform: 'lowercase',
        fontSize: '12px',
        lineHeight: '1.4',
      },
    }
  }

  getAgentPrefix(agentType: AgentType): string {
    const prefixes: Record<AgentType, string> = {
      scout: 'sct',
      coach: 'cch',
      tracker: 'trk',
      insight: 'ins',
    }
    return prefixes[agentType]
  }

  getMessageColour(type: DialogueMessageType): string {
    const colours: Record<DialogueMessageType, string> = {
      info: '#3AA9BE',
      question: '#FF9800',
      warning: '#FFC107',
      success: '#4CAF50',
      error: '#F44336',
    }
    return colours[type]
  }
}

/**
 * Analogue OS Formatter
 */
class AnalogueFormatter implements OSMessageFormatter {
  format(message: AgentDialogueMessage): FormattedMessage {
    const prefix = this.getAgentPrefix(message.agentType)
    const colour = this.getMessageColour(message.type)

    return {
      prefix,
      message: message.message,
      colour,
      style: {
        fontFamily: 'serif',
        textTransform: 'none',
        fontStyle: 'italic',
      },
    }
  }

  getAgentPrefix(agentType: AgentType): string {
    const prefixes: Record<AgentType, string> = {
      scout: 'Scout',
      coach: 'Coach',
      tracker: 'Tracker',
      insight: 'Insight',
    }
    return `${prefixes[agentType]}`
  }

  getMessageColour(type: DialogueMessageType): string {
    const colours: Record<DialogueMessageType, string> = {
      info: '#8B7355',
      question: '#D2691E',
      warning: '#DAA520',
      success: '#556B2F',
      error: '#A52A2A',
    }
    return colours[type]
  }
}

/**
 * Agent Dialogue System
 */
export class AgentDialogueSystem {
  private messages: AgentDialogueMessage[] = []
  private formatters: Map<OSTheme, OSMessageFormatter> = new Map([
    ['ascii', new AsciiFormatter()],
    ['xp', new XpFormatter()],
    ['aqua', new AquaFormatter()],
    ['daw', new DawFormatter()],
    ['analogue', new AnalogueFormatter()],
  ])

  /**
   * Create a dialogue message
   */
  createMessage(
    agentType: AgentType,
    type: DialogueMessageType,
    message: string,
    options?: {
      requiresUserDecision?: boolean
      options?: string[]
      context?: Record<string, unknown>
      clipId?: string
    }
  ): AgentDialogueMessage {
    const dialogueMessage: AgentDialogueMessage = {
      id: `${agentType}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      agentType,
      type,
      message,
      requiresUserDecision: options?.requiresUserDecision || false,
      options: options?.options,
      context: options?.context,
      timestamp: new Date().toISOString(),
      clipId: options?.clipId,
    }

    this.messages.push(dialogueMessage)
    return dialogueMessage
  }

  /**
   * Format message for OS theme
   */
  formatMessage(message: AgentDialogueMessage, osTheme: OSTheme): FormattedMessage {
    const formatter = this.formatters.get(osTheme)

    if (!formatter) {
      throw new Error(`No formatter found for OS theme: ${osTheme}`)
    }

    return formatter.format(message)
  }

  /**
   * Get recent messages
   */
  getRecentMessages(limit: number = 10): AgentDialogueMessage[] {
    return this.messages.slice(-limit)
  }

  /**
   * Get messages by agent type
   */
  getMessagesByAgent(agentType: AgentType): AgentDialogueMessage[] {
    return this.messages.filter((msg) => msg.agentType === agentType)
  }

  /**
   * Get messages requiring user decision
   */
  getPendingDecisions(): AgentDialogueMessage[] {
    return this.messages.filter((msg) => msg.requiresUserDecision)
  }

  /**
   * Clear all messages
   */
  clearMessages(): void {
    this.messages = []
  }

  /**
   * Get message count
   */
  getMessageCount(): number {
    return this.messages.length
  }
}

/**
 * Global dialogue system instance
 */
let globalDialogueSystem: AgentDialogueSystem | null = null

/**
 * Get or create the global dialogue system
 */
export function getDialogueSystem(): AgentDialogueSystem {
  if (!globalDialogueSystem) {
    globalDialogueSystem = new AgentDialogueSystem()
  }
  return globalDialogueSystem
}

/**
 * Reset the global dialogue system (useful for testing)
 */
export function resetDialogueSystem(): void {
  globalDialogueSystem = null
}
