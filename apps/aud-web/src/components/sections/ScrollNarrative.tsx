/**
 * Scroll Narrative - Emotional Closure
 *
 * Single motion block that fades in → holds → fades out.
 * Adds emotional weight without explaining too much.
 */

'use client'

import { motion } from 'framer-motion'

// Motion grammar - consistent with landing page
const easeCubic = [0.22, 1, 0.36, 1] as const

export function ScrollNarrative() {
  return (
    <section className="py-32 text-center px-4">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1.2, ease: easeCubic }}
        className="text-xl md:text-2xl font-light text-neutral-300 max-w-3xl mx-auto leading-relaxed"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        Built by artists who still send their own emails.
      </motion.p>
    </section>
  )
}
