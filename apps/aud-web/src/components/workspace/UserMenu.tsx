/**
 * User Menu Component
 * Phase 6: Auth + Landing Page
 *
 * Shows either:
 * - Sign up CTA for guests
 * - User avatar + dropdown menu for authenticated users
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'

export function UserMenu() {
  const { user, isGuest, loading, displayName, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle sign out
  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
    router.push('/')
  }

  // Loading state
  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-tap-white/10 animate-pulse" />
  }

  // Guest: Show sign up CTA
  if (isGuest) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="px-3 py-1.5 text-[13px] font-medium text-tap-white/60 hover:text-tap-white/90 transition-colors duration-180"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="px-3.5 py-1.5 text-[13px] font-semibold text-tap-black bg-tap-cyan rounded-md hover:opacity-90 transition-opacity duration-180"
        >
          Sign up free
        </Link>
      </div>
    )
  }

  // Authenticated: Show user avatar + dropdown
  const initials = displayName
    ? displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0].toUpperCase() || '?'

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-tap-cyan text-tap-black text-xs font-semibold border-none cursor-pointer hover:scale-105 hover:ring-2 hover:ring-tap-cyan/30 transition-all duration-180"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {initials}
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute top-[calc(100%+8px)] right-0 min-w-[200px] bg-tap-panel border border-tap-white/10 rounded-lg shadow-tap overflow-hidden z-[1000]"
          >
            {/* User info */}
            <div className="px-3.5 py-3 border-b border-tap-white/[0.06]">
              <div className="text-sm font-medium text-tap-white mb-0.5">
                {displayName || 'Artist'}
              </div>
              <div className="text-xs text-tap-white/50">{user?.email}</div>
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              <MenuLink href="/settings" onClick={() => setIsOpen(false)}>
                Settings
              </MenuLink>
              <MenuButton onClick={handleSignOut}>Sign out</MenuButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper components
function MenuLink({
  href,
  onClick,
  children,
}: {
  href: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3.5 py-2 text-[13px] text-tap-white/80 hover:bg-tap-white/5 transition-colors duration-180"
    >
      {children}
    </Link>
  )
}

function MenuButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="block w-full px-3.5 py-2 text-[13px] text-tap-white/80 text-left bg-transparent border-none cursor-pointer hover:bg-tap-white/5 transition-colors duration-180"
    >
      {children}
    </button>
  )
}
