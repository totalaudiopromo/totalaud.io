/**
 * Settings Page
 * Phase 9: MVP Polish
 *
 * User settings and preferences for totalaud.io
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'

export default function SettingsPage() {
  const { user, isAuthenticated, isGuest, displayName, signOut } = useAuth()
  const [saving, setSaving] = useState(false)

  // Redirect hint for guests
  if (isGuest) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0F1113',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: '#F7F8F9',
              marginBottom: 12,
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Sign in to access settings
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: 24,
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              lineHeight: 1.6,
            }}
          >
            Create an account or sign in to manage your preferences and account settings.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link
              href="/login"
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.8)',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 8,
                textDecoration: 'none',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                color: '#0F1113',
                backgroundColor: '#3AA9BE',
                border: 'none',
                borderRadius: 8,
                textDecoration: 'none',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Sign up free
            </Link>
          </div>
          <Link
            href="/workspace"
            style={{
              display: 'inline-block',
              marginTop: 24,
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.4)',
              textDecoration: 'none',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            ← Back to workspace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0F1113',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: 56,
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: 'rgba(15, 17, 19, 0.95)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Link
          href="/workspace"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.6)',
            textDecoration: 'none',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          <span style={{ fontSize: 16 }}>←</span>
          Back to workspace
        </Link>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#3AA9BE',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          totalaud.io
        </span>
      </header>

      {/* Main content */}
      <main
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: '48px 24px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: '#F7F8F9',
              marginBottom: 8,
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Settings
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: 40,
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Manage your account and preferences
          </p>

          {/* Account Section */}
          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#F7F8F9',
                marginBottom: 16,
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Account
            </h2>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginBottom: 4,
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  Email
                </label>
                <div
                  style={{
                    fontSize: 14,
                    color: '#F7F8F9',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {user?.email || 'Not available'}
                </div>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginBottom: 4,
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  Display Name
                </label>
                <div
                  style={{
                    fontSize: 14,
                    color: '#F7F8F9',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {displayName || 'Not set'}
                </div>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#F7F8F9',
                marginBottom: 16,
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Preferences
            </h2>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 12,
                padding: '20px',
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  textAlign: 'center',
                  padding: '20px 0',
                }}
              >
                More preferences coming soon...
              </p>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#F7F8F9',
                marginBottom: 16,
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Session
            </h2>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 12,
                padding: '20px',
              }}
            >
              <button
                onClick={async () => {
                  await signOut()
                  window.location.href = '/'
                }}
                style={{
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'
                }}
              >
                Sign out
              </button>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  )
}
