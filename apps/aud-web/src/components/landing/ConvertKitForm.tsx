/**
 * ConvertKit Email Subscribe Form
 * Phase 14: Unified Product Polish
 *
 * Integrated email capture for newsletter/updates
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { flowCoreColours, flowCoreMotion, flowCoreTypography } from '@/constants/flowCoreColours'
import { Mail, Check, AlertCircle } from 'lucide-react'

interface ConvertKitFormProps {
  formId?: string
  apiKey?: string
  placeholder?: string
  buttonText?: string
}

export function ConvertKitForm({
  formId,
  apiKey,
  placeholder = 'your@email.com',
  buttonText = 'subscribe',
}: ConvertKitFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      setStatus('error')
      setErrorMessage('please enter a valid email')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      // If no formId/apiKey provided, just show success (for demo)
      if (!formId || !apiKey) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setStatus('success')
        setEmail('')
        setTimeout(() => setStatus('idle'), 3000)
        return
      }

      // Real ConvertKit API call
      const response = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey,
          email: email,
        }),
      })

      if (!response.ok) {
        throw new Error('subscription failed')
      }

      setStatus('success')
      setEmail('')

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setStatus('idle')
      }, 3000)
    } catch (error) {
      console.error('[ConvertKitForm] Error:', error)
      setStatus('error')
      setErrorMessage('something went wrong. please try again.')
    }
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '400px',
      }}
    >
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
            flexDirection: 'column',
          }}
        >
          {/* Email Input */}
          <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Mail
                className="w-4 h-4"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  colour: flowCoreColours.textTertiary,
                  pointerEvents: 'none',
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                disabled={status === 'loading' || status === 'success'}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  backgroundColor: flowCoreColours.darkGrey,
                  border: `1px solid ${status === 'error' ? flowCoreColours.error : flowCoreColours.borderGrey}`,
                  borderRadius: '6px',
                  fontSize: flowCoreTypography.small,
                  colour: flowCoreColours.textPrimary,
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'lowercase',
                  outline: 'none',
                  transition: `border-colour ${flowCoreMotion.fast}ms ${flowCoreMotion.easeStandard}`,
                }}
                onFocus={(e) => {
                  if (status !== 'error') {
                    e.currentTarget.style.borderColor = flowCoreColours.slateCyan
                  }
                }}
                onBlur={(e) => {
                  if (status !== 'error') {
                    e.currentTarget.style.borderColor = flowCoreColours.borderGrey
                  }
                }}
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              whileHover={
                status === 'idle' || status === 'error'
                  ? { scale: 1.05 }
                  : {}
              }
              whileTap={
                status === 'idle' || status === 'error'
                  ? { scale: 0.95 }
                  : {}
              }
              transition={{ duration: flowCoreMotion.fast / 1000 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor:
                  status === 'success'
                    ? flowCoreColours.success
                    : status === 'error'
                      ? flowCoreColours.error
                      : flowCoreColours.slateCyan,
                colour: flowCoreColours.matteBlack,
                border: 'none',
                borderRadius: '6px',
                fontSize: flowCoreTypography.small,
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                textTransform: 'lowercase',
                cursor: status === 'loading' || status === 'success' ? 'not-allowed' : 'pointer',
                opacity: status === 'loading' ? 0.6 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {status === 'loading' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: '16px',
                    height: '16px',
                    border: `2px solid ${flowCoreColours.matteBlack}`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                  }}
                />
              )}
              {status === 'success' && <Check className="w-4 h-4" />}
              {status === 'error' && <AlertCircle className="w-4 h-4" />}
              {status === 'loading'
                ? 'subscribing...'
                : status === 'success'
                  ? 'subscribed!'
                  : status === 'error'
                    ? 'try again'
                    : buttonText}
            </motion.button>
          </div>

          {/* Error Message */}
          {status === 'error' && errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                fontSize: flowCoreTypography.tiny,
                colour: flowCoreColours.error,
                fontFamily: 'var(--font-mono)',
                paddingLeft: '4px',
              }}
            >
              {errorMessage}
            </motion.div>
          )}

          {/* Success Message */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                fontSize: flowCoreTypography.tiny,
                colour: flowCoreColours.success,
                fontFamily: 'var(--font-mono)',
                paddingLeft: '4px',
              }}
            >
              thanks! check your inbox to confirm
            </motion.div>
          )}
        </div>
      </form>

      {/* Privacy Note */}
      <div
        style={{
          marginTop: '12px',
          fontSize: flowCoreTypography.tiny,
          colour: flowCoreColours.textTertiary,
          fontFamily: 'var(--font-mono)',
          textAlign: 'center',
        }}
      >
        no spam. unsubscribe anytime.
      </div>
    </div>
  )
}
