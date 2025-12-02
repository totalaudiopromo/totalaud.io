/**
 * SWR Hooks for Intelligence APIs
 */

import useSWR from 'swr'
import { intelligenceAPI } from '@/lib/console/api/intelligence'

// Navigator hook
export function useNavigator() {
  return {
    ask: intelligenceAPI.askNavigator,
  }
}

// Correlations hook
export function useCorrelations(artistSlug: string, windowDays = 90) {
  return useSWR(
    artistSlug ? [`correlations`, artistSlug, windowDays] : null,
    () => intelligenceAPI.getCorrelations(artistSlug, windowDays),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  )
}

// Trajectory hook
export function useTrajectory(artistSlug: string, forecastDays = 90) {
  return useSWR(
    artistSlug ? [`trajectory`, artistSlug, forecastDays] : null,
    () => intelligenceAPI.getTrajectory(artistSlug, forecastDays),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )
}

// Identity hook
export function useIdentity(artistSlug: string) {
  return useSWR(
    artistSlug ? [`identity`, artistSlug] : null,
    () => intelligenceAPI.getIdentity(artistSlug),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  )
}

// Coverage Fusion hook
export function useCoverageFusion(artistSlug: string, startDate?: string, endDate?: string) {
  return useSWR(
    artistSlug ? [`coverage-fusion`, artistSlug, startDate, endDate] : null,
    () => intelligenceAPI.getCoverageFusion(artistSlug, startDate, endDate),
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000, // 2 minutes
    }
  )
}

// Benchmarks hook
export function useBenchmarks(workspaceId: string) {
  return useSWR(
    workspaceId ? [`benchmarks`, workspaceId] : null,
    () => intelligenceAPI.getBenchmarks(workspaceId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 180000, // 3 minutes
    }
  )
}

// Signal Thread hook
export function useSignalThread(artistSlug: string, threadType = 'narrative') {
  return useSWR(
    artistSlug ? [`signal-thread`, artistSlug, threadType] : null,
    () => intelligenceAPI.getSignalThread(artistSlug, threadType),
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000,
    }
  )
}

// Mode Recommendation hook
export function useModeRecommendation(mode?: string) {
  return useSWR([`mode-recommendation`, mode], () => intelligenceAPI.getModeRecommendation(mode), {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
  })
}

// Automations hook (mutation only, no caching)
export function useAutomations() {
  return {
    run: intelligenceAPI.runAutomation,
  }
}
