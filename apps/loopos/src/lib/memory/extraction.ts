/**
 * LoopOS Memory Extraction Pipelines
 * AI-powered extraction of semantic memory from different content types
 */

import Anthropic from '@anthropic-ai/sdk'
import { memoryDb, type MemoryNodeKind, type MemoryEdgeRelation } from '@total-audio/loopos-db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// =====================================================
// TYPES
// =====================================================

export interface ExtractedNode {
  kind: MemoryNodeKind
  label: string
  summary?: string
  confidence: number
}

export interface ExtractedEdge {
  fromLabel: string
  toLabel: string
  relation: MemoryEdgeRelation
  strength: number
  evidence?: string
}

export interface ExtractionResult {
  nodes: ExtractedNode[]
  edges: ExtractedEdge[]
}

// =====================================================
// EXTRACTION PROMPTS
// =====================================================

const EXTRACTION_SYSTEM_PROMPT = `You are a semantic memory extraction system for LoopOS, a creative operating system for musicians.

Your job is to analyse content and extract:
1. **Nodes** - Key concepts (themes, tones, visual motifs, values, skills, goals, genres, etc.)
2. **Edges** - Relationships between concepts

Node kinds:
- theme: Creative themes (e.g., "nostalgia", "urban isolation", "freedom")
- tone: Emotional tones (e.g., "melancholic", "energetic", "intimate")
- visual_motif: Visual concepts (e.g., "neon lights", "grainy textures", "vintage film")
- audience: Target audience (e.g., "late-night listeners", "bedroom pop fans")
- value: Artist values (e.g., "authenticity", "experimentation", "community")
- skill: Technical skills (e.g., "808 programming", "vocal layering")
- goal: Creative goals (e.g., "release debut EP", "build fanbase")
- collaborator: Collaborators/influences (e.g., "producer X", "inspired by Y")
- genre: Musical genres (e.g., "lo-fi hip hop", "indie electronic")
- instrument: Instruments (e.g., "MPC", "Juno-106", "vocals")
- technique: Production techniques (e.g., "sidechain compression", "vinyl sampling")

Edge relations:
- relates_to: General connection
- contrasts_with: Opposition or contrast
- inspires: One concept inspires another
- caused_by: Causal relationship
- part_of: Hierarchical relationship
- similar_to: Similarity

**Output Format** (JSON):
{
  "nodes": [
    { "kind": "theme", "label": "Nostalgia", "summary": "Recurring theme of longing for past memories", "confidence": 0.9 }
  ],
  "edges": [
    { "fromLabel": "Nostalgia", "toLabel": "Lo-fi production", "relation": "inspires", "strength": 0.8, "evidence": "Uses tape saturation to evoke vintage feel" }
  ]
}

**Guidelines**:
- Extract 3-10 nodes per piece of content
- Only extract high-confidence concepts (> 0.5)
- Be specific with labels ("dark urban aesthetics" not just "dark")
- Avoid duplicates within same extraction
- Confidence: 0.9+ = explicit, 0.7-0.9 = implied, 0.5-0.7 = weak signal
- British spelling always`

// =====================================================
// EXTRACTION FUNCTIONS
// =====================================================

/**
 * Extract memory from journal entry
 */
export async function extractFromJournal(
  workspaceId: string,
  entryId: string,
  content: string
): Promise<ExtractionResult> {
  const userPrompt = `Extract semantic memory from this journal entry:

---
${content}
---

Focus on: themes, tones, values, goals, skills mentioned.`

  const extracted = await callExtractionAI(userPrompt)
  await persistExtraction(workspaceId, extracted, 'journal', entryId, content)
  return extracted
}

/**
 * Extract memory from coach conversation
 */
export async function extractFromCoach(
  workspaceId: string,
  conversationId: string,
  messages: Array<{ role: string; content: string }>
): Promise<ExtractionResult> {
  const conversationText = messages
    .map((m) => `${m.role === 'user' ? 'Artist' : 'Coach'}: ${m.content}`)
    .join('\n\n')

  const userPrompt = `Extract semantic memory from this AI Coach conversation:

---
${conversationText}
---

Focus on: goals, challenges, values, themes, skills discussed.`

  const extracted = await callExtractionAI(userPrompt)
  await persistExtraction(workspaceId, extracted, 'coach', conversationId, conversationText)
  return extracted
}

/**
 * Extract memory from timeline milestone
 */
export async function extractFromTimeline(
  workspaceId: string,
  milestoneId: string,
  title: string,
  description?: string
): Promise<ExtractionResult> {
  const content = `${title}${description ? `\n${description}` : ''}`

  const userPrompt = `Extract semantic memory from this timeline milestone:

---
${content}
---

Focus on: goals, achievements, collaborators, genres, techniques mentioned.`

  const extracted = await callExtractionAI(userPrompt)
  await persistExtraction(workspaceId, extracted, 'timeline', milestoneId, content)
  return extracted
}

/**
 * Extract memory from designer scene
 */
export async function extractFromDesigner(
  workspaceId: string,
  sceneId: string,
  prompt: string,
  nodes: Array<{ type: string; data: { label?: string; content?: string } }>
): Promise<ExtractionResult> {
  const nodesText = nodes.map((n) => `${n.type}: ${n.data.label || n.data.content || ''}`).join('\n')

  const content = `Designer Prompt: ${prompt}\n\nCanvas Nodes:\n${nodesText}`

  const userPrompt = `Extract semantic memory from this AI Designer scene:

---
${content}
---

Focus on: visual motifs, themes, tones, techniques used in the creative vision.`

  const extracted = await callExtractionAI(userPrompt)
  await persistExtraction(workspaceId, extracted, 'designer', sceneId, content)
  return extracted
}

