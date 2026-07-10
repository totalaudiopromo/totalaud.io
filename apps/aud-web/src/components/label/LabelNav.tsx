'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDaysIcon,
  HomeIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { LabelSwitcher } from './LabelSwitcher'

const SECTIONS: {
  heading: string
  items: { href: string; label: string; icon: typeof HomeIcon }[]
}[] = [
  {
    heading: 'Overview',
    items: [{ href: '/label', label: 'Dashboard', icon: HomeIcon }],
  },
  {
    heading: 'Label',
    items: [
      { href: '/label/roster', label: 'Roster', icon: UsersIcon },
      { href: '/label/releases', label: 'Releases', icon: MusicalNoteIcon },
      { href: '/label/calendar', label: 'Calendar', icon: CalendarDaysIcon },
    ],
  },
  {
    heading: 'Operations',
    items: [{ href: '/label/contacts', label: 'Contacts', icon: UserGroupIcon }],
  },
]

export function LabelNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 hidden md:flex flex-col border-r border-ta-border bg-ta-panel z-20">
      <div className="px-4 pt-5 pb-3">
        <p className="text-xs uppercase tracking-[0.2em] text-ta-muted mb-3">totalaud.io</p>
        <LabelSwitcher />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {SECTIONS.map((section) => (
          <div key={section.heading} className="mt-4">
            <p className="px-3 mb-1 text-[11px] uppercase tracking-wider text-ta-muted">
              {section.heading}
            </p>
            {section.items.map((item) => {
              const active =
                item.href === '/label' ? pathname === '/label' : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-ta-sm text-sm transition-colors duration-120 ${
                    active
                      ? 'bg-ta-cyan/10 text-ta-cyan'
                      : 'text-ta-grey hover:text-ta-white hover:bg-white/[0.04]'
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-ta-border">
        <p className="text-[11px] text-ta-muted">Label OS — private preview</p>
      </div>
    </nav>
  )
}
