'use client'

import Link from 'next/link'
import { UserCircleIcon } from '@heroicons/react/24/outline'

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 bg-ta-black/95 backdrop-blur border-b border-ta-panel/50">
      <div className="flex items-center justify-between px-8 py-4">
        <span className="text-sm text-ta-grey lowercase">console</span>
        <Link
          href="/settings"
          className="w-10 h-10 rounded-full bg-ta-panel flex items-center justify-center hover:bg-ta-panel/70 transition-colors duration-180"
        >
          <UserCircleIcon className="w-6 h-6 text-ta-white" />
        </Link>
      </div>
    </header>
  )
}
