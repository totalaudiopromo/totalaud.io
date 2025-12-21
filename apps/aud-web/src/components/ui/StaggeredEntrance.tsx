'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import clsx from 'clsx'

interface StaggeredEntranceProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function StaggeredEntrance({ children, className, delay = 0 }: StaggeredEntranceProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.23, 1, 0.32, 1], // ease-out-quart-ish
          },
        },
      }}
      className={clsx(className)}
    >
      {children}
    </motion.div>
  )
}
