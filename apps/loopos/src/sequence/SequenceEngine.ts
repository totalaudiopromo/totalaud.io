/**
 * Sequence Engine
 * Resolves dependencies, detects circular dependencies, and manages node sequencing
 */

import type { LoopOSNode } from '@total-audio/loopos-db'

export interface DependencyNode {
  id: string
  title: string
  depends_on: string[]
  status: string
  auto_start: boolean
}

export interface SequenceWarning {
  type: 'circular' | 'unconnected' | 'blocked' | 'missing_dependency'
  severity: 'error' | 'warning' | 'info'
  message: string
  node_ids: string[]
}

export interface SequenceMap {
  nodes: DependencyNode[]
  dependencies: Map<string, string[]> // node_id -> [dependency_ids]
  dependents: Map<string, string[]> // node_id -> [nodes_that_depend_on_this]
  levels: Map<string, number> // node_id -> execution_level
  warnings: SequenceWarning[]
}

export class SequenceEngine {
  /**
   * Analyse nodes and build a complete sequence map
   */
  static analyseSequence(nodes: LoopOSNode[]): SequenceMap {
    const sequenceMap: SequenceMap = {
      nodes: nodes.map((n) => ({
        id: n.id,
        title: n.title,
        depends_on: n.depends_on,
        status: n.status,
        auto_start: n.auto_start,
      })),
      dependencies: new Map(),
      dependents: new Map(),
      levels: new Map(),
      warnings: [],
    }

    // Build dependency maps
    for (const node of nodes) {
      sequenceMap.dependencies.set(node.id, node.depends_on)

      // Build reverse map (dependents)
      for (const depId of node.depends_on) {
        const existingDependents = sequenceMap.dependents.get(depId) || []
        sequenceMap.dependents.set(depId, [...existingDependents, node.id])
      }
    }

    // Detect circular dependencies
    const circularPaths = this.detectCircularDependencies(sequenceMap)
    for (const path of circularPaths) {
      sequenceMap.warnings.push({
        type: 'circular',
        severity: 'error',
        message: `Circular dependency detected: ${path.map((id) => this.getNodeTitle(nodes, id)).join(' → ')}`,
        node_ids: path,
      })
    }

    // Calculate execution levels (topological sort)
    const levels = this.calculateExecutionLevels(sequenceMap)
    sequenceMap.levels = levels

    // Detect missing dependencies
    const missingDeps = this.detectMissingDependencies(sequenceMap, nodes)
    for (const [nodeId, missingDepIds] of missingDeps) {
      sequenceMap.warnings.push({
        type: 'missing_dependency',
        severity: 'error',
        message: `Node "${this.getNodeTitle(nodes, nodeId)}" has missing dependencies: ${missingDepIds.join(', ')}`,
        node_ids: [nodeId, ...missingDepIds],
      })
    }

    // Detect unconnected nodes
    const unconnectedNodes = this.detectUnconnectedNodes(sequenceMap)
    if (unconnectedNodes.length > 0) {
      sequenceMap.warnings.push({
        type: 'unconnected',
        severity: 'info',
        message: `${unconnectedNodes.length} node(s) have no dependencies or dependents`,
        node_ids: unconnectedNodes,
      })
    }

    // Detect blocked nodes
    const blockedNodes = this.detectBlockedNodes(sequenceMap, nodes)
    for (const nodeId of blockedNodes) {
      sequenceMap.warnings.push({
        type: 'blocked',
        severity: 'warning',
        message: `Node "${this.getNodeTitle(nodes, nodeId)}" is blocked by incomplete dependencies`,
        node_ids: [nodeId],
      })
    }

    return sequenceMap
  }

