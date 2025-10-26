/**
 * Landing Footer - Legal & Brand Bridge
 *
 * Links to parent brand (SEO bridge).
 * WCAG AA contrast compliant.
 * Phase 5: Animated CTA entry with glow
 */

'use client'

import { motion } from 'framer-motion'

const easeCubic = [0.22, 1, 0.36, 1] as const

interface LandingFooterProps {
  onCTAClick?: () => void
}

export function LandingFooter({ onCTAClick }: LandingFooterProps) {
  return (
    <footer className="py-20 text-center border-t border-[#2A2F33]/80 text-neutral-500 text-sm px-4">
      {/* Animated CTA - appears when footer enters viewport */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.8,
          ease: easeCubic,
          delay: 0.2,
        }}
        viewport={{ once: true, amount: 0.5 }}
        className="mb-12"
      >
        <motion.button
          onClick={onCTAClick}
          whileHover={{
            scale: 1.02,
            boxShadow: '0 0 40px rgba(58, 169, 190, 0.3)',
          }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#3AA9BE] text-[#0F1113] rounded-lg
            font-medium tracking-wide shadow-lg
            hover:bg-[#3AA9BE]/90 transition-all"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          Request Beta Access
          <span>→</span>
        </motion.button>
      </motion.div>

      {/* Copyright & Links */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <p className="text-xs font-medium" style={{ fontFamily: 'var(--font-geist-mono)' }}>
          © 2025 Total Audio Studio — from practical to poetic.
        </p>
        <p className="mt-3 flex items-center justify-center gap-3 flex-wrap">
          <a
            href="https://totalaudiopromo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#3AA9BE] transition-colors text-xs"
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            total audio promo ↗
          </a>
          <span>·</span>
          <a
            href="/privacy"
            className="hover:text-[#3AA9BE] transition-colors text-xs"
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            Privacy
          </a>
          <span>·</span>
          <a
            href="/terms"
            className="hover:text-[#3AA9BE] transition-colors text-xs"
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            Terms
          </a>
        </p>
      </motion.div>
    </footer>
  )
}
