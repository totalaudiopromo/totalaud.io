'use client'

import Image from 'next/image'
import Link from 'next/link'

export function SettingsHeader() {
  return (
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
        <span style={{ fontSize: 16 }}>&larr;</span>
        Back to workspace
      </Link>
      <Link href="/">
        <Image
          src="/brand/svg/ta-logo-cyan.svg"
          alt="totalaud.io"
          width={32}
          height={32}
          style={{ opacity: 0.9 }}
        />
      </Link>
    </header>
  )
}
