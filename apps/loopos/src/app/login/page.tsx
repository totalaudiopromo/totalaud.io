'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await auth.sendMagicLink(email)

    if (error) {
      toast.error('Failed to send magic link. Please try again.')
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
      toast.success('Check your email for the magic link!')
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-centre justify-centre bg-background p-4">
        <div className="w-full max-w-md">
          <div className="bg-background border border-border rounded-lg p-8 text-centre">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-centre justify-centre mx-auto mb-4">
              <svg
                className="w-8 h-8 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Check your email</h2>
            <p className="text-foreground/60 mb-6">
              We've sent a magic link to <span className="text-accent">{email}</span>
            </p>
            <p className="text-sm text-foreground/40">
              Click the link in your email to sign in to LoopOS
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-centre justify-centre bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-centre mb-8">
          <h1 className="text-4xl font-bold mb-2 text-glow">LoopOS</h1>
          <p className="text-foreground/60">Creative Campaign Operating System</p>
        </div>

        <div className="bg-background border border-border rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Sign in</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-accent text-background font-medium rounded-lg hover:bg-accent/90 transition-colours disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </button>
          </form>

          <p className="text-sm text-foreground/40 mt-6 text-centre">
            We'll send you a passwordless login link
          </p>
        </div>
      </div>
    </div>
  )
}
