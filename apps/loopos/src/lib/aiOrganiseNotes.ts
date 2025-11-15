/**
 * AI Note Organisation
 * Uses Anthropic Claude to summarise and cluster notes
 */

import Anthropic from '@anthropic-ai/sdk'
import type { LoopOSNote } from '@total-audio/loopos-db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface NoteSummary {
  note_id: string
  summary: string
  themes: string[]
}

export interface NoteCluster {
  cluster_name: string
  theme: string
  note_ids: string[]
}

/**
 * Summarise a single note using AI
 */
export async function summariseNote(note: LoopOSNote): Promise<NoteSummary> {
  const prompt = `Summarise the following note in 1-2 concise sentences and extract 2-4 key themes.

Title: ${note.title}

Content:
${note.content}

Respond in JSON format:
{
  "summary": "...",
  "themes": ["theme1", "theme2", ...]
}`

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  // Extract JSON from response (handle code blocks)
  let jsonText = content.text.trim()
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
  }

  const parsed = JSON.parse(jsonText)

  return {
    note_id: note.id,
    summary: parsed.summary,
    themes: parsed.themes,
  }
}

/**
 * Cluster multiple notes by theme using AI
 */
export async function clusterNotesByTheme(notes: LoopOSNote[]): Promise<NoteCluster[]> {
  if (notes.length === 0) return []

  const noteSummaries = notes
    .map((note, i) => `${i + 1}. ${note.title}: ${note.content.slice(0, 200)}...`)
    .join('\n\n')

  const prompt = `Analyse these ${notes.length} notes and organise them into 3-5 thematic clusters.

Notes:
${noteSummaries}

Respond in JSON format:
{
  "clusters": [
    {
      "cluster_name": "...",
      "theme": "...",
      "note_indices": [1, 3, 5]
    }
  ]
}`

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  let jsonText = content.text.trim()
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
  }

  const parsed = JSON.parse(jsonText)

  // Convert note indices to note IDs
  const clusters: NoteCluster[] = parsed.clusters.map((cluster: any) => ({
    cluster_name: cluster.cluster_name,
    theme: cluster.theme,
    note_ids: cluster.note_indices.map((i: number) => notes[i - 1]?.id).filter(Boolean),
  }))

  return clusters
}

/**
 * Generate auto-complete suggestions for note linking
 */
export function generateNoteLinkSuggestions(
  currentInput: string,
  allNotes: LoopOSNote[]
): LoopOSNote[] {
  if (currentInput.length < 2) return []

  const query = currentInput.toLowerCase()

  return allNotes
    .filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(query)
      const tagMatch = note.tags.some((tag) => tag.toLowerCase().includes(query))
      return titleMatch || tagMatch
    })
    .slice(0, 5) // Limit to 5 suggestions
}

/**
 * Extract tags from note content (hashtag style)
 */
export function extractHashtags(content: string): string[] {
  const hashtagPattern = /#([A-Za-z0-9_]+)/g
  const matches = [...content.matchAll(hashtagPattern)]

  return Array.from(new Set(matches.map((m) => m[1].toLowerCase())))
}
