import { useState, useCallback } from 'react'

interface SearchResult {
  type: 'node' | 'journal' | 'pack' | 'moodboard' | 'playbook'
  id: string
  title: string
  description?: string
  url?: string
}

export function useGlobalSearch(userId: string) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) {
        setResults([])
        return
      }

      try {
        setLoading(true)

        // In production, this would call a search API
        // For now, simulate fuzzy search across all entities
        const mockResults: SearchResult[] = []

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Mock results based on query
        if (query.toLowerCase().includes('release')) {
          mockResults.push({
            type: 'pack',
            id: '1',
            title: 'Release Pack',
            description: 'Complete workflow for releasing a new single or EP',
            url: '/packs/1',
          })
        }

        if (query.toLowerCase().includes('journal')) {
          mockResults.push({
            type: 'journal',
            id: '1',
            title: 'Journal Entry - ' + new Date().toLocaleDateString(),
            description: 'Daily creative journal',
            url: '/journal',
          })
        }

        if (query.toLowerCase().includes('strategy')) {
          mockResults.push({
            type: 'playbook',
            id: '1',
            title: 'Spotify Playlist Strategy',
            description: 'How to pitch to editorial playlists',
            url: '/playbook',
          })
        }

        setResults(mockResults)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [userId]
  )

  return {
    results,
    search,
    loading,
  }
}
