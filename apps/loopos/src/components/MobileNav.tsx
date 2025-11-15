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
  { href: '/moodboard', label: 'Board', icon: Palette },
  { href: '/packs', label: 'Packs', icon: Package },
  { href: '/playbook', label: 'Playbook', icon: FileText },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/export', label: 'Export', icon: Download },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-matte-black border-t border-gray-800 z-50">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colours ${
                  isActive
                    ? 'bg-slate-cyan/10 text-slate-cyan'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer for mobile nav */}
      <div className="lg:hidden h-16" aria-hidden="true" />
    </>
  )
}
