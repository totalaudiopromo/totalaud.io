'use client'

import Link from 'next/link'

interface GenreCardProps {
  slug: string
  name: string
  description: string
}

export function GenreCard({ slug, name, description }: GenreCardProps) {
  return (
    <Link
      href={`/genre/${slug}`}
      style={{
        display: 'block',
        padding: '28px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        textDecoration: 'none',
        transition: 'border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.3)'
        e.currentTarget.style.background = 'rgba(58, 169, 190, 0.05)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
      }}
    >
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#F7F8F9',
          marginBottom: '8px',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        {name}
      </h2>
      <p
        style={{
          fontSize: '14px',
          lineHeight: 1.5,
          color: 'rgba(255, 255, 255, 0.5)',
          margin: 0,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        {description.slice(0, 100)}...
      </p>
      <span
        style={{
          display: 'inline-block',
          marginTop: '16px',
          fontSize: '13px',
          color: '#3AA9BE',
          fontWeight: 500,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        View guide →
      </span>
    </Link>
  )
}
