/**
 * Memory Context Helper
 * Retrieves and formats artist identity for AI prompt injection
 */

import { memoryDb, type ArtistIdentity } from '@total-audio/loopos-db'

// =====================================================
// CONTEXT RETRIEVAL
// =====================================================

export interface MemoryContext {
  hasMemory: boolean
  themes: string[]
  tones: string[]
  values: string[]
  visualMotifs: string[]
  prompt: string
}

/**
 * Get artist identity memory context for AI prompts
 */
export async function getMemoryContext(workspaceId: string): Promise<MemoryContext> {
  try {
    const identity = await memoryDb.identity.get(workspaceId)

    if (!identity || identity.node_count === 0) {
      return {
        hasMemory: false,
        themes: [],
        tones: [],
        values: [],
        visualMotifs: [],
        prompt: '',
      }
    }

    const themes = identity.themes?.slice(0, 5).map((t) => t.label) || []
    const tones = identity.tones?.slice(0, 5).map((t) => t.label) || []
    const values = identity.values?.slice(0, 3).map((v) => v.label) || []
    const visualMotifs = identity.visual_motifs?.slice(0, 5).map((v) => v.label) || []

    const prompt = formatMemoryPrompt(themes, tones, values, visualMotifs)

    return {
      hasMemory: true,
      themes,
      tones,
      values,
      visualMotifs,
      prompt,
    }
  } catch (error) {
    console.error('Failed to get memory context:', error)
    return {
      hasMemory: false,
      themes: [],
      tones: [],
      values: [],
      visualMotifs: [],
      prompt: '',
    }
  }
}

// =====================================================
// PROMPT FORMATTING
// =====================================================

/**
 * Format memory context into AI prompt section
 */
function formatMemoryPrompt(
  themes: string[],
  tones: string[],
  values: string[],
  visualMotifs: string[]
): string {
  const sections: string[] = []

  if (themes.length > 0) {
    sections.push(`**Creative Themes**: ${themes.join(', ')}`)
  }

  if (tones.length > 0) {
    sections.push(`**Emotional Tones**: ${tones.join(', ')}`)
  }

  if (values.length > 0) {
    sections.push(`**Core Values**: ${values.join(', ')}`)
  }

  if (visualMotifs.length > 0) {
    sections.push(`**Visual Motifs**: ${visualMotifs.join(', ')}`)
  }

  if (sections.length === 0) {
    return ''
  }

  return `## Artist Identity (Memory Graph)

${sections.join('\n')}

Use this identity context to personalise your responses and suggestions.`
}

// =====================================================
// FEATURE-SPECIFIC CONTEXT
// =====================================================

/**
 * Get memory context formatted for Coach
 */
export async function getCoachMemoryContext(workspaceId: string): Promise<string> {
  const context = await getMemoryContext(workspaceId)

  if (!context.hasMemory) {
    return ''
  }

  return `${context.prompt}

**Coach Guidelines**:
- Reference the artist's themes, tones, and values when giving advice
- Suggest strategies that align with their creative identity
- Help them develop skills and pursue goals that match their values`
}

/**
 * Get memory context formatted for Designer
 */
export async function getDesignerMemoryContext(workspaceId: string): Promise<string> {
  const context = await getMemoryContext(workspaceId)

  if (!context.hasMemory) {
    return ''
  }

  return `${context.prompt}

**Designer Guidelines**:
- Incorporate the artist's visual motifs and themes into scene suggestions
- Match the emotional tones when creating visual concepts
- Ensure generated scenes align with their aesthetic identity`
}

/**
 * Get memory context formatted for Packs
 */
export async function getPacksMemoryContext(workspaceId: string): Promise<string> {
  const context = await getMemoryContext(workspaceId)

  if (!context.hasMemory) {
    return ''
  }

  return `${context.prompt}

**Pack Generation Guidelines**:
- Suggest assets and tools that match the artist's themes and tones
- Prioritise techniques and instruments aligned with their creative direction
- Consider their values when recommending workflows and approaches`
}

// =====================================================
// CONTEXT ENRICHMENT
// =====================================================

/**
 * Get recent activity context (for more dynamic personalisation)
 */
export async function getRecentActivityContext(
  workspaceId: string,
  limit = 5
): Promise<{
  recentThemes: string[]
  recentGoals: string[]
}> {
  try {
    // Get recently created/updated theme nodes
    const themeNodes = await memoryDb.nodes.listByKind(workspaceId, 'theme', limit)
    const goalNodes = await memoryDb.nodes.listByKind(workspaceId, 'goal', limit)

    return {
      recentThemes: themeNodes.map((n) => n.label),
      recentGoals: goalNodes.map((n) => n.label),
    }
  } catch (error) {
    console.error('Failed to get recent activity context:', error)
    return {
      recentThemes: [],
      recentGoals: [],
    }
  }
}

/**
 * Get top skills for skill-based suggestions
 */
export async function getSkillsContext(workspaceId: string): Promise<string[]> {
  try {
    const skillNodes = await memoryDb.nodes.getTopByKind(workspaceId, 'skill', 10)
    return skillNodes.map((n) => n.label)
  } catch (error) {
    console.error('Failed to get skills context:', error)
    return []
  }
}
