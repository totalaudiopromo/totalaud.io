'use client'

import Link from 'next/link'

interface LocationCardProps {
  slug: string
  name: string
  radioCount: number
  venueCount: number
}

export function LocationCard({ slug, name, radioCount, venueCount }: LocationCardProps) {
  return (
    <Link
      href={`/location/${slug}`}
      style={{
        display: 'block',
        padding: '24px',
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
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#F7F8F9',
          marginBottom: '6px',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        {name}
      </h3>
      <p
        style={{
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.5)',
          margin: 0,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        {radioCount} radio stations • {venueCount} venues
      </p>
    </Link>
  )
}
