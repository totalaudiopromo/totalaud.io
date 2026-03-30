/**
 * 404 Not Found Page
 * Brand-styled with totalaud.io visual identity
 */

import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0F1113',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '32px 24px',
        textAlign: 'center',
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: 'rgba(58, 169, 190, 0.1)',
          border: '1px solid rgba(58, 169, 190, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#3AA9BE" strokeWidth="1.5" opacity="0.6" />
          <circle cx="12" cy="12" r="4" fill="#3AA9BE" opacity="0.8" />
        </svg>
      </div>

      {/* 404 */}
      <h1
        style={{
          fontSize: 64,
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.08)',
          margin: '0 0 8px',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        404
      </h1>

      <p
        style={{
          fontSize: 16,
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.7)',
          margin: '0 0 8px',
        }}
      >
        This page doesn&apos;t exist yet
      </p>

      <p
        style={{
          fontSize: 13,
          color: 'rgba(255, 255, 255, 0.4)',
          margin: '0 0 32px',
          maxWidth: 320,
          lineHeight: 1.5,
        }}
      >
        But your music does. Head back to your workspace and keep building.
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/workspace"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            backgroundColor: '#3AA9BE',
            color: '#0F1113',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'opacity 0.15s ease',
          }}
        >
          Open Workspace
        </Link>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            color: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'border-color 0.15s ease',
          }}
        >
          Home
        </Link>
      </div>
    </div>
  )
}
