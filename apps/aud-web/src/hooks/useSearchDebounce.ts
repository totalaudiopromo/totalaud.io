/**
 * useSearchDebounce Hook
 *
 * A reusable hook for debouncing search input changes.
 * Manages local state and triggers a callback after the specified delay.
 *
 * @param callback - Function to call with the debounced value
 * @param initialValue - Initial value for the search input
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @returns [value, setValue] - Tuple of current value and setter function
 *
 * @example
 * const [searchQuery, setSearchQuery] = useSearchDebounce(
 *   (value) => updateFilter('search', value),
 *   '',
 *   150
 * )
 */

import { useState, useEffect, useRef } from 'react'

export function useSearchDebounce(
  callback: (value: string) => void,
  initialValue = '',
  delay = 300
): readonly [string, (value: string) => void] {
  const [value, setValue] = useState(initialValue)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Clear any existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Set new timeout to call callback after delay
    debounceRef.current = setTimeout(() => {
      callback(value)
    }, delay)

    // Cleanup function to clear timeout on unmount or value change
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [value, callback, delay])

  return [value, setValue] as const
}
