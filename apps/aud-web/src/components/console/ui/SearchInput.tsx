'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = 'search...' }: SearchInputProps) {
  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ta-grey" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-ta-panel border border-ta-panel/50 rounded-lg pl-10 pr-4 py-2 text-sm text-ta-white placeholder:text-ta-grey lowercase focus:outline-none focus:ring-2 focus:ring-ta-cyan/50 transition-all duration-180"
      />
    </div>
  )
}
