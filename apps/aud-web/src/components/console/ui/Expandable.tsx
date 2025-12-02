'use client'

import { ReactNode, useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

interface ExpandableProps {
  title: string
  children: ReactNode
  defaultExpanded?: boolean
}

export function Expandable({ title, children, defaultExpanded = false }: ExpandableProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="border border-tap-panel/50 rounded-tap overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-tap-panel hover:bg-tap-panel/70 transition-colors duration-180"
      >
        <span className="text-sm font-medium text-tap-white lowercase">{title}</span>
        <ChevronDownIcon
          className={clsx('w-4 h-4 text-tap-grey transition-transform duration-180', {
            'rotate-180': isExpanded,
          })}
        />
      </button>
      {isExpanded && (
        <div className="p-4 bg-tap-black/30 border-t border-tap-panel/50">{children}</div>
      )}
    </div>
  )
}
