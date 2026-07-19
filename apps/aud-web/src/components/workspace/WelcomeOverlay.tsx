/**
 * WelcomeOverlay
 *
 * One-time welcome for a first visit to the workspace. Introduces the five
 * modes in plain language, then gets out of the way. Dismissal is stored in
 * localStorage so it never shows twice on the same device.
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { MODE_COLOURS, type WorkspaceMode } from '@/lib/workspace-modes'

const SEEN_KEY = 'totalaud_seen_welcome_overlay'

const MODE_INTROS: { key: WorkspaceMode; label: string; blurb: string }[] = [
  { key: 'ideas', label: 'Ideas', blurb: 'Jot things down before they disappear' },
  { key: 'scout', label: 'Scout', blurb: 'Find playlists, radio and blogs worth your time' },
  { key: 'timeline', label: 'Timeline', blurb: 'Plan the release week by week' },
  { key: 'pitch', label: 'Pitch', blurb: 'Write the story you send out' },
  { key: 'finish', label: 'Finish', blurb: 'A second opinion on your track before release' },
]

export function WelcomeOverlay() {
  const [show, setShow] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const hasSeen = localStorage.getItem(SEEN_KEY)
    if (!hasSeen) {
      setShow(true)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(SEEN_KEY, 'true')
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-overlay-title"
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 16 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#121415] border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[85dvh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-8"
          >
            <h2
              id="welcome-overlay-title"
              className="text-xl sm:text-2xl font-light text-white mb-2 tracking-wide"
            >
              Welcome to your workspace.
            </h2>
            <p className="text-sm text-white/50 mb-6 leading-relaxed">
              Five rooms, one release. Move between them any time — on your phone they live in the
              bar at the bottom.
            </p>

            <ul className="space-y-3 mb-8">
              {MODE_INTROS.map((item) => (
                <li key={item.key} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: MODE_COLOURS[item.key] }}
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-relaxed">
                    <span className="text-white/90 font-medium">{item.label}</span>{' '}
                    <span className="text-white/50">— {item.blurb}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  dismiss()
                  router.push('/workspace?mode=ideas')
                }}
                className="bg-[#3AA9BE] text-[#0F1113] font-medium px-6 py-3 rounded-lg hover:bg-[#4AC0D6] transition-colors"
              >
                Start with Ideas
              </button>
              <button
                onClick={dismiss}
                className="bg-transparent border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                Just have a look around
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
