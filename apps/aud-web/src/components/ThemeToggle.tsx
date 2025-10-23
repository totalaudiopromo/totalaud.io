'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUISound } from '@aud-web/hooks/useUISound'

type ThemeMode = 'creative' | 'console'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('creative')
  const [showToast, setShowToast] = useState(false)
  const sound = useUISound()

  useEffect(() => {
    // Load theme from localStorage
    const saved = localStorage.getItem('theme-mode') as ThemeMode
    if (saved) {
      setTheme(saved)
      applyTheme(saved)
    }

    // Keyboard shortcut: Ctrl+~ or Cmd+~
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault()
        toggleTheme()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const applyTheme = (mode: ThemeMode) => {
    document.body.setAttribute('data-theme', mode)
  }

  const toggleTheme = () => {
    const newTheme: ThemeMode = theme === 'creative' ? 'console' : 'creative'
    setTheme(newTheme)
    applyTheme(newTheme)
    localStorage.setItem('theme-mode', newTheme)

    // Play sound and show toast
    sound.click()
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  return (
    <>
      {/* Theme Toggle Button */}
      <motion.button
        onClick={toggleTheme}
        className="fixed bottom-6 left-6 z-50 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-xl px-4 py-3 shadow-2xl hover:border-slate-600 transition-colors">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <motion.div
              animate={{ rotate: theme === 'console' ? 0 : 180 }}
              transition={{ duration: 0.3 }}
              className="text-lg"
            >
              {theme === 'creative' ? '✨' : '⌨️'}
            </motion.div>

            {/* Label */}
            <div className="text-left">
              <div className="text-xs text-slate-400 font-mono">
                {theme === 'creative' ? 'Creative Mode' : 'Console Mode'}
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5">
                <kbd className="px-1 py-0.5 bg-slate-900 rounded text-slate-500">
                  {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
                </kbd>
                <span className="mx-1">+</span>
                <kbd className="px-1 py-0.5 bg-slate-900 rounded text-slate-500">`</kbd>
              </div>
            </div>
          </div>

          {/* Hover Glow */}
          <div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              boxShadow:
                theme === 'creative' ? '0 0 30px -5px #3b82f640' : '0 0 30px -5px #10b98140',
            }}
          />
        </div>
      </motion.button>

      {/* Sound Toggle */}
      <motion.button
        onClick={sound.toggle}
        className="fixed bottom-6 left-48 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={sound.config.enabled ? 'Disable UI sounds' : 'Enable UI sounds'}
      >
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-xl p-3 shadow-2xl hover:border-slate-600 transition-colors">
          <div className="text-lg">{sound.config.enabled ? '🔊' : '🔇'}</div>
        </div>
      </motion.button>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-6 z-50"
          >
            <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-xl px-4 py-3 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{theme === 'console' ? '⌨️' : '✨'}</div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {theme === 'console' ? 'Console Mode' : 'Creative Mode'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {theme === 'console' ? 'ASCII aesthetics enabled' : 'Polished UI enabled'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
