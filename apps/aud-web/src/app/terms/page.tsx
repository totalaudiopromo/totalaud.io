/**
 * Terms of Service Page
 */

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for totalaud.io.',
}

export default function TermsPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0B0C',
        color: '#F7F8F9',
        padding: '80px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '48px',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.5)',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
          }}
        >
          ← Back to home
        </Link>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: 600,
            marginBottom: '16px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Terms of Service
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.4)',
            marginBottom: '48px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Last updated: November 2025
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            fontSize: '15px',
            lineHeight: 1.7,
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          <section>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '16px',
                color: '#F7F8F9',
              }}
            >
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using totalaud.io, you agree to be bound by these Terms of Service. If
              you do not agree, please do not use our service.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '16px',
                color: '#F7F8F9',
              }}
            >
              2. Description of Service
            </h2>
            <p>
              totalaud.io is a workspace platform for independent musicians. We provide tools for
              idea capture, opportunity discovery, release planning, and pitch crafting. Features
              may change as we continue to develop the platform.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '16px',
                color: '#F7F8F9',
              }}
            >
              3. User Accounts
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials.
              You must be at least 16 years old to use this service. You agree to provide accurate
              information when creating your account.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '16px',
                color: '#F7F8F9',
              }}
            >
              4. User Content
            </h2>
            <p>
              You retain ownership of all content you create using our service. By using
              totalaud.io, you grant us a limited licence to store and display your content solely
              for the purpose of providing the service to you.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '16px',
                color: '#F7F8F9',
              }}
            >
              5. Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul style={{ marginTop: '12px', paddingLeft: '24px' }}>
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorised access to our systems</li>
              <li>Interfere with other users&apos; use of the service</li>
              <li>Upload malicious content or code</li>
            </ul>
          </section>

          <section>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '16px',
                color: '#F7F8F9',
              }}
            >
              6. Limitation of Liability
            </h2>
            <p>
              totalaud.io is provided &quot;as is&quot; without warranties of any kind. We are not
              liable for any indirect, incidental, or consequential damages arising from your use of
              the service.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '16px',
                color: '#F7F8F9',
              }}
            >
              7. Changes to Terms
            </h2>
            <p>
              We may update these terms from time to time. We will notify you of significant changes
              via email or through the service. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '16px',
                color: '#F7F8F9',
              }}
            >
              8. Governing Law
            </h2>
            <p>
              These terms are governed by the laws of England and Wales. Any disputes will be
              resolved in the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '16px',
                color: '#F7F8F9',
              }}
            >
              9. Contact
            </h2>
            <p>
              For questions about these terms, contact us at{' '}
              <a
                href="mailto:hello@totalaudiopromo.com"
                style={{ color: '#3AA9BE', textDecoration: 'none' }}
              >
                hello@totalaudiopromo.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
