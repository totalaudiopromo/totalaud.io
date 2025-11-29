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
  const { user, isAuthenticated, isGuest, loading, displayName, signOut } = useAuth()
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
    return (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
    )
  }

  // Guest: Show sign up CTA
  if (isGuest) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link
          href="/login"
          style={{
            padding: '6px 12px',
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.6)',
            textDecoration: 'none',
            transition: 'color 0.12s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
          }}
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          style={{
            padding: '6px 14px',
            fontSize: 13,
            fontWeight: 600,
            color: '#0F1113',
            backgroundColor: '#3AA9BE',
            borderRadius: 6,
            textDecoration: 'none',
            transition: 'opacity 0.12s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
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
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Avatar button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: '#3AA9BE',
          border: 'none',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 600,
          color: '#0F1113',
          transition: 'transform 0.12s ease, box-shadow 0.12s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.boxShadow = '0 0 0 2px rgba(58, 169, 190, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = 'none'
        }}
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
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              minWidth: 200,
              backgroundColor: '#1A1D21',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              overflow: 'hidden',
              zIndex: 1000,
            }}
          >
            {/* User info */}
            <div
              style={{
                padding: '12px 14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#F7F8F9',
                  marginBottom: 2,
                }}
              >
                {displayName || 'Artist'}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                {user?.email}
              </div>
            </div>

            {/* Menu items */}
            <div style={{ padding: '6px 0' }}>
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
      style={{
        display: 'block',
        padding: '8px 14px',
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        textDecoration: 'none',
        transition: 'background-color 0.12s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      {children}
    </Link>
  )
}

function MenuButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        padding: '8px 14px',
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        backgroundColor: 'transparent',
        border: 'none',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'background-color 0.12s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      {children}
    </button>
  )
}
