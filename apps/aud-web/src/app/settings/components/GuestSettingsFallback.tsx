'use client'

import Link from 'next/link'

export function GuestSettingsFallback() {
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
          &larr; Back to workspace
        </Link>
      </div>
    </div>
  )
}
