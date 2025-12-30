import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  getComparisonBySlug,
  getAllComparisonSlugs,
  generateWebPageSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo'
import { JsonLd } from '@/components/seo'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllComparisonSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const comparison = getComparisonBySlug(slug)

  if (!comparison) {
    return { title: 'Comparison Not Found' }
  }

  return {
    title: comparison.title,
    description: comparison.description,
    keywords: comparison.keywords,
    openGraph: {
      title: comparison.title,
      description: comparison.description,
      type: 'website',
    },
  }
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params
  const comparison = getComparisonBySlug(slug)

  if (!comparison) {
    notFound()
  }

  const pageSchema = generateWebPageSchema(
    comparison.title,
    comparison.description,
    `/compare/${slug}`
  )
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Compare', url: '/compare' },
    { name: comparison.competitor, url: `/compare/${slug}` },
  ])

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0B0C',
        color: '#F7F8F9',
      }}
    >
      <JsonLd schema={[pageSchema, breadcrumbSchema]} id="comparison-schemas" />

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
          <li>
            <Link href="/compare" style={{ color: 'inherit', textDecoration: 'none' }}>
              Compare
            </Link>
          </li>
          <li>→</li>
          <li style={{ color: '#3AA9BE' }}>{comparison.competitor}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section
        style={{
          padding: '40px 24px 60px',
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
          Comparison
        </span>

        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '24px',
            color: '#F7F8F9',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          {comparison.heroText}
        </h1>

        <p
          style={{
            fontSize: '17px',
            lineHeight: 1.7,
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '32px',
            maxWidth: '650px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          {comparison.summary}
        </p>
      </section>

      {/* Our Approach vs Their Approach */}
      <section
        style={{
          padding: '60px 24px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px',
            }}
          >
            {/* Our Approach */}
            <div
              style={{
                padding: '28px',
                background: 'rgba(58, 169, 190, 0.08)',
                border: '1px solid rgba(58, 169, 190, 0.2)',
                borderRadius: '12px',
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  marginBottom: '16px',
                  color: '#3AA9BE',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                Our approach
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: 'rgba(255, 255, 255, 0.7)',
                  margin: 0,
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                {comparison.ourApproach}
              </p>
            </div>

            {/* Their Approach */}
            <div
              style={{
                padding: '28px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  marginBottom: '16px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                {comparison.competitor}&apos;s approach
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: 'rgba(255, 255, 255, 0.6)',
                  margin: 0,
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                {comparison.theirApproach}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(22px, 3vw, 28px)',
              fontWeight: 600,
              marginBottom: '32px',
              color: '#F7F8F9',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Feature comparison
          </h2>

          <div
            style={{
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {/* Header Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 120px',
                gap: '16px',
                padding: '16px 20px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                Feature
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#3AA9BE',
                  textAlign: 'center',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                totalaud.io
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.6)',
                  textAlign: 'center',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                {comparison.competitor}
              </span>
            </div>

            {/* Feature Rows */}
            {comparison.features.map((feature, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 120px',
                  gap: '16px',
                  padding: '14px 20px',
                  borderBottom:
                    i < comparison.features.length - 1
                      ? '1px solid rgba(255, 255, 255, 0.04)'
                      : 'none',
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {feature.name}
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    textAlign: 'center',
                    color:
                      feature.totalaud === true
                        ? '#3AA9BE'
                        : feature.totalaud === false
                          ? 'rgba(255, 255, 255, 0.3)'
                          : 'rgba(255, 255, 255, 0.6)',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {feature.totalaud === true
                    ? '✓'
                    : feature.totalaud === false
                      ? '—'
                      : feature.totalaud}
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    textAlign: 'center',
                    color:
                      feature.competitor === true
                        ? 'rgba(255, 255, 255, 0.7)'
                        : feature.competitor === false
                          ? 'rgba(255, 255, 255, 0.3)'
                          : 'rgba(255, 255, 255, 0.6)',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {feature.competitor === true
                    ? '✓'
                    : feature.competitor === false
                      ? '—'
                      : feature.competitor}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best For Sections */}
      <section
        style={{
          padding: '60px 24px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px',
            }}
          >
            {/* Best for totalaud.io */}
            <div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  marginBottom: '20px',
                  color: '#3AA9BE',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                totalaud.io is best for
              </h3>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {comparison.bestFor.us.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    }}
                  >
                    <span style={{ color: '#3AA9BE', flexShrink: 0 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Best for competitor */}
            <div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  marginBottom: '20px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                {comparison.competitor} is best for
              </h3>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {comparison.bestFor.them.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    }}
                  >
                    <span style={{ color: 'rgba(255, 255, 255, 0.4)', flexShrink: 0 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(22px, 3vw, 28px)',
              fontWeight: 600,
              marginBottom: '24px',
              color: '#F7F8F9',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Pricing
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            <div
              style={{
                padding: '24px',
                background: 'rgba(58, 169, 190, 0.08)',
                border: '1px solid rgba(58, 169, 190, 0.2)',
                borderRadius: '12px',
              }}
            >
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#3AA9BE',
                  marginBottom: '8px',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                totalaud.io
              </h3>
              <p
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#F7F8F9',
                  margin: 0,
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                {comparison.pricing.us}
              </p>
            </div>

            <div
              style={{
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
              }}
            >
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '8px',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                {comparison.competitor}
              </h3>
              <p
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: 0,
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                {comparison.pricing.them}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verdict */}
      <section
        style={{
          padding: '60px 24px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(22px, 3vw, 28px)',
              fontWeight: 600,
              marginBottom: '20px',
              color: '#F7F8F9',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Our verdict
          </h2>
          <p
            style={{
              fontSize: '17px',
              lineHeight: 1.7,
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0,
              maxWidth: '700px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            {comparison.verdict}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(26px, 4vw, 36px)',
            fontWeight: 600,
            marginBottom: '16px',
            color: '#F7F8F9',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Ready to try the calm approach?
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '32px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Start organising your music promotion in one place.
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
        <p
          style={{
            marginTop: '14px',
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
