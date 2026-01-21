'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import {
  HomeIcon,
  LightBulbIcon,
  UserCircleIcon,
  ClockIcon,
  BoltIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  /** Mark item as "Coming Soon" - disabled with badge */
  comingSoon?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navigation: NavSection[] = [
  {
    title: 'overview',
    items: [
      { name: 'dashboard', href: '/console', icon: HomeIcon },
      { name: 'insights', href: '/console/insights', icon: SparklesIcon },
    ],
  },
  {
    title: 'workspace',
    items: [
      { name: 'ideas', href: '/workspace?mode=ideas', icon: LightBulbIcon },
      { name: 'scout', href: '/workspace?mode=scout', icon: MagnifyingGlassIcon },
      { name: 'timeline', href: '/workspace?mode=timeline', icon: CalendarIcon },
      { name: 'pitch', href: '/workspace?mode=pitch', icon: DocumentTextIcon },
    ],
  },
  {
    title: 'profile',
    items: [
      { name: 'identity', href: '/console/identity', icon: UserCircleIcon },
      { name: 'threads', href: '/console/threads', icon: ClockIcon, comingSoon: true },
      { name: 'automations', href: '/console/automations', icon: BoltIcon, comingSoon: true },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    // Exact match for console routes
    if (href.startsWith('/console')) {
      return pathname === href
    }
    // For workspace routes, check if current path includes the mode
    if (href.includes('?mode=')) {
      const mode = href.split('mode=')[1]
      return (
        pathname === '/workspace' &&
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('mode') === mode
      )
    }
    return pathname === href
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-ta-panel border-r border-ta-panel/50 flex flex-col max-md:hidden">
      {/* Logo */}
      <div className="p-6 border-b border-ta-panel/50">
        <Link href="/console">
          <Image
            src="/brand/svg/lockup-horizontal-cyan.svg"
            alt="totalaud.io"
            width={180}
            height={48}
            className="h-12 w-auto"
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {navigation.map((section, sectionIdx) => (
          <div key={section.title} className={clsx(sectionIdx > 0 && 'mt-6')}>
            <p className="px-4 mb-2 text-xs text-ta-grey uppercase tracking-wider">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href)

                // Handle "coming soon" items
                if (item.comingSoon) {
                  return (
                    <div
                      key={item.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium lowercase text-ta-grey/50 cursor-not-allowed"
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                      <span className="ml-auto text-[10px] uppercase tracking-wider text-ta-grey/40 bg-ta-grey/10 px-2 py-0.5 rounded">
                        Soon
                      </span>
                    </div>
                  )
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium lowercase transition-all duration-180',
                      {
                        'bg-ta-cyan text-ta-black': active,
                        'text-ta-grey hover:text-ta-white hover:bg-ta-black/50': !active,
                      }
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-ta-panel/50">
        <p className="text-xs text-ta-grey lowercase">© 2025 totalaud.io</p>
      </div>
    </aside>
  )
}
