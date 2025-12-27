'use client'

import { useState } from 'react'
import { SearchInput } from '../ui/SearchInput'
import { UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [artistSlug, setArtistSlug] = useState('current-artist')
  const [workspaceId, setWorkspaceId] = useState('workspace-1')

  return (
    <header className="sticky top-0 z-40 bg-ta-black/95 backdrop-blur border-b border-ta-panel/50">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Artist/Workspace Selector */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 bg-ta-panel rounded-lg text-sm font-medium text-ta-white lowercase hover:bg-ta-panel/70 transition-colors duration-180">
              <UserCircleIcon className="w-5 h-5 text-ta-cyan" />
              <span>{artistSlug}</span>
              <ChevronDownIcon className="w-4 h-4 text-ta-grey" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="search dashboard..."
          />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-ta-cyan text-ta-black rounded-lg text-sm font-medium lowercase hover:bg-ta-cyan/90 transition-colors duration-180">
            quick action
          </button>
          <button className="w-10 h-10 rounded-full bg-ta-panel flex items-center justify-center hover:bg-ta-panel/70 transition-colors duration-180">
            <UserCircleIcon className="w-6 h-6 text-ta-white" />
          </button>
        </div>
      </div>
    </header>
  )
}
