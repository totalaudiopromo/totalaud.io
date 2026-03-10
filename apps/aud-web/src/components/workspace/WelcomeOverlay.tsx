import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

export function WelcomeOverlay({ isBootstrapping }: { isBootstrapping: boolean }) {
  const [show, setShow] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Show overlay just after bootstrapping is complete
    const checkOverlay = () => {
      const hasSeen = localStorage.getItem('totalaud_seen_welcome_overlay')
      if (!hasSeen && !isBootstrapping) {
        setShow(true)
        localStorage.setItem('totalaud_seen_welcome_overlay', 'true')
      }
    }
    checkOverlay()
  }, [isBootstrapping])

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#121415] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <h2 className="text-2xl font-light text-white mb-4 tracking-wide">
            Your workspace is ready.
          </h2>
          <div className="flex flex-col gap-3 mt-8">
            <button
              onClick={() => {
                setShow(false)
                router.push('/workspace?mode=ideas')
              }}
              className="bg-[#3AA9BE] text-white px-6 py-3 rounded-lg hover:bg-[#4AC0D6] transition-colors"
            >
              Start with Ideas
            </button>
            <button
              onClick={() => {
                setShow(false)
                router.push('/workspace?mode=timeline')
              }}
              className="bg-transparent border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              Explore your Timeline
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
