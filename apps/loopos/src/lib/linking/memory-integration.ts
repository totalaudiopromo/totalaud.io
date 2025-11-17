/**
 * Phase 32: Creative Continuity — Memory Graph Integration
 *
 * When a note becomes a node, add memory edges to connect them semantically.
 * The Memory Graph learns from these connections and surfaces patterns.
 */

import { memoryDb } from '@loopos/db'
import type { OriginType } from '@loopos/db'

/**
 * Add memory edges when a note/card links to a timeline node
 *
 * Creates:
 * - note → node (derived) edge
 * - node → themes (from note content) edges
 *
 * @param workspaceId - Workspace ID
 * @param sourceType - Source type (note, analogue, coach, designer)
 * @param sourceId - Source ID (note_id, card_id, etc.)
 * @param nodeId - Timeline node ID
 * @param noteContent - Note/card content for theme extraction
 */
export async function addLinkingMemoryEdges(
  workspaceId: string,
  sourceType: OriginType,
  sourceId: string,
  nodeId: string,
  noteContent?: string
): Promise<void> {
  try {
    // Create derived edge: source → node
    await memoryDb.edges.create(workspaceId, {
      from_id: sourceId,
      to_id: nodeId,
      relationship: 'derived',
      weight: 0.9,
      context: {
        source_type: sourceType,
        link_type: 'origin',
        created_via: 'add_to_timeline',
      },
    })

    // If we have content, extract themes and link to node
    if (noteContent && noteContent.trim().length > 20) {
      // Simple keyword extraction (could be enhanced with AI later)
      const themes = extractSimpleThemes(noteContent)

      for (const theme of themes) {
        // Create theme node if it doesn't exist
        const themeNode = await memoryDb.nodes.upsert(workspaceId, {
          entity_id: `theme:${theme.toLowerCase()}`,
          entity_type: 'theme',
          content: theme,
          summary: `Theme: ${theme}`,
          embedding: null,
        })

        // Link node → theme
        await memoryDb.edges.create(workspaceId, {
          from_id: nodeId,
          to_id: themeNode.id,
          relationship: 'relates_to',
          weight: 0.7,
          context: {
            extracted_from: sourceType,
            confidence: 0.7,
          },
        })
      }
    }
  } catch (error) {
    console.warn('[Memory Integration] Failed to add linking edges:', error)
    // Don't throw - memory graph is nice-to-have, not critical
  }
}

/**
 * Remove memory edges when a link is deleted
 *
 * @param sourceId - Source ID (note_id, card_id, etc.)
 * @param nodeId - Timeline node ID
 */
export async function removeLinkingMemoryEdges(
  sourceId: string,
  nodeId: string
): Promise<void> {
  try {
    // Remove derived edge: source → node
    await memoryDb.edges.deleteByEntities(sourceId, nodeId)
  } catch (error) {
    console.warn('[Memory Integration] Failed to remove linking edges:', error)
    // Don't throw - best effort cleanup
  }
}

/**
 * Extract simple themes from note content
 * (Could be enhanced with AI/NLP later)
 *
 * @param content - Note content
 * @returns Array of theme keywords
 */
function extractSimpleThemes(content: string): string[] {
  // Convert to lowercase for matching
  const lower = content.toLowerCase()

  // Common music promotion themes
  const themeKeywords: Record<string, string[]> = {
    'Release Planning': ['release', 'launch', 'drop', 'album', 'single', 'ep'],
    'Radio Promotion': ['radio', 'airplay', 'playlist', 'rotation', 'dj'],
    'Social Media': ['social', 'instagram', 'tiktok', 'twitter', 'facebook', 'content'],
    'Press & PR': ['press', 'pr', 'media', 'interview', 'article', 'feature'],
    'Live Shows': ['gig', 'show', 'concert', 'tour', 'performance', 'live'],
    'Marketing': ['marketing', 'promo', 'campaign', 'advertising', 'ads'],
    'Branding': ['brand', 'identity', 'aesthetic', 'visual', 'artwork', 'design'],
    'Fan Engagement': ['fans', 'community', 'audience', 'engagement', 'interaction'],
    'Music Distribution': ['distribution', 'spotify', 'apple music', 'streaming', 'platforms'],
    'Collaboration': ['collab', 'collaboration', 'feature', 'partnership', 'together'],
  }

  const themes: string[] = []

  // Check each theme category
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    // If any keyword matches, add theme
    if (keywords.some((keyword) => lower.includes(keyword))) {
      themes.push(theme)
    }
  }

  // Limit to top 3 themes
  return themes.slice(0, 3)
}

/**
 * Get related nodes from Memory Graph based on note content
 * (For future "Related timeline items" feature)
 *
 * @param workspaceId - Workspace ID
 * @param noteContent - Note content
 * @returns Array of related node IDs
 */
export async function getRelatedNodesFromMemory(
  workspaceId: string,
  noteContent: string
): Promise<string[]> {
  try {
    // Extract themes from note
    const themes = extractSimpleThemes(noteContent)
    if (themes.length === 0) return []

    const relatedNodes: Set<string> = new Set()

    // For each theme, find nodes linked to that theme
    for (const theme of themes) {
      const themeEntityId = `theme:${theme.toLowerCase()}`

      // Get all edges to this theme
      const edges = await memoryDb.edges.findByNode(workspaceId, themeEntityId)

      // Collect node IDs
      for (const edge of edges) {
        if (edge.relationship === 'relates_to' && edge.from_id !== themeEntityId) {
          relatedNodes.add(edge.from_id)
        }
      }
    }

    return Array.from(relatedNodes).slice(0, 5) // Max 5 related nodes
  } catch (error) {
    console.warn('[Memory Integration] Failed to get related nodes:', error)
    return []
  }
}
