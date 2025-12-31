'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import clsx from 'clsx'
import { stagger, transition, easing } from '@/lib/motion'

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
            staggerChildren: stagger.slow,
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
            duration: transition.normal.duration,
            ease: easing.standard,
          },
        },
      }}
      className={clsx(className)}
    >
      {children}
    </motion.div>
  )
}
