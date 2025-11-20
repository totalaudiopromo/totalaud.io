'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useOS } from '@/components/os/navigation'
import { AmbientContext, type AmbientContextValue } from './useAmbient'
import { AMBIENT_PRESETS, getTimeOfDay } from './ambientPresets'

const LOCAL_STORAGE_KEY = 'ta_ambient_intensity_v1'

interface AmbientEngineProviderProps {
  children: React.ReactNode
}

interface AudioEngine {
  context: AudioContext
  masterGain: GainNode
  noiseSource: AudioBufferSourceNode | null
}

function createNoiseBuffer(context: AudioContext, seconds = 2): AudioBuffer {
  const sampleRate = context.sampleRate
  const length = sampleRate * seconds
  const buffer = context.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.3
  }

  return buffer
}

function setupAudioEngine(): AudioEngine | null {
  if (typeof window === 'undefined') return null
  if (!(window as any).AudioContext && !(window as any).webkitAudioContext) return null

  const AudioContextCtor = (window.AudioContext ||
    (window as any).webkitAudioContext) as typeof AudioContext

  const context = new AudioContextCtor()
  const masterGain = context.createGain()
  masterGain.gain.value = 0
  masterGain.connect(context.destination)

  const buffer = createNoiseBuffer(context)
  const source = context.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 240

  source.connect(filter)
  filter.connect(masterGain)
  source.start(0)

  return {
    context,
    masterGain,
    noiseSource: source,
  }
}

export function AmbientEngineProvider({ children }: AmbientEngineProviderProps) {
  const { currentOS } = useOS()
  const prefersReducedMotion = useReducedMotion()
  const pathname = usePathname()

  const [enabled, setEnabled] = useState(true)
  const [intensity, setIntensityState] = useState(0.6)
  const [presetId, setPresetIdState] = useState<string>('default')
  const [isIdle, setIsIdle] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay)

  const audioRef = useRef<AudioEngine | null>(null)
  const idleTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY)
      if (!stored) return
      const parsed = Number.parseFloat(stored)
      if (Number.isFinite(parsed)) {
        setIntensityState(Math.min(1, Math.max(0, parsed)))
      }
    } catch {
      // ignore
    }
  }, [])

  const setIntensity = useCallback((value: number) => {
    const clamped = Math.min(1, Math.max(0, value))
    setIntensityState(clamped)

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, String(clamped))
      } catch {
        // ignore
      }
    }
  }, [])

  const setPresetId = useCallback((id: string) => {
    setPresetIdState((current) => {
      const exists = AMBIENT_PRESETS.some((preset) => preset.id === id)
      return exists ? id : current
    })
  }, [])

  useEffect(() => {
    if (!pathname) return

    if (pathname.startsWith('/demo/artist')) {
      setPresetIdState('demo-night')
    } else {
      setPresetIdState('default')
    }
  }, [pathname])

  useEffect(() => {
    const handleActivity = () => {
      if (idleTimeoutRef.current != null) {
        window.clearTimeout(idleTimeoutRef.current)
      }

      setIsIdle(false)

      idleTimeoutRef.current = window.setTimeout(() => {
        setIsIdle(true)
      }, 12_000)
    }

    if (typeof window === 'undefined') return

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('click', handleActivity)

    handleActivity()

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('click', handleActivity)

      if (idleTimeoutRef.current != null) {
        window.clearTimeout(idleTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const id = window.setInterval(() => {
      setTimeOfDay(getTimeOfDay())
    }, 5 * 60 * 1000)

    return () => {
      window.clearInterval(id)
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      if (audioRef.current) {
        audioRef.current.masterGain.gain.value = 0
      }
      return
    }

    if (!audioRef.current) {
      audioRef.current = setupAudioEngine()
    }

    if (!audioRef.current) return

    const gainNode = audioRef.current.masterGain
    const targetGain = intensity * 0.12

    try {
      const now = audioRef.current.context.currentTime
      gainNode.gain.cancelScheduledValues(now)
      gainNode.gain.linearRampToValueAtTime(targetGain, now + 0.5)
    } catch {
      gainNode.gain.value = targetGain
    }
  }, [enabled, intensity])

  useEffect(() => {
    return () => {
      if (!audioRef.current) return
      try {
        audioRef.current.masterGain.gain.value = 0
        audioRef.current.context.close()
      } catch {
        // ignore
      }
      audioRef.current = null
    }
  }, [])

  const preset = useMemo(
    () => AMBIENT_PRESETS.find((item) => item.id === presetId) ?? AMBIENT_PRESETS[0],
    [presetId],
  )

  const osAccent = useMemo(() => {
    if (!currentOS) return 1
    return preset.osAccent[currentOS.slug] ?? 1
  }, [currentOS, preset.osAccent])

  const effectiveIntensity = useMemo(() => {
    const base = enabled ? intensity : 0
    const motionScale = prefersReducedMotion ? 0.1 : 1
    const presenceScale = isIdle ? 0.6 : 1
    return base * motionScale * presenceScale * osAccent * preset.intensity
  }, [enabled, intensity, isIdle, osAccent, prefersReducedMotion, preset.intensity])

  const scale = useCallback(
    (value: number) => {
      const clamped = Math.min(1, Math.max(0, value))
      return clamped * effectiveIntensity
    },
    [effectiveIntensity],
  )

  const value: AmbientContextValue = useMemo(
    () => ({
      enabled,
      intensity,
      effectiveIntensity,
      timeOfDay,
      preset,
      currentOS: currentOS?.slug ?? null,
      osAccent,
      isIdle,
      scale,
      setEnabled,
      setIntensity,
      setPresetId,
    }),
    [
      currentOS,
      enabled,
      effectiveIntensity,
      intensity,
      isIdle,
      osAccent,
      preset,
      scale,
      setIntensity,
      setPresetId,
      setEnabled,
      timeOfDay,
    ],
  )

  return <AmbientContext.Provider value={value}>{children}</AmbientContext.Provider>
}


