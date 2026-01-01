/**
 * Scout Mode Pre-fetch Hook
 *
 * Phase 2: DESSA Speed Improvement - Pre-fetch on Mode Switch
 *
 * Automatically pre-fetches Scout opportunities when user enters workspace,
 * so data is ready before they click the Scout tab.
 *
 * Performance benefits:
 * - Eliminates loading spinner on first Scout visit
 * - Opportunities appear instantly when switching to Scout
 * - Respects hasFetched flag to prevent duplicate requests
 */

import { useEffect } from 'react'
import { useScoutStore } from '@/stores/useScoutStore'

/**
 * Pre-fetch Scout opportunities when component mounts
 *
 * Only fetches if:
 * - Data hasn't been fetched yet (hasFetched = false)
 * - Not currently loading (prevents duplicate requests)
 *
 * Usage:
 * ```tsx
 * // In workspace layout or parent component
 * usePrefetchScout()
 * ```
 */
export function usePrefetchScout() {
  const hasFetched = useScoutStore((s) => s.hasFetched)
  const loading = useScoutStore((s) => s.loading)
  const fetchOpportunities = useScoutStore((s) => s.fetchOpportunities)

  useEffect(() => {
    // Pre-fetch if not already fetched and not currently loading
    if (!hasFetched && !loading) {
      fetchOpportunities()
    }
  }, [hasFetched, loading, fetchOpportunities])
}
