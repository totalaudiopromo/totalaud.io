'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ToastProvider } from '@/contexts/ToastContext'
import { TipsProvider } from '@/components/onboarding'
import { useUserProfileStore } from '@/stores/useUserProfileStore'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { OfflineIndicator } from '@/components/ui/OfflineIndicator'
import { usePrefetchScout } from '@/hooks/usePrefetchScout'

function OnboardingGate({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { profile, isLoading, loadFromSupabase } = useUserProfileStore()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // Check auth status and load profile
  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      const supabase = createBrowserSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Technically this should be handled by server layout now, 
        // but we keep it as fallback or for mixed modes
        setIsAuthenticated(false)
        setIsChecking(false)
        return
      }

      setIsAuthenticated(true)

      // Load profile from Supabase to check onboarding status
      await loadFromSupabase()
      setIsChecking(false)
    }

    checkAuthAndOnboarding()
  }, [loadFromSupabase])

  // Show loading skeleton while checking
  if (isChecking || isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0F1113',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '2px solid rgba(58, 169, 190, 0.2)',
            borderTopColor: '#3AA9BE',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    )
  }

  // If authenticated but hasn't completed onboarding, redirect
  if (isAuthenticated && profile && !profile.onboardingCompleted) {
    router.push('/onboarding')
    return null
  }

  // If authenticated but no profile exists yet, redirect to onboarding
  if (isAuthenticated && !profile) {
    router.push('/onboarding')
    return null
  }

  // Otherwise, render workspace
  return <>{children}</>
}

export default function WorkspaceClientLayout({ children }: { children: ReactNode }) {
  // Phase 2: DESSA Speed Improvement - Pre-fetch Scout opportunities on workspace entry
  usePrefetchScout()

  return (
    <TipsProvider>
      <ToastProvider>
        <CommandPalette />
        <OfflineIndicator />
        <OnboardingGate>{children}</OnboardingGate>
      </ToastProvider>
    </TipsProvider>
  )
}
