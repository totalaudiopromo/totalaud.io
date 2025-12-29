import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { useCases, generateWebPageSchema, generateBreadcrumbSchema } from '@/lib/seo'
import { JsonLd, GuideCard } from '@/components/seo'

export const metadata: Metadata = {
  title: 'Release Planning Guides | totalaud.io',
  description:
    'Step-by-step guides for planning your music release. From your first single to album campaigns, learn how to promote your music effectively.',
  keywords: [
    'music release planning',
    'how to release music',
    'single release guide',
    'album campaign planning',
    'music promotion timeline',
  ],
  openGraph: {
    title: 'Release Planning Guides | totalaud.io',
    description: 'Step-by-step guides for planning your music release.',
    type: 'website',
  },
}

export default function GuidesIndexPage() {
  const pageSchema = generateWebPageSchema(
    'Release Planning Guides',
    'Step-by-step guides for planning your music release.',
    '/for'
  )
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/for' },
  ])

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0B0C',
        color: '#F7F8F9',
      }}
    >
      <JsonLd schema={[pageSchema, breadcrumbSchema]} id="guides-index-schemas" />

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
          <li style={{ color: '#3AA9BE' }}>Guides</li>
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
          Release planning guides
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
          Every release is different. Whether it's your first single or your comeback album, these
          guides will help you plan effectively.
        </p>
      </section>

      {/* Guides Grid */}
      <section
        style={{
          padding: '0 24px 100px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {useCases.map((useCase) => (
            <GuideCard
              key={useCase.slug}
              slug={useCase.slug}
              name={useCase.name}
              description={useCase.description}
              stepCount={useCase.timeline.length}
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
