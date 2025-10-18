"use client"

import { useEffect, useRef, useState } from "react"

interface UISoundConfig {
  enabled: boolean
  volume: number
}

export function useUISound() {
  const [config, setConfig] = useState<UISoundConfig>({
    enabled: false, // Disabled by default, user can enable
    volume: 0.3
  })

  const audioContext = useRef<AudioContext | null>(null)

  useEffect(() => {
    // Load config from localStorage
    const saved = localStorage.getItem("ui-sound-config")
    if (saved) {
      setConfig(JSON.parse(saved))
    }

    // Initialize Web Audio API (more reliable than Audio elements)
    if (typeof window !== "undefined" && "AudioContext" in window) {
      audioContext.current = new AudioContext()
    }
  }, [])

  useEffect(() => {
    // Save config to localStorage
    localStorage.setItem("ui-sound-config", JSON.stringify(config))
  }, [config])

  const playTone = (frequency: number, duration: number, type: OscillatorType = "sine") => {
    if (!config.enabled || !audioContext.current) return

    try {
      const ctx = audioContext.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = type
      oscillator.frequency.value = frequency

      gainNode.gain.setValueAtTime(config.volume, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch (error) {
      console.warn("Failed to play UI sound:", error)
    }
  }

  return {
    config,
    setConfig,
    
    // UI Sound Effects
    click: () => playTone(800, 0.05, "sine"),
    bleep: () => playTone(1200, 0.08, "square"),
    success: () => {
      playTone(600, 0.06, "sine")
      setTimeout(() => playTone(900, 0.08, "sine"), 60)
    },
    error: () => playTone(200, 0.15, "sawtooth"),
    notify: () => playTone(1000, 0.1, "triangle"),
    
    // Agent-specific sounds
    agentStart: () => {
      playTone(400, 0.08, "sine")
      setTimeout(() => playTone(600, 0.08, "sine"), 80)
      setTimeout(() => playTone(800, 0.1, "sine"), 160)
    },
    agentComplete: () => {
      playTone(800, 0.06, "sine")
      setTimeout(() => playTone(1000, 0.08, "sine"), 60)
    },
    
    // Message sounds
    messageReceived: () => playTone(900, 0.08, "sine"),
    messageSent: () => playTone(700, 0.06, "triangle"),
    
    // Toggle sound on/off
    toggle: () => {
      const newState = !config.enabled
      setConfig(prev => ({ ...prev, enabled: newState }))
      // Play a confirmation sound when enabling
      if (newState && audioContext.current) {
        const ctx = audioContext.current
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = 1000
        gain.gain.value = config.volume
        osc.start()
        osc.stop(ctx.currentTime + 0.05)
      }
    },
    
    setVolume: (volume: number) => {
      setConfig(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }))
    }
  }
}