/**
 * Extract memory from pack
 */
export async function extractFromPack(
  workspaceId: string,
  packId: string,
  name: string,
  description?: string,
  tags?: string[]
): Promise<ExtractionResult> {
  const content = `Pack: ${name}${description ? `\n${description}` : ''}${
    tags ? `\nTags: ${tags.join(', ')}` : ''
  }`

  const userPrompt = `Extract semantic memory from this creative pack:

---
${content}
---

Focus on: genres, techniques, instruments, visual motifs, themes.`

  const extracted = await callExtractionAI(userPrompt)
  await persistExtraction(workspaceId, extracted, 'pack', packId, content)
  return extracted
}

/**
 * Extract memory from moodboard
 */
export async function extractFromMoodboard(
  workspaceId: string,
  moodboardId: string,
  title: string,
  images: Array<{ caption?: string; tags?: string[] }>
): Promise<ExtractionResult> {
  const imagesText = images
    .map(
      (img, i) =>
        `Image ${i + 1}: ${img.caption || 'No caption'}${img.tags ? ` [${img.tags.join(', ')}]` : ''}`
    )
    .join('\n')

  const content = `Moodboard: ${title}\n\n${imagesText}`

  const userPrompt = `Extract semantic memory from this moodboard:

---
${content}
---

Focus on: visual motifs, tones, themes, aesthetics.`

  const extracted = await callExtractionAI(userPrompt)
  await persistExtraction(workspaceId, extracted, 'moodboard', moodboardId, content)
  return extracted
}

/**
 * Extract memory from usage patterns
 */
export async function extractFromUsage(
  workspaceId: string,
  summary: {
    topFeatures: string[]
    activityPattern: string
    focusAreas: string[]
  }
): Promise<ExtractionResult> {
  const content = `Usage Summary:
- Top Features: ${summary.topFeatures.join(', ')}
- Activity Pattern: ${summary.activityPattern}
- Focus Areas: ${summary.focusAreas.join(', ')}`

  const userPrompt = `Extract semantic memory from this usage pattern analysis:

---
${content}
---

Focus on: skills being developed, goals being pursued, values (e.g., experimentation vs polish).`

  const extracted = await callExtractionAI(userPrompt)
  // No source for usage - it's aggregate
  await persistExtraction(workspaceId, extracted, 'usage', workspaceId, content)
  return extracted
}

// =====================================================
// AI EXTRACTION
// =====================================================

async function callExtractionAI(userPrompt: string): Promise<ExtractionResult> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textContent = response.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in AI response')
    }

    // Extract JSON from response (might be wrapped in ```json)
    let jsonText = textContent.text.trim()
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    }

    const result = JSON.parse(jsonText) as ExtractionResult

    // Validate structure
    if (!Array.isArray(result.nodes) || !Array.isArray(result.edges)) {
      throw new Error('Invalid extraction result structure')
    }

    return result
  } catch (error) {
    console.error('Memory extraction failed:', error)
    // Return empty result on error
    return { nodes: [], edges: [] }
  }
}

// =====================================================
// PERSISTENCE
// =====================================================

async function persistExtraction(
  workspaceId: string,
  extraction: ExtractionResult,
  sourceType: 'journal' | 'coach' | 'timeline' | 'designer' | 'pack' | 'moodboard' | 'usage',
  sourceId: string,
  originalContent: string
): Promise<void> {
  try {
    // Create nodes and track IDs
    const nodeIdMap = new Map<string, string>()

    for (const node of extraction.nodes) {
      const nodeId = await memoryDb.nodes.upsert(
        workspaceId,
        node.kind,
        node.label,
        node.summary,
        node.confidence
      )
      nodeIdMap.set(node.label, nodeId)

      // Link to source
      await memoryDb.sources.create(
        workspaceId,
        nodeId,
        sourceType,
        sourceId,
        originalContent.slice(0, 200) // First 200 chars as excerpt
      )
    }

    // Create edges
    for (const edge of extraction.edges) {
      const fromNodeId = nodeIdMap.get(edge.fromLabel)
      const toNodeId = nodeIdMap.get(edge.toLabel)

      if (fromNodeId && toNodeId) {
        await memoryDb.edges.create(
          workspaceId,
          fromNodeId,
          toNodeId,
          edge.relation,
          edge.strength,
          edge.evidence
        )
      }
    }
  } catch (error) {
    console.error('Failed to persist extraction:', error)
    // Don't throw - extraction should be non-blocking
  }
}

// =====================================================
// BATCH EXTRACTION
// =====================================================

/**
 * Run extraction on all workspace content (for initial setup or refresh)
 */
export async function extractAllWorkspaceContent(workspaceId: string): Promise<{
  journal: number
  coach: number
  timeline: number
  designer: number
  packs: number
  moodboards: number
}> {
  const counts = {
    journal: 0,
    coach: 0,
    timeline: 0,
    designer: 0,
    packs: 0,
    moodboards: 0,
  }

  // This would fetch all content from database and run extraction
  // Implementation depends on your specific data models

  // Example:
  // const journalEntries = await journalDb.list(workspaceId)
  // for (const entry of journalEntries) {
  //   await extractFromJournal(workspaceId, entry.id, entry.content)
  //   counts.journal++
  // }

  return counts
}