  /**
   * Detect circular dependencies using DFS
   */
  private static detectCircularDependencies(sequenceMap: SequenceMap): string[][] {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const cycles: string[][] = []

    function dfs(nodeId: string, path: string[]): void {
      visited.add(nodeId)
      recursionStack.add(nodeId)
      path.push(nodeId)

      const dependencies = sequenceMap.dependencies.get(nodeId) || []

      for (const depId of dependencies) {
        if (!visited.has(depId)) {
          dfs(depId, [...path])
        } else if (recursionStack.has(depId)) {
          // Found a cycle
          const cycleStart = path.indexOf(depId)
          cycles.push([...path.slice(cycleStart), depId])
        }
      }

      recursionStack.delete(nodeId)
    }

    for (const node of sequenceMap.nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id, [])
      }
    }

    return cycles
  }

  /**
   * Calculate execution levels using topological sort
   */
  private static calculateExecutionLevels(sequenceMap: SequenceMap): Map<string, number> {
    const levels = new Map<string, number>()
    const inDegree = new Map<string, number>()

    // Calculate in-degree for each node
    for (const node of sequenceMap.nodes) {
      inDegree.set(node.id, node.depends_on.length)
    }

    // Start with nodes that have no dependencies (level 0)
    const queue: string[] = []
    for (const node of sequenceMap.nodes) {
      if ((inDegree.get(node.id) || 0) === 0) {
        levels.set(node.id, 0)
        queue.push(node.id)
      }
    }

    // Process nodes level by level
    while (queue.length > 0) {
      const nodeId = queue.shift()!
      const currentLevel = levels.get(nodeId) || 0

      const dependents = sequenceMap.dependents.get(nodeId) || []
      for (const dependentId of dependents) {
        const newInDegree = (inDegree.get(dependentId) || 0) - 1
        inDegree.set(dependentId, newInDegree)

        if (newInDegree === 0) {
          levels.set(dependentId, currentLevel + 1)
          queue.push(dependentId)
        }
      }
    }

    // Nodes with remaining in-degree are part of cycles
    for (const node of sequenceMap.nodes) {
      if (!levels.has(node.id)) {
        levels.set(node.id, -1) // Mark as circular
      }
    }

    return levels
  }

  /**
   * Detect missing dependencies (referenced but don't exist)
   */
  private static detectMissingDependencies(
    sequenceMap: SequenceMap,
    nodes: LoopOSNode[]
  ): Map<string, string[]> {
    const nodeIds = new Set(nodes.map((n) => n.id))
    const missing = new Map<string, string[]>()

    for (const node of nodes) {
      const missingDeps = node.depends_on.filter((depId) => !nodeIds.has(depId))
      if (missingDeps.length > 0) {
        missing.set(node.id, missingDeps)
      }
    }

    return missing
  }

  /**
   * Detect unconnected nodes (no dependencies or dependents)
   */
  private static detectUnconnectedNodes(sequenceMap: SequenceMap): string[] {
    const unconnected: string[] = []

    for (const node of sequenceMap.nodes) {
      const hasDependencies = (sequenceMap.dependencies.get(node.id) || []).length > 0
      const hasDependents = (sequenceMap.dependents.get(node.id) || []).length > 0

      if (!hasDependencies && !hasDependents) {
        unconnected.push(node.id)
      }
    }

    return unconnected
  }

  /**
   * Detect nodes that are blocked by incomplete dependencies
   */
  private static detectBlockedNodes(sequenceMap: SequenceMap, nodes: LoopOSNode[]): string[] {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]))
    const blocked: string[] = []

    for (const node of nodes) {
      if (node.status === 'pending' || node.status === 'in_progress') {
        const hasIncompleteDeps = node.depends_on.some((depId) => {
          const dep = nodeMap.get(depId)
          return dep && dep.status !== 'completed'
        })

        if (hasIncompleteDeps) {
          blocked.push(node.id)
        }
      }
    }

    return blocked
  }

  /**
   * Get nodes ready to start (all dependencies completed)
   */
  static getReadyNodes(nodes: LoopOSNode[]): LoopOSNode[] {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]))
    const ready: LoopOSNode[] = []

    for (const node of nodes) {
      if (node.status === 'pending') {
        const allDepsCompleted = node.depends_on.every((depId) => {
          const dep = nodeMap.get(depId)
          return dep && dep.status === 'completed'
        })

        if (allDepsCompleted) {
          ready.push(node)
        }
      }
    }

    // Sort by sequence_order if available
    return ready.sort((a, b) => {
      if (a.sequence_order !== null && b.sequence_order !== null) {
        return a.sequence_order - b.sequence_order
      }
      return 0
    })
  }

  /**
   * Get next node to auto-start
   */
  static getNextAutoStartNode(nodes: LoopOSNode[]): LoopOSNode | null {
    const readyNodes = this.getReadyNodes(nodes)
    return readyNodes.find((n) => n.auto_start) || null
  }

  /**
   * Check if a node can be started (dependencies met)
   */
  static canStartNode(nodeId: string, nodes: LoopOSNode[]): boolean {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return false
    if (node.status !== 'pending') return false

    const nodeMap = new Map(nodes.map((n) => [n.id, n]))

    return node.depends_on.every((depId) => {
      const dep = nodeMap.get(depId)
      return dep && dep.status === 'completed'
    })
  }

  /**
   * Get nodes that will be unblocked when a specific node completes
   */
  static getNodesUnblockedBy(completedNodeId: string, nodes: LoopOSNode[]): LoopOSNode[] {
    return nodes.filter((node) => {
      if (node.status !== 'pending') return false
      if (!node.depends_on.includes(completedNodeId)) return false

      // Check if all other dependencies are complete
      const nodeMap = new Map(nodes.map((n) => [n.id, n]))
      const otherDeps = node.depends_on.filter((id) => id !== completedNodeId)

      return otherDeps.every((depId) => {
        const dep = nodeMap.get(depId)
        return dep && dep.status === 'completed'
      })
    })
  }

  /**
   * Get completion percentage for a sequence
   */
  static getSequenceProgress(nodes: LoopOSNode[]): {
    total: number
    completed: number
    in_progress: number
    pending: number
    percentage: number
  } {
    const total = nodes.length
    const completed = nodes.filter((n) => n.status === 'completed').length
    const in_progress = nodes.filter((n) => n.status === 'in_progress').length
    const pending = nodes.filter((n) => n.status === 'pending').length

    return {
      total,
      completed,
      in_progress,
      pending,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  }

  /**
   * Helper to get node title by ID
   */
  private static getNodeTitle(nodes: LoopOSNode[], nodeId: string): string {
    return nodes.find((n) => n.id === nodeId)?.title || nodeId
  }
}
