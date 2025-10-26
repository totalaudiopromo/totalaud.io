/**
 * WaitlistModal - Email capture for beta access
 *
 * Appears when user clicks "Request Access" CTA.
 * Minimal, focused design matching landing page aesthetic.
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { track } from '@vercel/analytics'

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const easeCubic = [0.22, 1, 0.36, 1] as const

export function WaitlistModal({ isOpen, onClose, onSuccess }: WaitlistModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || isSubmitting) return

    setIsSubmitting(true)
    setStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'landing_page' }),
      })

      const data = await response.json()

      if (!response.ok) {
        setStatus('error')
        setErrorMessage(data.error || 'Something went wrong')
        track('waitlist_error', { error: data.error })
        setIsSubmitting(false)
        return
      }

      // Success!
      setStatus('success')
      track('waitlist_success', { email })

      // Clear form after 2s, then close
      setTimeout(() => {
        setEmail('')
        setStatus('idle')
        onSuccess?.()
        setTimeout(() => onClose(), 500)
      }, 2000)
    } catch (error) {
      setStatus('error')
      setErrorMessage('Network error. Please try again.')
      track('waitlist_network_error')
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: easeCubic }}
              className="relative w-full max-w-md bg-[#1A1D21] border border-[#2A3744] rounded-lg p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-[#6B7280] hover:text-[#E5E7EB] transition-colors"
                aria-label="Close modal"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {/* Content */}
              <div className="space-y-6">
                <div>
                  <h2
                    className="text-2xl font-medium text-[#E5E7EB] tracking-tight mb-2"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    Request Access
                  </h2>
                  <p className="text-sm text-[#6B7280]">
                    Join the private beta. We'll notify you when it's ready.
                  </p>
                </div>

                {status === 'success' ? (
                  // Success state
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-8 text-center"
                  >
                    <div className="text-[#3AA9BE] text-4xl mb-4">✓</div>
                    <p className="text-[#E5E7EB] font-medium mb-2">You're on the list</p>
                    <p className="text-[#6B7280] text-sm">We'll be in touch soon.</p>
                  </motion.div>
                ) : (
                  // Form
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm text-[#6B7280] mb-2"
                        style={{ fontFamily: 'var(--font-geist-mono)' }}
                      >
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 bg-[#0F1113] border border-[#2A3744] rounded-md
                          text-[#E5E7EB] placeholder:text-[#4B5563]
                          focus:outline-none focus:border-[#3AA9BE] focus:ring-1 focus:ring-[#3AA9BE]
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-colors"
                        style={{ fontFamily: 'var(--font-inter)' }}
                      />
                      {status === 'error' && (
                        <p className="mt-2 text-sm text-red-400">{errorMessage}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !email}
                      className="w-full px-6 py-3 bg-[#3AA9BE] text-[#0F1113] rounded-md
                        font-medium tracking-wide
                        hover:bg-[#3AA9BE]/90 active:scale-[0.98]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all"
                      style={{ fontFamily: 'var(--font-geist-mono)' }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Request Access'}
                    </button>
                  </form>
                )}

                {/* Privacy note */}
                {status !== 'success' && (
                  <p
                    className="text-xs text-[#4B5563] text-center"
                    style={{ fontFamily: 'var(--font-geist-mono)' }}
                  >
                    We'll never share your email. No spam, ever.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
