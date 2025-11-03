/**
 * Asset Sound Feedback
 * Phase 15.2-C: Agent Integration Layer
 *
 * Purpose:
 * - UI sound feedback for asset attach/detach actions
 * - Volume: 0.08-0.12 (subtle, non-intrusive)
 * - Consistent with FlowCore sound design
 *
 * Usage:
 * import { playAssetAttachSound, playAssetDetachSound } from '@/lib/asset-sounds'
 *
 * playAssetAttachSound() // On successful attachment
 * playAssetDetachSound() // On removal/unlink
 */

import { logger } from '@/lib/logger'

const log = logger.scope('AssetSounds')

/**
 * Web Audio API context (created lazily)
 */
let audioContext: AudioContext | null = null

/**
 * Get or create audio context
 */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

/**
 * Play asset attach sound
 * Ascending tone (440Hz → 880Hz) over 120ms
 * Volume: 0.10
 */
export function playAssetAttachSound(): void {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Configure oscillator
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(440, ctx.currentTime) // Start at A4
    oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12) // Ramp to A5

    // Configure gain (volume envelope)
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02) // Attack
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12) // Release

    // Play
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.12)

    log.debug('Asset attach sound played')
  } catch (error) {
    log.warn('Failed to play attach sound', error)
  }
}

/**
 * Play asset detach sound
 * Descending tone (880Hz → 440Hz) over 120ms
 * Volume: 0.08
 */
export function playAssetDetachSound(): void {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Configure oscillator
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, ctx.currentTime) // Start at A5
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.12) // Ramp to A4

    // Configure gain (volume envelope)
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02) // Attack
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12) // Release

    // Play
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.12)

    log.debug('Asset detach sound played')
  } catch (error) {
    log.warn('Failed to play detach sound', error)
  }
}

/**
 * Play asset error sound
 * Low frequency pulse (220Hz) over 240ms
 * Volume: 0.10
 */
export function playAssetErrorSound(): void {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Configure oscillator
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(220, ctx.currentTime) // A3

    // Configure gain (pulse envelope)
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02) // Attack
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1) // First pulse
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.14) // Second pulse
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.24) // Release

    // Play
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.24)

    log.debug('Asset error sound played')
  } catch (error) {
    log.warn('Failed to play error sound', error)
  }
}

/**
 * Play asset upload complete sound
 * Rising major chord (C-E-G: 261Hz, 329Hz, 392Hz) over 400ms
 * Volume: 0.12
 */
export function playAssetUploadCompleteSound(): void {
  try {
    const ctx = getAudioContext()

    // Create three oscillators for the chord
    const frequencies = [261.63, 329.63, 392.0] // C4, E4, G4
    const gainNode = ctx.createGain()

    // Connect gain to destination
    gainNode.connect(ctx.destination)

    // Configure gain (volume envelope)
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05) // Attack
    gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.2) // Sustain
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4) // Release

    // Create and play each note
    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const oscGain = ctx.createGain()

      osc.connect(oscGain)
      oscGain.connect(gainNode)

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      // Slightly stagger the notes (arpeggio effect)
      const startTime = ctx.currentTime + index * 0.03
      osc.start(startTime)
      osc.stop(startTime + 0.4)
    })

    log.debug('Asset upload complete sound played')
  } catch (error) {
    log.warn('Failed to play upload complete sound', error)
  }
}
