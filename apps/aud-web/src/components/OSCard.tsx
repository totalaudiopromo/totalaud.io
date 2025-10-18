"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ThemeConfig } from "@/types/themes"
import { useUISound } from "@/hooks/useUISound"

interface OSCardProps {
  theme: ThemeConfig
  index: number
  onSelect: (themeId: string) => void
  isSelected: boolean
}

export default function OSCard({ theme, index, onSelect, isSelected }: OSCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const sound = useUISound()

  const handleHover = () => {
    setIsHovered(true)
    sound.themeClick(theme.id)
  }

  const handleClick = () => {
    sound.boot(theme.id)
    onSelect(theme.id)
  }

  // Get texture overlay URL
  const textureUrl = `/textures/${theme.textures.overlay}.png`

  return (
    <motion.button
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onClick={handleClick}
      onMouseEnter={handleHover}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer"
      style={{
        backgroundColor: theme.colors.background,
        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
        borderWidth: isSelected ? "3px" : "2px",
        borderStyle: "solid"
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background Texture Overlay */}
      <div
        className="absolute inset-0 opacity-30 bg-cover bg-center"
        style={{
          backgroundImage: `url(${textureUrl})`,
          mixBlendMode: theme.id === 'xp' || theme.id === 'aqua' ? 'overlay' : 'multiply'
        }}
      />

      {/* Texture Pattern (if specified) */}
      {theme.textures.pattern && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(/textures/${theme.textures.pattern}.png)`,
            backgroundSize: '256px 256px',
            backgroundRepeat: 'repeat'
          }}
        />
      )}

      {/* Effects Layer */}
      {theme.effects?.scanlines && (
        <div className="absolute inset-0 pointer-events-none scanline-effect opacity-20" />
      )}
      
      {theme.effects?.halftone && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, transparent 30%, rgba(255,0,255,0.1) 30%)',
            backgroundSize: '4px 4px'
          }}
        />
      )}

      {/* Content */}
      <div
        className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center"
        style={{
          fontFamily: theme.fontFamily,
          color: theme.colors.text
        }}
      >
        {/* ASCII Header for terminal theme */}
        {theme.id === 'ascii' && (
          <pre className="text-[10px] leading-tight mb-4 opacity-60 ascii-art">
{`┌────────────────────────────┐
│ ${theme.displayName.padEnd(26)} │
└────────────────────────────┘`}
          </pre>
        )}

        {/* Theme Name */}
        <motion.h3
          className="text-2xl font-bold mb-3"
          style={{
            color: theme.colors.primary,
            textShadow: isHovered && theme.effects?.glow
              ? `0 0 20px ${theme.colors.primary}`
              : 'none'
          }}
          animate={isHovered ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
        >
          {theme.name}
        </motion.h3>

        {/* Description */}
        <p
          className="text-sm mb-4 opacity-80"
          style={{ color: theme.colors.text }}
        >
          {theme.description}
        </p>

        {/* Tagline */}
        <div
          className="text-xs font-mono px-3 py-1 rounded-full"
          style={{
            backgroundColor: `${theme.colors.primary}20`,
            color: theme.colors.primary,
            border: `1px solid ${theme.colors.primary}40`
          }}
        >
          {theme.tagline}
        </div>

        {/* Selected Indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.background
            }}
          >
            ✓
          </motion.div>
        )}

        {/* Hover Glow */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${theme.colors.primary}20, transparent 70%)`,
              mixBlendMode: 'screen'
            }}
          />
        )}
      </div>

      {/* Loading Bar Easter Egg (XP theme) */}
      {theme.id === 'xp' && isHovered && (
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "linear" }}
          className="absolute bottom-0 left-0 h-1"
          style={{ backgroundColor: theme.colors.accent }}
        />
      )}

      {/* Punk Sticker Effect */}
      {theme.id === 'punk' && isHovered && (
        <motion.div
          initial={{ rotate: -5, x: -10, y: -10 }}
          animate={{ rotate: 5, x: 10, y: 10 }}
          transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-2 left-2 text-4xl opacity-80"
        >
          ⚡
        </motion.div>
      )}
    </motion.button>
  )
}

