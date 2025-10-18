"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import OSCard from "@/components/OSCard"
import { THEME_CONFIGS, OSTheme } from "@/types/themes"
import { useUISound } from "@/hooks/useUISound"
import { Suspense } from "react"

function OSSelectorContent() {
  const [selectedTheme, setSelectedTheme] = useState<OSTheme | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sound = useUISound()

  useEffect(() => {
    // Check if user already has a theme selected
    // Allow 'force' query param to bypass this check
    const forceShow = searchParams.get('force') === 'true'
    
    if (!forceShow) {
      const saved = localStorage.getItem("ui_mode")
      if (saved && saved in THEME_CONFIGS) {
        // Skip this page if theme already selected
        router.push("/")
        return
      }
    }
    
    setMounted(true)
  }, [router, searchParams])

  const themes = Object.values(THEME_CONFIGS)

  const handleThemeSelect = async (themeId: string) => {
    setSelectedTheme(themeId as OSTheme)
    setIsLoading(true)
    
    // Simulate loading with progress bar
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 100)

    // Wait for progress to complete
    await new Promise(resolve => setTimeout(resolve, 1200))

    // Save to localStorage
    localStorage.setItem("ui_mode", themeId)
    
    // TODO: Save to Supabase user_profiles when auth is ready
    // await saveThemeToProfile(themeId)

    // Play completion sound
    await sound.success()

    // Redirect to transition sequence
    setTimeout(() => {
      router.push(`/onboarding/transition?mode=${themeId}`)
    }, 500)
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-green-900/20" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <AnimatePresence mode="wait">
          {!isLoading ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Header */}
              <div className="text-center mb-16 space-y-6">
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent font-mono">
                    TOTALAUD.IO
                  </h1>
                  <div className="h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-500" />
                </motion.div>

                <motion.p
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl text-slate-300"
                >
                  Choose your creative environment
                </motion.p>

                <motion.p
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-slate-500 max-w-2xl mx-auto"
                >
                  Select an aesthetic that matches your workflow. Each theme includes unique visuals,
                  sounds, and textures. You can change this anytime in settings.
                </motion.p>
              </div>

              {/* Theme Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
                {themes.map((theme, index) => (
                  <OSCard
                    key={theme.id}
                    theme={theme}
                    index={index}
                    onSelect={handleThemeSelect}
                    isSelected={selectedTheme === theme.id}
                  />
                ))}
              </div>

              {/* Footer */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center space-y-4"
              >
                <p className="text-xs text-slate-600 font-mono">
                  Marketing your music should feel like performing it.
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-slate-700">
                  <span>⌨️ Keyboard shortcuts available</span>
                  <span>|</span>
                  <span>🔊 Audio feedback optional</span>
                  <span>|</span>
                  <span>🎨 Full customization</span>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[80vh] space-y-8"
            >
              {/* Loading Title */}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl font-bold font-mono"
                style={{
                  color: selectedTheme ? THEME_CONFIGS[selectedTheme].colors.primary : '#fff'
                }}
              >
                Initializing {selectedTheme && THEME_CONFIGS[selectedTheme].displayName}...
              </motion.div>

              {/* ASCII Progress Bar */}
              <div className="w-full max-w-2xl space-y-2">
                <pre className="text-xs font-mono text-slate-400 text-center">
{`┌${"─".repeat(60)}┐`}
                </pre>
                <div className="relative h-8 bg-slate-900 border-2 border-slate-700 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                    className="h-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: selectedTheme
                        ? THEME_CONFIGS[selectedTheme].colors.primary
                        : '#3b82f6'
                    }}
                  >
                    {progress > 20 && `${progress}%`}
                  </motion.div>
                </div>
                <pre className="text-xs font-mono text-slate-400 text-center">
{`└${"─".repeat(60)}┘`}
                </pre>
              </div>

              {/* Loading Messages */}
              <div className="text-center space-y-2 font-mono text-sm text-slate-500">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: progress > 20 ? 1 : 0 }}
                >
                  ⟩ Loading textures...
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: progress > 50 ? 1 : 0 }}
                >
                  ⟩ Initializing audio system...
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: progress > 80 ? 1 : 0 }}
                >
                  ⟩ Applying theme configuration...
                </motion.div>
              </div>

              {/* Pulsing Icon */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-6xl"
              >
                {selectedTheme === 'ascii' && '⌨️'}
                {selectedTheme === 'xp' && '💾'}
                {selectedTheme === 'aqua' && '🍎'}
                {selectedTheme === 'ableton' && '🎚️'}
                {selectedTheme === 'punk' && '⚡'}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5 scanline-effect" />
    </main>
  )
}

export default function OSSelectorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <OSSelectorContent />
    </Suspense>
  )
}
