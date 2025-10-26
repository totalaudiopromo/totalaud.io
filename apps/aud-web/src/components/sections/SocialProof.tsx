/**
 * Social Proof Section - "Trusted By Real Creators"
 *
 * Pure typographic elegance — no logos, just names and roles.
 * Fades in on scroll with calm motion grammar.
 */

'use client'

import { motion } from 'framer-motion'

const partners = [
  { name: 'Warm FM', type: 'Radio Network' },
  { name: 'Echo Agency', type: 'Promo Agency' },
  { name: 'Reverb Club', type: 'Artist Collective' },
  { name: 'Lisa D', type: 'Producer' },
]

// Motion grammar - consistent with landing page
const easeCubic = [0.22, 1, 0.36, 1] as const

export function SocialProof() {
  return (
    <section className="py-24 border-t border-[#2A2F33]/80 text-center">
      <p
        className="text-sm uppercase tracking-widest text-neutral-500 mb-6"
        style={{ fontFamily: 'var(--font-geist-mono)' }}
      >
        Trusted by
      </p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: easeCubic }}
        className="flex flex-wrap justify-center gap-8 text-neutral-400"
      >
        {partners.map((partner) => (
          <div key={partner.name} className="flex flex-col items-center">
            <span className="text-base font-medium">{partner.name}</span>
            <span className="text-xs opacity-60">{partner.type}</span>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
