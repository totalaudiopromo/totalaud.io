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
  const audioCache = useRef<Map<string, AudioBuffer>>(new Map())

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

  const loadAudioFile = async (url: string): Promise<AudioBuffer | null> => {
    if (!audioContext.current) return null
    
    // Check cache first
    if (audioCache.current.has(url)) {
      return audioCache.current.get(url)!
    }

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer)
      audioCache.current.set(url, audioBuffer)
      return audioBuffer
    } catch (error) {
      console.warn(`Failed to load audio file ${url}:`, error)
      return null
    }
  }

  const playAudioFile = async (url: string) => {
    if (!config.enabled || !audioContext.current) return

    try {
      const buffer = await loadAudioFile(url)
      if (!buffer) return

      const source = audioContext.current.createBufferSource()
      const gainNode = audioContext.current.createGain()

      source.buffer = buffer
      source.connect(gainNode)
      gainNode.connect(audioContext.current.destination)

      gainNode.gain.value = config.volume
      source.start(0)
    } catch (error) {
      console.warn("Failed to play audio file:", error)
    }
  }

  return {
    config,
    setConfig,
    
    // UI Sound Effects (Synthetic fallbacks)
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
    
    // Theme-specific boot sounds
    boot: async (theme: string) => {
      const soundMap: Record<string, string> = {
        ascii: "/sounds/ascii/beep-sequence.mp3",
        xp: "/sounds/xp/xp-startup.mp3",
        aqua: "/sounds/aqua/mac-chime.mp3",
        ableton: "/sounds/ableton/sequencer-start.mp3",
        punk: "/sounds/punk/tape-start.mp3"
      }
      
      const soundFile = soundMap[theme]
      if (soundFile) {
        await playAudioFile(soundFile)
      } else {
        // Fallback to synthetic beep sequence
        playTone(400, 0.08, "sine")
        setTimeout(() => playTone(600, 0.08, "sine"), 80)
        setTimeout(() => playTone(800, 0.1, "sine"), 160)
      }
    },
    
    // Theme ambient loops
    playAmbient: async (theme: string) => {
      const ambientMap: Record<string, string> = {
        ascii: "/sounds/ascii/typing-soft.mp3",
        aqua: "/sounds/aqua/vinyl-hiss.mp3",
        ableton: "/sounds/ableton/synth-pad.mp3",
        punk: "/sounds/punk/tape-hiss.mp3"
      }
      
      const soundFile = ambientMap[theme]
      if (soundFile) {
        await playAudioFile(soundFile)
      }
    },
    
    // Theme-specific click sounds
    themeClick: async (theme: string) => {
      const clickMap: Record<string, string> = {
        ascii: "/sounds/ascii/mechanical-key.mp3",
        xp: "/sounds/xp/xp-click.mp3",
        aqua: "/sounds/aqua/aqua-pop.mp3",
        ableton: "/sounds/ableton/clip-trigger.mp3",
        punk: "/sounds/punk/stamp-press.mp3"
      }
      
      const soundFile = clickMap[theme]
      if (soundFile) {
        await playAudioFile(soundFile)
      } else {
        // Fallback to synthetic click
        playTone(800, 0.05, "sine")
      }
    },
    
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
    },
    
    // Preload theme sounds
    preloadThemeSounds: async (theme: string) => {
      const sounds = [
        `/sounds/${theme}/beep-sequence.mp3`,
        `/sounds/${theme}/click.mp3`
      ]
      
      await Promise.all(sounds.map(url => loadAudioFile(url)))
    }
  }
}

