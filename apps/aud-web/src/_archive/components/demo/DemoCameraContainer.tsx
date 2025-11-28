'use client'

import React, { useEffect } from 'react'
import { motion, useAnimation, useReducedMotion } from 'framer-motion'
import { useOptionalDemo } from '@/components/demo/DemoOrchestrator'
import { registerCameraController } from '@/components/demo/director/DirectorEngine'

interface DemoCameraContainerProps {
  children: React.ReactNode
}

export function DemoCameraContainer({ children }: DemoCameraContainerProps) {
  const demo = useOptionalDemo()
  const controls = useAnimation()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!demo?.isDemoMode) {
      registerCameraController(null)
      return
    }

    registerCameraController({
      panTo: async (target, durationMs) => {
        if (prefersReducedMotion) return

        let x = 0
        let y = 0
        let scale = 1

        if (target === 'timeline') {
          x = -24
          y = 0
          scale = 1.02
        } else if (target === 'inspector') {
          x = 32
          y = 0
          scale = 1.04
        } else if (target === 'minimap') {
          x = 20
          y = -10
          scale = 1.03
        }

        await controls.start({
          x,
          y,
          scale,
          transition: {
            duration: (durationMs ?? 2000) / 1000,
            ease: 'easeInOut',
          },
        })
      },
      reset: () => {
        controls.start({
          x: 0,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.4,
            ease: 'easeOut',
          },
        })
      },
    })

    return () => {
      registerCameraController(null)
      controls.stop()
    }
  }, [controls, demo?.isDemoMode, prefersReducedMotion])

  if (!demo?.isDemoMode) {
    return <>{children}</>
  }

  return (
    <motion.div
      animate={controls}
      style={{
        willChange: 'transform',
      }}
    >
      {children}
    </motion.div>
  )
}
