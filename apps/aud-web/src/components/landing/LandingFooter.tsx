'use client'

import Image from 'next/image'
import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer
      role="contentinfo"
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <Image
            src="/brand/svg/totalaud-wordmark-cyan.svg"
            alt="totalaud.io"
            width={100}
            height={24}
            style={{ opacity: 0.7 }}
          />
          <span
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Built by{' '}
            <a
              href="https://totalaudiopromo.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#3AA9BE')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)')}
            >
              Total Audio Promo
            </a>
          </span>
        </div>
        <nav
          aria-label="Footer navigation"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <Link
            href="/privacy"
            aria-label="Privacy policy"
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            aria-label="Terms of service"
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
          >
            Terms
          </Link>
          <span
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            &copy; {new Date().getFullYear()}
          </span>
        </nav>
      </div>
    </footer>
  )
}
