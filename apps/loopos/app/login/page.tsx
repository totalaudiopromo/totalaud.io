/**
 * Login Page
 * Supabase magic link authentication
 */

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setEmailSent(true)
      toast.success('Check your email for the magic link!')
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Failed to send magic link')
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-matte-black text-white p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold glow-accent">Check your email</h1>
            <p className="text-gray-400">
              We&apos;ve sent a magic link to <strong className="text-slate-cyan">{email}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Click the link in the email to sign in to LoopOS
            </p>
          </div>

          <button
            onClick={() => setEmailSent(false)}
            className="text-slate-cyan hover:underline text-sm"
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-matte-black text-white p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold glow-accent">LoopOS</h1>
          <p className="text-gray-400">Artist-facing OS for music promotion</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="artist@example.com"
              className="w-full px-4 py-3 bg-black border border-slate-cyan/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-slate-cyan transition-colors"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-slate-cyan text-black font-semibold rounded-lg hover:bg-slate-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-240"
          >
            {isLoading ? 'Sending magic link...' : 'Sign in with magic link'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          No password needed. We&apos;ll email you a secure sign-in link.
        </p>
      </div>
    </div>
  )
}
