"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import OSTransition from "@/components/OSTransition"
import { OSTheme, THEME_CONFIGS } from "@/types/themes"

function TransitionContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') as OSTheme | null

  // Validate mode
  if (!mode || !(mode in THEME_CONFIGS)) {
    // Redirect to OS selector if no valid mode
    if (typeof window !== 'undefined') {
      window.location.href = '/onboarding/os-selector'
    }
    return null
  }

  return <OSTransition selectedMode={mode} />
}

export default function TransitionPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    }>
      <TransitionContent />
    </Suspense>
  )
}

