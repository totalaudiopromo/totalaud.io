"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { OSTheme, THEME_CONFIGS } from "@/types/themes"
import BrokerIntro from "@/components/BrokerIntro"
import BrokerChat from "@/components/BrokerChat"
import { motion, AnimatePresence } from "framer-motion"

function BrokerContent() {
  const searchParams = useSearchParams()
  const mode = (searchParams.get('mode') as OSTheme) || 'ascii'
  const [showIntro, setShowIntro] = useState(true)
  const [sessionId] = useState(() => `broker-${Date.now()}`)

  useEffect(() => {
    console.log('[BrokerPage] Mounted with mode:', mode)
    console.log('[BrokerPage] showIntro:', showIntro)
  }, [mode, showIntro])

  // Validate mode
  if (!(mode in THEME_CONFIGS)) {
    console.log('[BrokerPage] Invalid mode, redirecting to selector')
    if (typeof window !== 'undefined') {
      window.location.href = '/onboarding/os-selector'
    }
    return null
  }

  return (
    <AnimatePresence mode="wait">
      {showIntro ? (
        <BrokerIntro
          key="intro"
          selectedMode={mode}
          onComplete={() => {
            console.log('[BrokerPage] Intro complete, showing chat')
            setShowIntro(false)
          }}
        />
      ) : (
        <motion.div
          key="chat"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          onAnimationComplete={() => console.log('[BrokerPage] Chat fade-in complete')}
        >
          <BrokerChat
            selectedMode={mode}
            sessionId={sessionId}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function BrokerPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="animate-pulse">Loading agent...</div>
      </div>
    }>
      <BrokerContent />
    </Suspense>
  )
}

