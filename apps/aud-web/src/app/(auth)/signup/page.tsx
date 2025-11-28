/**
 * Signup Page
 * 2025 Brand Pivot - Cinematic Editorial
 */

import { Metadata } from 'next'
import { SignupForm } from './SignupForm'

export const metadata: Metadata = {
  title: 'Create account - totalaud.io',
  description: 'Create your totalaud.io account and start your music journey',
}

export default function SignupPage() {
  return <SignupForm />
}
