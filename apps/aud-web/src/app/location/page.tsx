import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ukLocations,
  usLocations,
  generateWebPageSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo'
import { JsonLd, LocationCard } from '@/components/seo'

export const metadata: Metadata = {
  title: 'Music Promotion by Location | totalaud.io',
  description:
    'Find local music promotion resources for your city. Radio stations, venues, blogs, and opportunities in London, Manchester, Los Angeles, New York, and more.',
  keywords: [
    'music promotion by city',
    'local music marketing',
    'london music promotion',
    'new york music pr',
    'local radio contacts',
  ],
  openGraph: {
    title: 'Music Promotion by Location | totalaud.io',
    description: 'Find local music promotion resources for your city.',
    type: 'website',
  },
}

export default function LocationIndexPage() {
  const pageSchema = generateWebPageSchema(
    'Music Promotion by Location',
    'Find local music promotion resources for your city.',
    '/location'
  )
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Locations', url: '/location' },
  ])

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0B0C',
        color: '#F7F8F9',
      }}
    >
      <JsonLd schema={[pageSchema, breadcrumbSchema]} id="location-index-schemas" />

      {/* Header */}
      <header
        style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image
            src="/brand/svg/ta-logo-cyan.svg"
            alt="totalaud.io"
            width={44}
            height={44}
            priority
          />
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link
            href="/login"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              padding: '8px 16px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#0A0B0C',
              textDecoration: 'none',
              padding: '10px 20px',
              backgroundColor: '#3AA9BE',
              borderRadius: '8px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Get started
          </Link>
        </nav>
      </header>

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        style={{
          padding: '16px 24px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <ol
          style={{
            display: 'flex',
            gap: '8px',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          <li>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              Home
            </Link>
          </li>
          <li>→</li>
          <li style={{ color: '#3AA9BE' }}>Locations</li>
        </ol>
      </nav>

      {/* Hero */}
      <section
        style={{
          padding: '40px 24px 80px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '16px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Music promotion by location
        </h1>
        <p
          style={{
            fontSize: '18px',
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.6)',
            maxWidth: '600px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Every city has its own scene, radio stations, venues, and tastemakers. Find local
          opportunities wherever you are.
        </p>
      </section>

      {/* UK Section */}
      <section
        style={{
          padding: '0 24px 60px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '24px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          🇬🇧 United Kingdom
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {ukLocations.map((location) => (
            <LocationCard
              key={location.slug}
              slug={location.slug}
              name={location.name}
              radioCount={location.radioStations.length}
              venueCount={location.venues.length}
            />
          ))}
        </div>
      </section>

      {/* US Section */}
      <section
        style={{
          padding: '0 24px 100px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '24px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          🇺🇸 United States
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {usLocations.map((location) => (
            <LocationCard
              key={location.slug}
              slug={location.slug}
              name={location.name}
              radioCount={location.radioStations.length}
              venueCount={location.venues.length}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '40px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <Link href="/">
            <Image
              src="/brand/svg/totalaud-wordmark-cyan.svg"
              alt="totalaud.io"
              width={100}
              height={24}
              style={{ opacity: 0.7 }}
            />
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link
              href="/faq"
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.35)',
                textDecoration: 'none',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              FAQ
            </Link>
            <Link
              href="/privacy"
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.35)',
                textDecoration: 'none',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.35)',
                textDecoration: 'none',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
