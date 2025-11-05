/**
 * Node Registry
 * Phase 15.3: Connected Console & Orchestration
 *
 * Purpose:
 * - Central registry for all agent nodes
 * - Type-safe node spawning and discovery
 * - Integration with Node Palette and Command Palette
 */

import type { NodeKind, NodeSpawnPosition } from '@/types/console'
import type { ReactNode } from 'react'

/**
 * Node definition for registry
 */
export interface NodeDefinition {
  kind: NodeKind
  title: string
  icon: string
  description: string
  spawn: (props: NodeSpawnProps) => ReactNode
  hotkey?: string
  paletteGroup: 'agents' | 'tools' | 'views'
  category: 'plan' | 'do' | 'track' | 'learn'
}

/**
 * Props passed to node spawn factory
 */
export interface NodeSpawnProps {
  campaignId?: string
  userId?: string
  position?: NodeSpawnPosition
  initialData?: Record<string, unknown>
}

/**
 * Node Registry
 * Maintains list of all available nodes and their spawn factories
 */
class NodeRegistry {
  private nodes: Map<NodeKind, NodeDefinition> = new Map()

  /**
   * Register a node definition
   */
  register(definition: NodeDefinition): void {
    this.nodes.set(definition.kind, definition)
  }

  /**
   * Get all registered node definitions
   */
  getNodeDefs(): NodeDefinition[] {
    return Array.from(this.nodes.values())
  }

  /**
   * Get node definition by kind
   */
  getNodeByKind(kind: NodeKind): NodeDefinition | undefined {
    return this.nodes.get(kind)
  }

  /**
   * Get nodes filtered by category
   */
  getNodesByCategory(category: NodeDefinition['category']): NodeDefinition[] {
    return Array.from(this.nodes.values()).filter((node) => node.category === category)
  }

  /**
   * Get nodes filtered by palette group
   */
  getNodesByGroup(group: NodeDefinition['paletteGroup']): NodeDefinition[] {
    return Array.from(this.nodes.values()).filter((node) => node.paletteGroup === group)
  }

  /**
   * Check if a node kind is registered
   */
  hasNode(kind: NodeKind): boolean {
    return this.nodes.has(kind)
  }

  /**
   * Clear all registered nodes (for testing)
   */
  clear(): void {
    this.nodes.clear()
  }
}

// Singleton instance
const registry = new NodeRegistry()

/**
 * Register Intel Agent Node
 */
registry.register({
  kind: 'intel',
  title: 'Intel Agent',
  icon: '🔍',
  description: 'Research and enrichment with document context',
  hotkey: 'i',
  paletteGroup: 'agents',
  category: 'plan',
  spawn: (props) => {
    // Lazy import to avoid circular dependencies
    const { IntelAgentNode } = require('@/components/agents/IntelAgentNode')
    return IntelAgentNode({
      campaignId: props.campaignId,
      userId: props.userId,
      ...props.initialData,
    })
  },
})

/**
 * Register Pitch Agent Node
 */
registry.register({
  kind: 'pitch',
  title: 'Pitch Agent',
  icon: '✉️',
  description: 'Generate pitches with asset attachments',
  hotkey: 'p',
  paletteGroup: 'agents',
  category: 'do',
  spawn: (props) => {
    const { PitchAgentNode } = require('@/components/agents/PitchAgentNode')
    return PitchAgentNode({
      campaignId: props.campaignId,
      userId: props.userId,
      ...props.initialData,
    })
  },
})

/**
 * Register Tracker Agent Node
 */
registry.register({
  kind: 'tracker',
  title: 'Tracker Agent',
  icon: '📊',
  description: 'Track outreach logs with asset links',
  hotkey: 't',
  paletteGroup: 'agents',
  category: 'track',
  spawn: (props) => {
    const { TrackerAgentNode } = require('@/components/agents/TrackerAgentNode')
    return TrackerAgentNode({
      campaignId: props.campaignId,
      userId: props.userId,
      ...props.initialData,
    })
  },
})

/**
 * Export singleton instance
 */
export const nodeRegistry = registry

/**
 * Convenience exports
 */
export const getNodeDefs = () => registry.getNodeDefs()
export const getNodeByKind = (kind: NodeKind) => registry.getNodeByKind(kind)
export const getNodesByCategory = (category: NodeDefinition['category']) =>
  registry.getNodesByCategory(category)
export const getNodesByGroup = (group: NodeDefinition['paletteGroup']) =>
  registry.getNodesByGroup(group)
export const hasNode = (kind: NodeKind) => registry.hasNode(kind)

/**
 * Type guard to check if a string is a valid NodeKind
 */
export function isNodeKind(value: string): value is NodeKind {
  return ['intel', 'pitch', 'tracker'].includes(value)
}

/**
 * Type guard to check if a string is a valid ConsoleTab
 */
export function isConsoleTab(value: string): value is 'plan' | 'do' | 'track' | 'learn' {
  return ['plan', 'do', 'track', 'learn'].includes(value)
}
