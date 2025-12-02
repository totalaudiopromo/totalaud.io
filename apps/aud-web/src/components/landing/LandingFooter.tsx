/**
 * LandingFooter Component
 * 2025 Brand Pivot - Minimal footer
 */

'use client'

import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer
      style={{
        padding: '32px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Brand */}
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          © {new Date().getFullYear()} totalaud.io
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link
            href="/workspace"
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.5)',
              textDecoration: 'none',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#3AA9BE'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'
            }}
          >
            Workspace
          </Link>
          <a
            href="https://totalaudiopromo.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.5)',
              textDecoration: 'none',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#3AA9BE'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'
            }}
          >
            Total Audio Promo
          </a>
        </div>
      </div>
    </footer>
  )
}
