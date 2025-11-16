'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspace } from '@/hooks/useWorkspace'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'
import { PresenceBar } from './presence/PresenceBar'
import { CursorLayer } from './presence/CursorLayer'
import { WorkspaceParticipants } from './presence/WorkspaceParticipants'
import {
  LayoutDashboard,
  Package,
  BookOpen,
  MessageSquare,
  BookMarked,
  Download,
  Sparkles,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

interface AppShellProps {
  children: ReactNode
}

const navigation = [
  { name: 'Timeline', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Packs', href: '/packs', icon: Package },
  { name: 'Playbook', href: '/playbook', icon: BookOpen },
  { name: 'Coach', href: '/coach', icon: MessageSquare },
  { name: 'Journal', href: '/journal', icon: BookMarked },
  { name: 'Export', href: '/export', icon: Download },
  { name: 'Designer', href: '/designer', icon: Sparkles },
]

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { currentWorkspace } = useWorkspace()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cursor Layer (Global) */}
      {currentWorkspace && user && (
        <CursorLayer workspaceId={currentWorkspace.id} userId={user.id} />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col h-full border-r border-border bg-background">
          {/* Logo + Presence */}
          <div className="flex h-16 shrink-0 items-centre justify-between px-6 border-b border-border">
            <h1 className="text-2xl font-bold text-glow">LoopOS</h1>
            {currentWorkspace && user && (
              <WorkspaceParticipants
                workspaceId={currentWorkspace.id}
                userId={user.id}
              />
            )}
          </div>

          {/* Workspace Switcher */}
          <div className="px-4 py-4 border-b border-border">
            <WorkspaceSwitcher />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-centre gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colours
                    ${
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-foreground/60 hover:text-foreground hover:bg-accent/5'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="px-4 py-4 border-t border-border">
            <div className="flex items-centre justify-between mb-3">
              <div className="flex items-centre gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-centre justify-centre">
                  <span className="text-sm font-medium text-accent">
                    {user?.email?.[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-centre gap-2 px-3 py-2 text-sm text-foreground/60 hover:text-foreground hover:bg-accent/5 rounded-lg transition-colours"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 flex h-16 shrink-0 items-centre gap-x-4 border-b border-border bg-background px-4">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-foreground/60 lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 text-sm font-semibold">LoopOS</div>
        {currentWorkspace && user && (
          <WorkspaceParticipants
            workspaceId={currentWorkspace.id}
            userId={user.id}
          />
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-background border-r border-border">
            <div className="flex h-16 items-centre justify-between px-6 border-b border-border">
              <h1 className="text-2xl font-bold text-glow">LoopOS</h1>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground/60 hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-4 py-4 border-b border-border">
              <WorkspaceSwitcher />
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-centre gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colours
                      ${
                        isActive
                          ? 'bg-accent/10 text-accent'
                          : 'text-foreground/60 hover:text-foreground hover:bg-accent/5'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-border">
              <button
                onClick={handleLogout}
                className="w-full flex items-centre gap-2 px-3 py-2 text-sm text-foreground/60 hover:text-foreground hover:bg-accent/5 rounded-lg transition-colours"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}
