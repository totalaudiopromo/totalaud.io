'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface MagneticButtonProps {
  children: React.ReactNode
  href: string
}

export function MagneticButton({ children, href }: MagneticButtonProps) {
  const buttonRef = useRef<HTMLAnchorElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isTouchDevice || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const x = (e.clientX - centerX) * 0.15
    const y = (e.clientY - centerY) * 0.15
    setPosition({ x, y })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block' }}
    >
      <Link href={href} ref={buttonRef} style={{ textDecoration: 'none' }}>
        <motion.div
          animate={{ x: position.x, y: position.y }}
          transition={{ type: 'spring', stiffness: 350, damping: 15, mass: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '18px 36px',
            background: 'linear-gradient(135deg, #3AA9BE 0%, #2D8A9C 100%)',
            color: '#0A0B0C',
            borderRadius: '60px',
            fontSize: '15px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            cursor: 'pointer',
            boxShadow: '0 0 60px rgba(58, 169, 190, 0.3), 0 4px 20px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {children}
          <motion.span
            aria-hidden="true"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            &rarr;
          </motion.span>
        </motion.div>
      </Link>
    </motion.div>
  )
}
