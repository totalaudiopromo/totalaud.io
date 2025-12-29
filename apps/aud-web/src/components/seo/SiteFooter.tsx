'use client'

import Link from 'next/link'
import Image from 'next/image'

export function SiteFooter() {
  return (
    <footer
      style={{
        padding: '60px 24px 40px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        backgroundColor: '#0A0B0C',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        {/* Main Footer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'inline-block', marginBottom: '16px' }}>
              <Image
                src="/brand/svg/totalaud-wordmark-cyan.svg"
                alt="totalaud.io"
                width={100}
                height={24}
                style={{ opacity: 0.8 }}
              />
            </Link>
            <p
              style={{
                fontSize: '13px',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.4)',
                margin: 0,
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Calm workspace for
              <br />
              independent artists
            </p>
          </div>

          {/* By Genre */}
          <div>
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '16px',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              By Genre
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { href: '/genre/electronic', label: 'Electronic' },
                { href: '/genre/hip-hop', label: 'Hip-Hop' },
                { href: '/genre/indie-rock', label: 'Indie Rock' },
                { href: '/genre/pop', label: 'Pop' },
                { href: '/genre', label: 'All genres →' },
              ].map((link) => (
                <li key={link.href} style={{ marginBottom: '10px' }}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: '13px',
                      color: link.href === '/genre' ? '#3AA9BE' : 'rgba(255, 255, 255, 0.5)',
                      textDecoration: 'none',
                      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* By Location */}
          <div>
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '16px',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              By Location
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { href: '/location/london', label: 'London' },
                { href: '/location/los-angeles', label: 'Los Angeles' },
                { href: '/location/new-york', label: 'New York' },
                { href: '/location/nashville', label: 'Nashville' },
                { href: '/location', label: 'All locations →' },
              ].map((link) => (
                <li key={link.href} style={{ marginBottom: '10px' }}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: '13px',
                      color: link.href === '/location' ? '#3AA9BE' : 'rgba(255, 255, 255, 0.5)',
                      textDecoration: 'none',
                      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guides */}
          <div>
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '16px',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Guides
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { href: '/for/first-release', label: 'First Release' },
                { href: '/for/single-release', label: 'Single Release' },
                { href: '/for/ep-release', label: 'EP Release' },
                { href: '/for/album-campaign', label: 'Album Campaign' },
                { href: '/for', label: 'All guides →' },
              ].map((link) => (
                <li key={link.href} style={{ marginBottom: '10px' }}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: '13px',
                      color: link.href === '/for' ? '#3AA9BE' : 'rgba(255, 255, 255, 0.5)',
                      textDecoration: 'none',
                      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '16px',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Company
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { href: '/faq', label: 'FAQ' },
                { href: '/privacy', label: 'Privacy' },
                { href: '/terms', label: 'Terms' },
              ].map((link) => (
                <li key={link.href} style={{ marginBottom: '10px' }}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      textDecoration: 'none',
                      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.3)',
              margin: 0,
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            © {new Date().getFullYear()} totalaud.io. All rights reserved.
          </p>
          <p
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.3)',
              margin: 0,
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Made with care in the UK 🇬🇧
          </p>
        </div>
      </div>
    </footer>
  )
}
