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

  // Validate mode
  if (!(mode in THEME_CONFIGS)) {
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
          onComplete={() => setShowIntro(false)}
        />
      ) : (
        <motion.div
          key="chat"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
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

