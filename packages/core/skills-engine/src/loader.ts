import fs from 'fs/promises'
import path from 'path'
import yaml from 'yaml'
import { SkillSchema, type Skill } from './types'

const SKILLS_DIR = path.join(process.cwd(), 'skills')

export async function loadSkill(skillPath: string): Promise<Skill> {
  const content = await fs.readFile(skillPath, 'utf-8')
  const data = yaml.parse(content)
  return SkillSchema.parse(data)
}

export async function loadAllSkills(): Promise<Map<string, Skill>> {
  const skills = new Map<string, Skill>()
  
  try {
    const categories = await fs.readdir(SKILLS_DIR)
    
    for (const category of categories) {
      const categoryPath = path.join(SKILLS_DIR, category)
      const stat = await fs.stat(categoryPath)
      
      if (!stat.isDirectory()) continue
      
      const files = await fs.readdir(categoryPath)
      
      for (const file of files) {
        if (!file.endsWith('.yml') && !file.endsWith('.yaml')) continue
        
        const skillPath = path.join(categoryPath, file)
        const skill = await loadSkill(skillPath)
        skills.set(skill.name, skill)
      }
    }
  } catch (error) {
    console.error('Error loading skills:', error)
  }
  
  return skills
}

