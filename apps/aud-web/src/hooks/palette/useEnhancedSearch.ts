/**
 * Phase 34: Global Search Engine - Enhanced Palette Search Hook
 *
 * Combines local command filtering with global search API.
 * Powers ⌘K palette with unified cross-surface search.
 */

import { useState, useEffect, useMemo } from 'react'
import { filterCommands } from '@/lib/palette/search'
import type { SearchResult, CommandDefinition } from '@/lib/palette/types'
import type { SearchResponse } from '@/lib/search'
import { logger } from '@/lib/logger'

const log = logger.scope('EnhancedSearch')

interface UseEnhancedSearchOptions {
  query: string
  commands: CommandDefinition[]
  workspaceId: string
  debounceMs?: number
}

interface EnhancedSearchResults {
  groups: Array<{
    label: string
    results: SearchResult[]
  }>
  isLoading: boolean
  error: string | null
}

/**
 * Hook that combines local command search with global content search
 *
 * @param options - Search configuration
 * @returns Grouped results combining commands and content
 */
export function useEnhancedSearch({
  query,
  commands,
  workspaceId,
  debounceMs = 300,
}: UseEnhancedSearchOptions): EnhancedSearchResults {
  const [contentResults, setContentResults] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Local command filtering (instant, no API call)
  const commandResults = useMemo(
    () => filterCommands(commands, query),
    [commands, query]
  )

  // Debounced API search for content
  useEffect(() => {
    if (!query.trim()) {
      setContentResults(null)
      setIsLoading(false)
      setError(null)
      return
    }

    // Debounce: wait for user to stop typing
    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      setError(null)

      try {
        log.debug('Fetching content results', { query, workspaceId })

        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            workspaceId,
            maxPerGroup: 5,
            includeActions: false,
            includeTAP: false,
          }),
        })

        if (!response.ok) {
          throw new Error(`Search API failed: ${response.statusText}`)
        }

        const data: SearchResponse = await response.json()
        setContentResults(data)
        log.debug('Content results fetched', { totalResults: data.totalResults })
      } catch (err) {
        log.error('Content search failed', err)
        setError(err instanceof Error ? err.message : 'Search failed')
        setContentResults(null)
      } finally {
        setIsLoading(false)
      }
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [query, workspaceId, debounceMs])

  // Combine command results with content results
  const combinedGroups = useMemo(() => {
    const groups: Array<{ label: string; results: SearchResult[] }> = []

    // Add commands first (if any match)
    if (commandResults.length > 0) {
      const commandGroups: Record<string, SearchResult[]> = {}

      commandResults.forEach((result) => {
        const groupKey = result.group
        if (!commandGroups[groupKey]) {
          commandGroups[groupKey] = []
        }
        commandGroups[groupKey].push(result)
      })

      // Convert to array with proper labels
      Object.entries(commandGroups).forEach(([group, results]) => {
        const label = group === 'navigation' ? 'Actions' :
                     group === 'creation' ? 'Quick Actions' :
                     group === 'linking' ? 'Linking' :
                     group === 'memory' ? 'Memory' :
                     group === 'ai' ? 'AI' :
                     group.charAt(0).toUpperCase() + group.slice(1)

        groups.push({ label, results })
      })
    }

    // Add content results (if any)
    if (contentResults) {
      const { groups: contentGroups } = contentResults

      // Map content groups to display format
      const groupMappings: Array<{ key: keyof typeof contentGroups; label: string }> = [
        { key: 'notes', label: 'Notes' },
        { key: 'cards', label: 'Cards' },
        { key: 'timeline', label: 'Timeline' },
        { key: 'journal', label: 'Journal' },
        { key: 'coach', label: 'Coach' },
        { key: 'scenes', label: 'Scenes' },
        { key: 'themes', label: 'Themes' },
        { key: 'rhythm', label: 'Rhythm' },
        { key: 'workspaces', label: 'Workspaces' },
        { key: 'tap', label: 'TAP' },
      ]

      groupMappings.forEach(({ key, label }) => {
        const results = contentGroups[key]
        if (results && results.length > 0) {
          // Convert SearchResult from engine to SearchResult for palette
          const paletteResults: SearchResult[] = results.map((r) => ({
            id: r.id,
            type: r.type as any,
            title: r.title,
            subtitle: r.subtitle,
            group: label.toLowerCase(),
            score: r.score,
            action: () => {
              // Navigation action based on type
              log.info('Navigating to result', { id: r.id, type: r.type })
              // TODO: Implement navigation based on result type
              window.location.href = getNavigationUrl(r.type, r.id)
            },
          }))

          groups.push({ label, results: paletteResults })
        }
      })
    }

    return groups
  }, [commandResults, contentResults])

  return {
    groups: combinedGroups,
    isLoading,
    error,
  }
}

/**
 * Get navigation URL for a search result
 */
function getNavigationUrl(type: string, id: string): string {
  const urlMap: Record<string, string> = {
    note: `/workspace/notebook?note=${id}`,
    card: `/workspace/notebook?card=${id}`,
    node: `/workspace/timeline?node=${id}`,
    journal: `/workspace/journal?entry=${id}`,
    coach: `/workspace/coach`,
    scene: `/workspace/designer?scene=${id}`,
    theme: `/workspace/memory?theme=${id}`,
    rhythm: `/workspace/rhythm`,
    workspace: `/workspace?id=${id}`,
    tap: `/workspace/tap?preview=${id}`,
  }

  return urlMap[type] || '/workspace'
}
