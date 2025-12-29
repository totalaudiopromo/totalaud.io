import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  getLocationBySlug,
  getAllLocationSlugs,
  generateWebPageSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo'
import { JsonLd } from '@/components/seo'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllLocationSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const location = getLocationBySlug(slug)

  if (!location) {
    return { title: 'Location Not Found' }
  }

  return {
    title: location.title,
    description: location.description,
    keywords: location.keywords,
    openGraph: {
      title: location.title,
      description: location.description,
      type: 'website',
    },
  }
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params
  const location = getLocationBySlug(slug)

  if (!location) {
    notFound()
  }

  const pageSchema = generateWebPageSchema(
    location.title,
    location.description,
    `/location/${slug}`
  )
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Locations', url: '/location' },
    { name: location.name, url: `/location/${slug}` },
  ])

  const countryFlag = location.country === 'UK' ? '🇬🇧' : '🇺🇸'

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0B0C',
        color: '#F7F8F9',
      }}
    >
      <JsonLd schema={[pageSchema, breadcrumbSchema]} id="location-schemas" />

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
          maxWidth: '900px',
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
          <li style={{ color: '#3AA9BE' }}>
            {countryFlag} {location.name}
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <section
        style={{
          padding: '40px 24px 80px',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            padding: '6px 12px',
            background: 'rgba(58, 169, 190, 0.15)',
            border: '1px solid rgba(58, 169, 190, 0.3)',
            borderRadius: '100px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#3AA9BE',
            marginBottom: '24px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          {countryFlag} {location.name} Artists
        </span>

        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '24px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          {location.heroText}
        </h1>

        <p
          style={{
            fontSize: '18px',
            lineHeight: 1.7,
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '40px',
            maxWidth: '600px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          {location.sceneDescription}
        </p>

        <Link
          href="/signup"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 32px',
            backgroundColor: '#3AA9BE',
            color: '#0A0B0C',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            textDecoration: 'none',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Start Your Workspace →
        </Link>
      </section>

      {/* Local Opportunities */}
      <section
        style={{
          padding: '80px 24px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 600,
              marginBottom: '16px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            {location.name} opportunities
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '40px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Key contacts and platforms for {location.name}-based artists.
          </p>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {location.localOpportunities.map((opp, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '16px 20px',
                  background: 'rgba(58, 169, 190, 0.05)',
                  border: '1px solid rgba(58, 169, 190, 0.15)',
                  borderRadius: '10px',
                }}
              >
                <span style={{ color: '#3AA9BE', fontSize: '16px' }}>✓</span>
                <span
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {opp}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Radio Stations */}
      <section
        style={{
          padding: '80px 24px',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 600,
              marginBottom: '16px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Radio stations in {location.name}
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '40px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Local and regional stations worth pitching to.
          </p>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {location.radioStations.map((station, i) => (
              <li
                key={i}
                style={{
                  padding: '10px 16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                📻 {station}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Venues */}
      <section
        style={{
          padding: '80px 24px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 600,
              marginBottom: '16px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Key venues in {location.name}
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '40px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Grassroots venues where new artists get discovered.
          </p>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}
          >
            {location.venues.map((venue, i) => (
              <li
                key={i}
                style={{
                  padding: '14px 18px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                🎤 {venue}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How It Works */}
      <section
        style={{
          padding: '80px 24px',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 600,
              marginBottom: '40px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            How totalaud.io helps {location.name} artists
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
            }}
          >
            {[
              {
                title: 'Scout',
                desc: `Find ${location.name} radio contacts, local blogs, and playlist curators.`,
              },
              {
                title: 'Ideas',
                desc: 'Capture your creative and marketing ideas in one calm space.',
              },
              {
                title: 'Timeline',
                desc: 'Plan your release campaign and local press outreach visually.',
              },
              {
                title: 'Pitch',
                desc: `Craft pitches that resonate with the ${location.name} music scene.`,
              },
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  padding: '24px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                }}
              >
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#3AA9BE',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: 'rgba(255, 255, 255, 0.6)',
                    margin: 0,
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: '100px 24px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 600,
            marginBottom: '16px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Ready to grow your {location.name} audience?
        </h2>
        <p
          style={{
            fontSize: '17px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '40px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Join hundreds of {location.country === 'UK' ? 'British' : 'American'} artists using
          totalaud.io.
        </p>
        <Link
          href="/signup"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '18px 36px',
            backgroundColor: '#3AA9BE',
            color: '#0A0B0C',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            textDecoration: 'none',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Start Your Workspace →
        </Link>
        <p
          style={{
            marginTop: '16px',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.35)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          From £5/month • Cancel anytime
        </p>
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
            maxWidth: '900px',
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
