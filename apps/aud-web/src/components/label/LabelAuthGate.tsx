'use client'

/**
 * LabelAuthGate — client-side gate for the Label OS surface.
 *
 * Unlike the workspace gate (which allows guests), Label OS is private while
 * the product sits behind the waitlist: unauthenticated visitors are
 * redirected to /login. Nothing on the public landing page links here.
 */

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useLabelStore } from '@/stores/useLabelStore'
import { logger } from '@/lib/logger'
import { LabelLoadingSkeleton } from './LabelLoadingSkeleton'

const log = logger.scope('LabelAuthGate')

export function LabelAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'authed'>('checking')
  const loadLabels = useLabelStore((s) => s.loadLabels)

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()
    let cancelled = false

    async function check() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (cancelled) return

      if (error || !user) {
        log.info('Unauthenticated visitor — redirecting to login')
        router.replace('/login')
        return
      }

      setStatus('authed')
      void loadLabels()
    }

    void check()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/login')
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [router, loadLabels])

  if (status === 'checking') {
    return <LabelLoadingSkeleton />
  }

  return <>{children}</>
}
