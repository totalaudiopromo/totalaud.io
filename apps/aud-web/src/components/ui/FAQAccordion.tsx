/**
 * FAQ Accordion - "Before You Ask"
 *
 * Framer Motion accordion, one-at-a-time open.
 * Keyboard accessible with ARIA support.
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const faqs = [
  {
    q: 'What is totalaud.io?',
    a: 'A creative workspace for music promotion — plan releases, track campaigns, and see results in flow.',
  },
  {
    q: "Who's it for?",
    a: 'Independent artists and PR teams who want tools that feel as creative as the music they promote.',
  },
  {
    q: 'Is it AI-driven?',
    a: 'Yes, but we never use that word on purpose. Everything is designed for clarity, not buzzwords.',
  },
  {
    q: 'When can I access it?',
    a: 'We\'re currently in private beta. Request access above and we\'ll invite you as we scale capacity.',
  },
]

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-32 border-t border-[#2A2F33]/80 max-w-2xl mx-auto px-4">
      <h2
        className="text-center text-lg font-medium text-neutral-400 mb-10"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        Before you ask —
      </h2>
      <div className="space-y-2">
        {faqs.map((item, index) => (
          <div key={index} className="border-b border-[#2A2F33]/80">
            <button
              onClick={() => toggleFAQ(index)}
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
              className="w-full text-left py-4 text-neutral-200 hover:text-[#3AA9BE] transition-colors flex justify-between items-center gap-4"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              <span className="text-base md:text-lg font-medium">{item.q}</span>
              <motion.span
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="text-neutral-500 flex-shrink-0"
              >
                ↓
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {openIndex === index && (
                <motion.div
                  id={`faq-answer-${index}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <p className="text-neutral-400 text-sm md:text-base pb-4 leading-relaxed">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  )
}
