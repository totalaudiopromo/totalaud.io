/**
 * Auth Layout
 * 2025 Brand Pivot - Cinematic Editorial
 * Shared layout for login/signup pages
 */

import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0F1113',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Minimal header */}
      <header
        style={{
          padding: '24px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#F7F8F9',
            textDecoration: 'none',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          totalaud.io
        </Link>
      </header>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}
      >
        {children}
      </main>

      {/* Minimal footer */}
      <footer
        style={{
          padding: '24px 32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          © {new Date().getFullYear()} totalaud.io
        </span>
      </footer>
    </div>
  )
}
