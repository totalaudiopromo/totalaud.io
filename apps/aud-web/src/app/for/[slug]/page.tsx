import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  getUseCaseBySlug,
  getAllUseCaseSlugs,
  generateWebPageSchema,
  generateBreadcrumbSchema,
  generateHowToSchema,
} from '@/lib/seo'
import { JsonLd } from '@/components/seo'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllUseCaseSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const useCase = getUseCaseBySlug(slug)

  if (!useCase) {
    return { title: 'Guide Not Found' }
  }

  return {
    title: useCase.title,
    description: useCase.description,
    keywords: useCase.keywords,
    openGraph: {
      title: useCase.title,
      description: useCase.description,
      type: 'article',
    },
  }
}

export default async function UseCasePage({ params }: PageProps) {
  const { slug } = await params
  const useCase = getUseCaseBySlug(slug)

  if (!useCase) {
    notFound()
  }

  const pageSchema = generateWebPageSchema(useCase.title, useCase.description, `/for/${slug}`)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/for' },
    { name: useCase.name, url: `/for/${slug}` },
  ])
  const howToSchema = generateHowToSchema(
    useCase.title,
    useCase.description,
    useCase.timeline.map((step, i) => ({
      name: `Step ${i + 1}`,
      text: step,
    }))
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0B0C',
        color: '#F7F8F9',
      }}
    >
      <JsonLd schema={[pageSchema, breadcrumbSchema, howToSchema]} id="usecase-schemas" />

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
          <li style={{ color: '#3AA9BE' }}>{useCase.name}</li>
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
          Release Guide
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
          {useCase.heroText}
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
          {useCase.context}
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
          Plan Your Release →
        </Link>
      </section>

      {/* Challenges */}
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
            Common challenges
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '40px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            What makes a {useCase.name.toLowerCase()} difficult for indie artists.
          </p>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gap: '16px',
            }}
          >
            {useCase.challenges.map((challenge, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  padding: '20px 24px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '18px',
                    color: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  ×
                </span>
                <span
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.6,
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {challenge}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Timeline */}
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
            Recommended timeline
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '40px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            A step-by-step guide for your {useCase.name.toLowerCase()}.
          </p>

          <ol
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gap: '12px',
            }}
          >
            {useCase.timeline.map((step, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  padding: '20px 24px',
                  background: i === 0 ? 'rgba(58, 169, 190, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${i === 0 ? 'rgba(58, 169, 190, 0.2)' : 'rgba(255, 255, 255, 0.06)'}`,
                  borderRadius: '12px',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: i === 0 ? '#3AA9BE' : 'rgba(255, 255, 255, 0.08)',
                    color: i === 0 ? '#0A0B0C' : 'rgba(255, 255, 255, 0.5)',
                    fontSize: '13px',
                    fontWeight: 600,
                    flexShrink: 0,
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.6,
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Tips */}
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
            Pro tips
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '40px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Lessons from successful independent artists.
          </p>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gap: '16px',
            }}
          >
            {useCase.tips.map((tip, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  padding: '20px 24px',
                  background: 'rgba(58, 169, 190, 0.05)',
                  border: '1px solid rgba(58, 169, 190, 0.15)',
                  borderRadius: '12px',
                }}
              >
                <span style={{ color: '#3AA9BE', fontSize: '18px' }}>💡</span>
                <span
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.6,
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {tip}
                </span>
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
            How totalaud.io helps with your {useCase.name.toLowerCase()}
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
                desc: 'Find the right playlist curators, blogs, and radio contacts for your release.',
              },
              {
                title: 'Ideas',
                desc: 'Capture campaign concepts, content ideas, and creative direction in one place.',
              },
              {
                title: 'Timeline',
                desc: 'Visually plan every step of your release campaign with clear milestones.',
              },
              {
                title: 'Pitch',
                desc: 'Craft compelling pitches that tell your story and connect with gatekeepers.',
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
          Ready to plan your {useCase.name.toLowerCase()}?
        </h2>
        <p
          style={{
            fontSize: '17px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '40px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Join hundreds of independent artists using totalaud.io.
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
