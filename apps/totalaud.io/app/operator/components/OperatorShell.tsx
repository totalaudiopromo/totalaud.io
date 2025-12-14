/**
 * OperatorShell
 * Manages boot sequence and OperatorOS mounting
 */

'use client'

import React, { useEffect, useState } from 'react'

type BootPhase = 'operator' | 'signal' | 'ready' | 'complete'

// Lightweight local boot screens to avoid missing package imports during dev.
const BaseScreen = ({
  label,
  sublabel,
  accent = '#3AA9BE',
  duration = 800,
  onComplete,
}: {
  label: string
  sublabel?: string
  accent?: string
  duration?: number
  onComplete: () => void
}) => {
  useEffect(() => {
    const id = setTimeout(onComplete, duration)
    return () => clearTimeout(id)
  }, [duration, onComplete])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-[#EAECEE]">
      <div className="text-sm uppercase tracking-[0.3em] text-[#A0A4A8]">{sublabel}</div>
      <div className="mt-3 text-2xl font-semibold" style={{ color: accent }}>
        {label}
      </div>
      <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-[#2C2F33]">
        <div className="h-full w-1/2 animate-pulse" style={{ backgroundColor: accent }} />
      </div>
    </div>
  )
}

const BootScreen = ({ onComplete }: { onComplete: () => void }) => (
  <BaseScreen label="Operator" sublabel="Booting" onComplete={onComplete} />
)

const SignalScreen = ({ onComplete }: { onComplete: () => void }) => (
  <BaseScreen
    label="Signal Lock"
    sublabel="Linking systems"
    duration={1000}
    onComplete={onComplete}
  />
)

const ReadyScreen = ({ onComplete }: { onComplete: () => void }) => (
  <BaseScreen label="Ready" sublabel="Mounting desktop" duration={600} onComplete={onComplete} />
)

// Minimal desktop placeholder until the full OperatorOS package is wired locally.
const OperatorDesktop = () => (
  <div className="fixed inset-0 bg-[#0F1113] text-[#EAECEE]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(58,169,190,0.08),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(79,200,181,0.06),transparent_40%)]" />
    <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="text-sm uppercase tracking-[0.35em] text-[#A0A4A8]">TotalAud.io</div>
      <div className="text-3xl font-semibold text-[#3AA9BE]">OperatorOS Placeholder</div>
      <div className="max-w-md text-[#A0A4A8]">
        Full Operator desktop will mount here once the OperatorOS package is connected. For now, the
        workspace is ready to render client-only flows.
      </div>
    </div>
  </div>
)

export function OperatorShell() {
  const [phase, setPhase] = useState<BootPhase>('operator')

  const handleOperatorComplete = () => {
    setPhase('signal')
  }

  const handleSignalComplete = () => {
    setPhase('ready')
  }

  const handleReadyComplete = () => {
    setPhase('complete')
  }

  return (
    <>
      {phase === 'operator' && <BootScreen onComplete={handleOperatorComplete} />}
      {phase === 'signal' && <SignalScreen onComplete={handleSignalComplete} />}
      {phase === 'ready' && <ReadyScreen onComplete={handleReadyComplete} />}
      {phase === 'complete' && <OperatorDesktop />}
    </>
  )
}
