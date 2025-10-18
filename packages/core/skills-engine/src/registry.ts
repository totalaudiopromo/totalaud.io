import { supabase } from '@total-audio/core-supabase'
import type { Skill } from './types'
import { loadAllSkills } from './loader'

export class SkillRegistry {
  private skills: Map<string, Skill> = new Map()
  private initialized = false

  async initialize() {
    if (this.initialized) return
    
    // Load from YAML files
    this.skills = await loadAllSkills()
    
    // Sync to database
    await this.syncToDatabase()
    
    this.initialized = true
  }

  private async syncToDatabase() {
    for (const [name, skill] of this.skills) {
      const { error } = await supabase
        .from('skills')
        .upsert({
          name: skill.name,
          version: skill.version,
          category: skill.category,
          description: skill.description,
          input_schema: skill.input,
          output_schema: skill.output,
          provider: skill.provider,
          model: skill.model,
          config: skill.config || {},
          enabled: skill.enabled,
          is_beta: skill.is_beta
        }, {
          onConflict: 'name'
        })
      
      if (error) {
        console.error(`Failed to sync skill ${name}:`, error)
      }
    }
  }

  get(name: string): Skill | undefined {
    return this.skills.get(name)
  }

  getAll(): Skill[] {
    return Array.from(this.skills.values())
  }

  getByCategory(category: string): Skill[] {
    return this.getAll().filter(s => s.category === category)
  }
}

export const skillRegistry = new SkillRegistry()

