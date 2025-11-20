'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import type { Scene, SceneElement } from '@/lib/designer/types'

interface SceneRendererProps {
  scene: Scene
  onRefine?: () => void
}

export function SceneRenderer({ scene, onRefine }: SceneRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredElement, setHoveredElement] = useState<string | null>(null)

  // Parallax mouse effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height
      mouseX.set(x * 50)
      mouseY.set(y * 50)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-background">
      {/* Cosmic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />

      {/* Particle layer */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          x: useTransform(mouseX, [-50, 50], [-20, 20]),
          y: useTransform(mouseY, [-50, 50], [-20, 20]),
        }}
      >
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-accent rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>

      {/* Scene elements */}
      <div className="absolute inset-0 flex items-centre justify-centre">
        <div className="relative w-full max-w-6xl h-full">
          <AnimatePresence>
            {scene.elements.map((element, index) => (
              <SceneElementComponent
                key={element.id}
                element={element}
                index={index}
                isHovered={hoveredElement === element.id}
                onHover={setHoveredElement}
                mouseX={mouseX}
                mouseY={mouseY}
              />
            ))}
          </AnimatePresence>

          {/* Arcs */}
          <svg className="absolute inset-0 pointer-events-none">
            {scene.arcs.map((arc) => {
              const fromElement = scene.elements.find((e) => e.id === arc.from)
              const toElement = scene.elements.find((e) => e.id === arc.to)

              if (!fromElement || !toElement) return null

              const fromX = fromElement.position[0] + 400
              const fromY = fromElement.position[1] + 300
              const toX = toElement.position[0] + 400
              const toY = toElement.position[1] + 300

              return (
                <motion.path
                  key={arc.id}
                  d={`M ${fromX} ${fromY} Q ${(fromX + toX) / 2} ${(fromY + toY) / 2 - 50} ${toX} ${toY}`}
                  fill="none"
                  stroke={arc.colour}
                  strokeWidth={2}
                  strokeOpacity={arc.strength}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              )
            })}
          </svg>
        </div>
      </div>

      {/* Narrative overlay */}
      <motion.div
        className="absolute bottom-8 left-8 right-8 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="backdrop-blur-glass bg-background/80 border border-accent/20 rounded-lg p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-accent mb-2">{scene.title}</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{scene.narrative}</p>
        </div>
      </motion.div>
    </div>
  )
}

interface SceneElementComponentProps {
  element: SceneElement
  index: number
  isHovered: boolean
  onHover: (id: string | null) => void
  mouseX: any
  mouseY: any
}

function SceneElementComponent({
  element,
  index,
  isHovered,
  onHover,
  mouseX,
  mouseY,
}: SceneElementComponentProps) {
  const depth = element.position[2] || 0
  const parallaxX = useTransform(mouseX, [-50, 50], [-depth * 2, depth * 2])
  const parallaxY = useTransform(mouseY, [-50, 50], [-depth * 2, depth * 2])

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `calc(50% + ${element.position[0]}px)`,
        top: `calc(50% + ${element.position[1]}px)`,
        x: parallaxX,
        y: parallaxY,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: isHovered ? 1.1 : 1,
      }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      onHoverStart={() => onHover(element.id)}
      onHoverEnd={() => onHover(null)}
    >
      <div
        className="relative backdrop-blur-glass bg-background/60 border-2 rounded-xl p-4 shadow-xl"
        style={{
          borderColor: element.colour,
          boxShadow: `0 0 ${isHovered ? '30px' : '20px'} ${element.colour}40`,
          minWidth: `${element.size * 40}px`,
          minHeight: `${element.size * 40}px`,
        }}
      >
        <h4 className="font-semibold text-sm mb-1" style={{ color: element.colour }}>
          {element.title}
        </h4>
        {element.description && <p className="text-xs text-foreground/60">{element.description}</p>}
        <div
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{ backgroundColor: element.colour }}
        />
      </div>
    </motion.div>
  )
}
