/**
 * Privacy Policy Page
 */

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for totalaud.io - how we handle your data.',
}

export default function PrivacyPage() {
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
          Privacy Policy
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
              1. Information We Collect
            </h2>
            <p>When you use totalaud.io, we collect information you provide directly, including:</p>
            <ul style={{ marginTop: '12px', paddingLeft: '24px' }}>
              <li>Account information (email address, name)</li>
              <li>Content you create (ideas, timelines, pitches)</li>
              <li>Usage data to improve our service</li>
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
              2. How We Use Your Information
            </h2>
            <p>We use your information to:</p>
            <ul style={{ marginTop: '12px', paddingLeft: '24px' }}>
              <li>Provide and maintain our service</li>
              <li>Improve and personalise your experience</li>
              <li>Communicate with you about updates and features</li>
              <li>Ensure security and prevent abuse</li>
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
              3. Data Storage & Security
            </h2>
            <p>
              Your data is stored securely using industry-standard encryption. We use Supabase for
              our database infrastructure, which provides enterprise-grade security. We do not sell
              your personal information to third parties.
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
              4. Your Rights (GDPR)
            </h2>
            <p>As a UK-based service, we comply with GDPR. You have the right to:</p>
            <ul style={{ marginTop: '12px', paddingLeft: '24px' }}>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Object to processing</li>
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
              5. Cookies
            </h2>
            <p>
              We use essential cookies to keep you signed in and remember your preferences. We do
              not use tracking cookies or share data with advertising networks.
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
              6. Contact
            </h2>
            <p>
              For any privacy-related questions, contact us at{' '}
              <a
                href="mailto:privacy@totalaudiopromo.com"
                style={{ color: '#3AA9BE', textDecoration: 'none' }}
              >
                privacy@totalaudiopromo.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
