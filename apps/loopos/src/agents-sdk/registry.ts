import type { AgentSkill, SkillRegistry, SkillRegistryEntry } from './types'

/**
 * Agent Skill Registry
 *
 * Central registry for all available agent skills.
 * Skills must be registered before they can be executed.
 */

class SkillRegistryManager {
  private registry: SkillRegistry = new Map()

  /**
   * Register a new skill
   */
  registerSkill(skill: AgentSkill): void {
    if (this.registry.has(skill.id)) {
      console.warn(`Skill with ID "${skill.id}" is already registered. Skipping.`)
      return
    }

    const entry: SkillRegistryEntry = {
      skill,
      registeredAt: new Date().toISOString(),
      enabled: true,
    }

    this.registry.set(skill.id, entry)
    console.log(`Skill registered: ${skill.id} (${skill.name})`)
  }

  /**
   * Get a skill by ID
   */
  getSkillById(skillId: string): AgentSkill | null {
    const entry = this.registry.get(skillId)
    if (!entry) return null
    if (!entry.enabled) return null
    return entry.skill
  }

  /**
   * List all registered skills
   */
  listSkills(options?: {
    category?: string
    enabledOnly?: boolean
  }): AgentSkill[] {
    const entries = Array.from(this.registry.values())

    let filtered = entries

    if (options?.enabledOnly !== false) {
      filtered = filtered.filter((e) => e.enabled)
    }

    if (options?.category) {
      filtered = filtered.filter((e) => e.skill.category === options.category)
    }

    return filtered.map((e) => e.skill)
  }

  /**
   * Enable or disable a skill
   */
  setSkillEnabled(skillId: string, enabled: boolean): void {
    const entry = this.registry.get(skillId)
    if (!entry) {
      throw new Error(`Skill with ID "${skillId}" not found`)
    }
    entry.enabled = enabled
  }

  /**
   * Get registry stats
   */
  getStats(): {
    total: number
    enabled: number
    disabled: number
    byCategory: Record<string, number>
  } {
    const entries = Array.from(this.registry.values())
    const enabled = entries.filter((e) => e.enabled).length
    const disabled = entries.length - enabled

    const byCategory: Record<string, number> = {}
    entries.forEach((entry) => {
      const cat = entry.skill.category
      byCategory[cat] = (byCategory[cat] || 0) + 1
    })

    return {
      total: entries.length,
      enabled,
      disabled,
      byCategory,
    }
  }

  /**
   * Clear all skills (for testing)
   */
  clearAll(): void {
    this.registry.clear()
  }
}

// Singleton instance
export const skillRegistry = new SkillRegistryManager()

// Export types
export type { SkillRegistryManager }
