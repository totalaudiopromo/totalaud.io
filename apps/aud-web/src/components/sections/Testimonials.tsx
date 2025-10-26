/**
 * Testimonials Section - "Field Notes"
 *
 * Minimal type; real or anonymised testimonials.
 * No stock images, ever. Fades in sequentially on scroll.
 */

'use client'

import { motion } from 'framer-motion'

const quotes = [
  {
    quote:
      'totalaud.io feels like a creative DAW for promotion — fast, musical, and strangely calming.',
    name: 'Lisa D',
    role: 'Artist / DJ',
  },
  {
    quote:
      "This changes how we pitch radio. It's the first tool that feels designed by someone who's done it.",
    name: 'Tom R',
    role: 'Radio Plugger',
  },
]

// Motion grammar - consistent with landing page
const easeCubic = [0.22, 1, 0.36, 1] as const

export function Testimonials() {
  return (
    <section className="py-32 text-center space-y-16 border-t border-[#2A2F33]/80 px-4">
      {quotes.map((quote, index) => (
        <motion.blockquote
          key={index}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: index * 0.2, duration: 0.6, ease: easeCubic }}
          className="max-w-2xl mx-auto text-neutral-300 leading-relaxed text-lg md:text-xl font-light"
        >
          "{quote.quote}"
          <footer className="mt-4 text-sm text-neutral-500">
            — {quote.name}, {quote.role}
          </footer>
        </motion.blockquote>
      ))}
    </section>
  )
}
