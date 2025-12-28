'use client'

import { ReactNode, useState } from 'react'
import clsx from 'clsx'

export interface Tab {
  id: string
  label: string
  content: ReactNode
}

interface TabbedProps {
  tabs: Tab[]
  defaultTab?: string
}

export function Tabbed({ tabs, defaultTab }: TabbedProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-ta-panel pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-2 text-sm font-medium lowercase transition-colors duration-180',
              {
                'text-ta-cyan border-b-2 border-ta-cyan': activeTab === tab.id,
                'text-ta-grey hover:text-ta-white': activeTab !== tab.id,
              }
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{activeContent}</div>
    </div>
  )
}
