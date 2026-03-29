import Link from 'next/link'

const PSEO_SECTIONS = [
  {
    href: '/compare',
    label: 'Compare PR tools',
    description: 'Side-by-side comparisons of music promotion services',
  },
  {
    href: '/genre',
    label: 'Genre guides',
    description: 'Promotion strategies tailored to your genre',
  },
  {
    href: '/location',
    label: 'Local scenes',
    description: 'Music promotion opportunities in your area',
  },
  {
    href: '/for',
    label: 'Release guides',
    description: 'Step-by-step planning for every type of release',
  },
] as const

interface PseoRelatedSectionsProps {
  /** The path prefix of the current section, e.g. '/compare' -- excluded from links */
  currentSection: '/compare' | '/genre' | '/location' | '/for'
}

/**
 * Cross-linking component for pSEO pages.
 * Shows links to the other three sections, excluding the current one.
 */
export function PseoRelatedSections({ currentSection }: PseoRelatedSectionsProps) {
  const otherSections = PSEO_SECTIONS.filter((s) => s.href !== currentSection)

  return (
    <section
      style={{
        padding: '60px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '24px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          More resources
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {otherSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              style={{
                display: 'block',
                padding: '20px 24px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'border-color 0.2s',
              }}
            >
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#3AA9BE',
                  marginBottom: '6px',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                {section.label}
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  lineHeight: 1.5,
                  color: 'rgba(255, 255, 255, 0.45)',
                  margin: 0,
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                {section.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
