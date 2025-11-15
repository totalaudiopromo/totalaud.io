'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Calendar,
  BookOpen,
  Target,
  Palette,
  Package,
  FileText,
  BarChart3,
  Bot,
  Download,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/timeline', label: 'Timeline', icon: Calendar },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/coach', label: 'Coach', icon: Target },
  { href: '/moodboard', label: 'Moodboard', icon: Palette },
  { href: '/packs', label: 'Packs', icon: Package },
  { href: '/playbook', label: 'Playbook', icon: FileText },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/export', label: 'Export', icon: Download },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:block w-64 bg-gray-900/50 border-r border-gray-800 min-h-screen">
      <div className="sticky top-0 p-6">
        {/* Logo */}
        <Link href="/" className="block mb-8">
          <h1 className="text-2xl font-bold text-slate-cyan glow-slate-cyan">
            LoopOS
          </h1>
          <p className="text-xs text-gray-500 mt-1">Campaign Engine</p>
        </Link>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-cyan/10 text-slate-cyan border-l-2 border-slate-cyan'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-600">
            LoopOS v1.0
            <br />
            Phase 6 Implementation
          </p>
        </div>
      </div>
    </aside>
  )
}
