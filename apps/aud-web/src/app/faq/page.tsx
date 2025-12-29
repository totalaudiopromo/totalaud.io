'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { JsonLd } from '@/components/seo'
import { generateFAQSchema, getAllFAQs, getFAQsByCategory, type FAQItem } from '@/lib/seo'

const categories = [
  { id: 'all', label: 'All' },
  { id: 'general', label: 'General' },
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'technical', label: 'Technical' },
  { id: 'industry', label: 'Industry' },
] as const

type CategoryId = (typeof categories)[number]['id']

function FAQAccordion({
  faq,
  isOpen,
  onToggle,
}: {
  faq: FAQItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '24px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            fontSize: '16px',
            fontWeight: 500,
            color: '#F7F8F9',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            lineHeight: 1.5,
          }}
        >
          {faq.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            fontSize: '24px',
            color: '#3AA9BE',
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.7,
                color: 'rgba(255, 255, 255, 0.6)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                paddingBottom: '24px',
                margin: 0,
              }}
            >
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all')
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const allFaqs = getAllFAQs()
  const filteredFaqs = activeCategory === 'all' ? allFaqs : getFAQsByCategory(activeCategory)

  // Generate FAQ schema for structured data
  const faqSchemaData = allFaqs.map((faq) => ({
    question: faq.question,
    answer: faq.answer,
  }))

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0B0C',
        color: '#F7F8F9',
      }}
    >
      <JsonLd schema={generateFAQSchema(faqSchemaData)} id="faq-schema" />

      {/* Header */}
      <header
        style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image
            src="/brand/svg/ta-logo-cyan.svg"
            alt="totalaud.io"
            width={44}
            height={44}
            priority
          />
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link
            href="/login"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              padding: '8px 16px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#0A0B0C',
              textDecoration: 'none',
              padding: '10px 20px',
              backgroundColor: '#3AA9BE',
              borderRadius: '8px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section
        style={{
          padding: '80px 24px 60px',
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Frequently Asked Questions
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: '17px',
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.6)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Everything you need to know about totalaud.io and promoting your music independently.
        </motion.p>
      </section>

      {/* Category Filters */}
      <section
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 24px 40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id)
                setOpenIndex(0)
              }}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '100px',
                border: '1px solid',
                borderColor: activeCategory === cat.id ? '#3AA9BE' : 'rgba(255, 255, 255, 0.1)',
                background: activeCategory === cat.id ? 'rgba(58, 169, 190, 0.15)' : 'transparent',
                color: activeCategory === cat.id ? '#3AA9BE' : 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                transition: 'all 0.2s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* FAQ List */}
      <section
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 24px 80px',
        }}
      >
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {filteredFaqs.map((faq, index) => (
            <FAQAccordion
              key={faq.question}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: '80px 24px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 600,
            lineHeight: 1.2,
            marginBottom: '16px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Still have questions?
        </h2>
        <p
          style={{
            fontSize: '15px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '32px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Get in touch and we&apos;ll help you out.
        </p>
        <Link
          href="mailto:hello@totalaud.io"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 28px',
            backgroundColor: '#3AA9BE',
            color: '#0A0B0C',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            textDecoration: 'none',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Contact Us
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '40px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <Link href="/">
            <Image
              src="/brand/svg/totalaud-wordmark-cyan.svg"
              alt="totalaud.io"
              width={100}
              height={24}
              style={{ opacity: 0.7 }}
            />
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link
              href="/privacy"
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.35)',
                textDecoration: 'none',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.35)',
                textDecoration: 'none',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Terms
            </Link>
            <span
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.25)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              © {new Date().getFullYear()}
            </span>
          </nav>
        </div>
      </footer>
    </div>
  )
}
