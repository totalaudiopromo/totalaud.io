/**
 * Signup Page
 * 2025 Brand Pivot - Cinematic Editorial
 */

import { Metadata } from 'next'
import { Suspense } from 'react'
import { SignupForm } from './SignupForm'

export const metadata: Metadata = {
  title: 'Create account - totalaud.io',
  description: 'Create your totalaud.io account and start your music journey',
}

function SignupFormLoading() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '400px',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#F7F8F9',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
          }}
        >
          Create your account
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.6)',
            lineHeight: 1.5,
          }}
        >
          Start building your music career
        </p>
      </div>
      <div style={{ opacity: 0.5 }}>Loading...</div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFormLoading />}>
      <SignupForm />
    </Suspense>
  )
}
