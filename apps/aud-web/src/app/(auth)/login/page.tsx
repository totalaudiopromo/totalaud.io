/**
 * Login Page
 * 2025 Brand Pivot - Cinematic Editorial
 */

import { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign in - totalaud.io',
  description: 'Sign in to your totalaud.io workspace',
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
