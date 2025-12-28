'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

/**
 * React Query Provider
 *
 * Provides request deduplication, caching, and automatic refetching.
 * Configured with sensible defaults for the totalaud.io application.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: data considered fresh for 60 seconds
            staleTime: 60 * 1000,

            // Cache time: keep unused data in cache for 5 minutes
            gcTime: 5 * 60 * 1000,

            // Retry configuration
            retry: 1,
            retryDelay: 1000,

            // Refetch configuration
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
