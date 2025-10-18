"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface ConsoleShellProps {
  children: React.ReactNode
  title?: string
  accentColor?: string
  showCursor?: boolean
}

export default function ConsoleShell({ 
  children, 
  title = "TOTALAUD.IO  //  Creative Console",
  accentColor = "#10b981",
  showCursor = true
}: ConsoleShellProps) {
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState("")

  useEffect(() => {
    setMounted(true)
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour12: false }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 10 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative font-mono text-sm bg-slate-950 text-green-400 border border-slate-800 rounded-2xl overflow-hidden"
      style={{
        boxShadow: `0 0 40px -10px ${accentColor}20, 0 0 80px -20px ${accentColor}10`
      }}
    >
      {/* ASCII Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm px-4 py-2">
        <pre className="text-xs leading-tight text-slate-600 select-none">
{`┌${"─".repeat(title.length + 4)}┐
│  ${title}  │
└${"─".repeat(title.length + 4)}┘`}
        </pre>
        <div className="flex items-center justify-between mt-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">session_active</span>
            <motion.span 
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-green-400"
            >
              ●
            </motion.span>
          </div>
          <div className="text-slate-600 tabular-nums">{time}</div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 text-slate-100">
        {children}
      </div>

      {/* Cursor Blink */}
      {showCursor && (
        <motion.div
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-3 right-4 text-green-500 text-lg"
        >
          █
        </motion.div>
      )}

      {/* Ambient Glow Effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${accentColor}, transparent 70%)`
        }}
      />
    </motion.div>
  )
}

// Variant for smaller panels
export function ConsolePanel({ 
  children, 
  title, 
  accentColor = "#6366f1" 
}: { 
  children: React.ReactNode
  title?: string
  accentColor?: string 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="font-mono text-xs bg-slate-900/70 backdrop-blur-xl border border-slate-700 rounded-lg p-3 overflow-hidden"
      style={{
        boxShadow: `0 0 20px -5px ${accentColor}15`
      }}
    >
      {title && (
        <div className="text-slate-500 mb-2 pb-2 border-b border-slate-800">
          <span className="text-slate-400">⟩</span> {title}
        </div>
      )}
      <div className="text-slate-200">
        {children}
      </div>
    </motion.div>
  )
}

