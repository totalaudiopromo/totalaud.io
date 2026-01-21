/**
 * Waitlist Form Component - totalaud.io
 *
 * Kit (ConvertKit) v4 API integration for waitlist signups.
 * Uses the v4 API endpoint: api.kit.com/v4/forms/:id/subscribers
 *
 * NOTE: Create a form in Kit dashboard first:
 * 1. Create form: "totalaud.io Waitlist"
 * 2. Add tag: "totalaud-waitlist"
 * 3. Set NEXT_PUBLIC_CONVERTKIT_FORM_ID env variable
 * 4. Set NEXT_PUBLIC_CONVERTKIT_API_KEY env variable (v4 key starting with kit_)
 */

'use client'

import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { env } from '@/lib/env'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const formId = env.NEXT_PUBLIC_CONVERTKIT_FORM_ID
  const apiKey = env.NEXT_PUBLIC_CONVERTKIT_API_KEY
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      setFormState('error')
      setErrorMessage('Please enter a valid email address')
      return
    }

    setFormState('submitting')
    setErrorMessage('')

    try {
      const supabaseAvailable = Boolean(supabaseUrl && supabaseAnonKey)
      let supabaseSucceeded = false

      if (supabaseAvailable) {
        const response = await fetch(`${supabaseUrl}/functions/v1/waitlist-signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
            apikey: supabaseAnonKey || '',
          },
          body: JSON.stringify({
            email,
            source: 'landing_page',
          }),
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.error || 'Failed to join waitlist')
        }

        supabaseSucceeded = true
      }

      if (formId) {
        const kitResponse = await fetch(`https://api.kit.com/v4/forms/${formId}/subscribers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Kit-Api-Key': apiKey || '',
          },
          body: JSON.stringify({
            email_address: email,
          }),
        })

        if (!kitResponse.ok && !supabaseSucceeded) {
          throw new Error('Failed to subscribe')
        }
      } else if (!supabaseSucceeded) {
        console.log('[WaitlistForm] No CONVERTKIT_FORM_ID set, simulating success')
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      setFormState('success')
    } catch {
      setFormState('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {formState === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              padding: '20px 24px',
              backgroundColor: 'rgba(58, 169, 190, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(58, 169, 190, 0.3)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '15px',
                color: '#3AA9BE',
                fontWeight: 500,
              }}
            >
              You&apos;re on the list! We&apos;ll be in touch.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                aria-label="Email address"
                required
                disabled={formState === 'submitting'}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '14px 18px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#F7F8F9',
                  fontSize: '15px',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(58, 169, 190, 0.5)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              />
              <motion.button
                type="submit"
                disabled={formState === 'submitting'}
                style={{
                  padding: '14px 24px',
                  background:
                    formState === 'submitting'
                      ? 'rgba(58, 169, 190, 0.5)'
                      : 'linear-gradient(135deg, #3AA9BE 0%, #2D8A9C 100%)',
                  color: '#0A0B0C',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  cursor: formState === 'submitting' ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 40px rgba(58, 169, 190, 0.2)',
                  whiteSpace: 'nowrap',
                  outline: 'none',
                }}
                whileHover={
                  formState !== 'submitting'
                    ? { scale: 1.02, boxShadow: '0 0 60px rgba(58, 169, 190, 0.3)' }
                    : {}
                }
                whileFocus={
                  formState !== 'submitting'
                    ? {
                        scale: 1.02,
                        boxShadow:
                          '0 0 60px rgba(58, 169, 190, 0.4), 0 0 0 3px rgba(58, 169, 190, 0.5)',
                      }
                    : {}
                }
                whileTap={formState !== 'submitting' ? { scale: 0.98 } : {}}
                transition={{ duration: 0.12 }}
              >
                {formState === 'submitting' ? 'Joining...' : 'Join waitlist'}
              </motion.button>
            </div>

            {formState === 'error' && errorMessage && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: '#ef4444',
                }}
              >
                {errorMessage}
              </motion.p>
            )}

            <p
              style={{
                margin: 0,
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              No spam. We&apos;ll email you when we launch.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
