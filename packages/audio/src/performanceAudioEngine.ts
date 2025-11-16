/**
 * Performance Audio Engine
 * Reactive audio layer that generates sound based on performance state
 * Supports both live (RAF) and deterministic (offline) modes
 */

import type {
  OSType,
  OSSonicState,
  AudioEngineConfig,
  PerformanceAudioState,
  AudioControlState,
} from './audioTypes';
import type { AudioGraph } from './audioGraph';
import { getOSProfile } from './osSonicProfiles';

export interface PerformanceAudioEngineOptions {
  config: AudioEngineConfig;
  getState: () => PerformanceAudioState;
  controls?: AudioControlState;
}

export class PerformanceAudioEngine {
  private graph: AudioGraph;
  private options: PerformanceAudioEngineOptions;
  private isRunning: boolean = false;
  private elapsedBeats: number = 0;
  private lastUpdateTime: number = 0;
  private beatDuration: number; // seconds per beat
  private controls: AudioControlState;

  // Ambience oscillators
  private ambienceOscillators: Map<OSType, OscillatorNode> = new Map();
  private ambienceGains: Map<OSType, GainNode> = new Map();

  constructor(graph: AudioGraph, options: PerformanceAudioEngineOptions) {
    this.graph = graph;
    this.options = options;
    this.beatDuration = 60 / options.config.bpm;
    this.controls = options.controls || {
      masterMuted: false,
      masterVolume: 0.8,
      osVoicesEnabled: true,
      ambienceEnabled: true,
      sfxEnabled: true,
    };
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastUpdateTime = this.graph.context.currentTime;
    this.startAmbience();
  }

  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.stopAmbience();
  }

  setBpm(bpm: number): void {
    this.beatDuration = 60 / bpm;
  }

  setControls(controls: Partial<AudioControlState>): void {
    this.controls = { ...this.controls, ...controls };
    this.updateControlNodes();
  }

  /**
   * Update the audio engine (called each frame or tick)
   */
  update(deltaSeconds: number): void {
    if (!this.isRunning) return;

    const state = this.options.getState();
    this.elapsedBeats += deltaSeconds / this.beatDuration;

    // Update ambience based on state
    this.updateAmbience(state);

    // Trigger beat-based OS motifs
    const currentBeat = Math.floor(this.elapsedBeats);
    if (currentBeat > Math.floor(this.elapsedBeats - deltaSeconds / this.beatDuration)) {
      this.onBeat(currentBeat, state);
    }
  }

  /**
   * Event: Evolution spark detected
   */
  onEvolutionSpark(os: OSType): void {
    if (!this.controls.sfxEnabled) return;

    const profile = getOSProfile(os);
    const ctx = this.graph.context;
    const now = ctx.currentTime;

    // Bright ascending chirp
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3 * this.controls.masterVolume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.graph.sfxGain);
    gain.connect(this.graph.reverbSend);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Event: Fusion consensus achieved
   */
  onFusionConsensus(): void {
    if (!this.controls.sfxEnabled) return;

    const ctx = this.graph.context;
    const now = ctx.currentTime;

    // Harmonic chord burst
    const frequencies = [261.63, 329.63, 392.00]; // C major chord
    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2 * this.controls.masterVolume, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

      osc.connect(gain);
      gain.connect(this.graph.sfxGain);
      gain.connect(this.graph.reverbSend);

      osc.start(now + index * 0.05);
      osc.stop(now + 1.0);
    });
  }

  /**
   * Event: Tension warning
   */
  onTensionWarning(): void {
    if (!this.controls.sfxEnabled) return;

    const ctx = this.graph.context;
    const now = ctx.currentTime;

    // Low rumble
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 55; // Low A

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15 * this.controls.masterVolume, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 5;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.graph.sfxGain);

    osc.start(now);
    osc.stop(now + 0.8);
  }

  /**
   * Start ambient pad sounds per OS
   */
  private startAmbience(): void {
    if (!this.controls.ambienceEnabled) return;

    const ctx = this.graph.context;
    const osTypes: OSType[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue'];

    osTypes.forEach((os, index) => {
      const profile = getOSProfile(os);

      // Create oscillator for ambience
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = 110 + index * 55; // Stacked fifths: A, E, B, F#, C#

      const gain = ctx.createGain();
      gain.gain.value = 0.05 * profile.baseGain * this.controls.masterVolume;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 200 + profile.brightness * 800;
      filter.Q.value = 1;

      // Route: osc -> filter -> gain -> OS bus
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.graph.osBuses[os].pan);

      // Send to reverb based on profile
      const reverbSend = ctx.createGain();
      reverbSend.gain.value = profile.reverbSend * 0.3;
      gain.connect(reverbSend);
      reverbSend.connect(this.graph.reverbSend);

      osc.start();

      this.ambienceOscillators.set(os, osc);
      this.ambienceGains.set(os, gain);
    });
  }

  /**
   * Stop ambient sounds
   */
  private stopAmbience(): void {
    this.ambienceOscillators.forEach((osc) => {
      osc.stop();
      osc.disconnect();
    });
    this.ambienceGains.forEach((gain) => {
      gain.disconnect();
    });
    this.ambienceOscillators.clear();
    this.ambienceGains.clear();
  }

  /**
   * Update ambience based on performance state
   */
  private updateAmbience(state: PerformanceAudioState): void {
    if (!this.controls.ambienceEnabled) return;

    const ctx = this.graph.context;
    const now = ctx.currentTime;

    this.ambienceGains.forEach((gain, os) => {
      const osState = state.osStates[os];
      const profile = getOSProfile(os);

      // Modulate gain based on OS state
      let targetGain = 0.05 * profile.baseGain * this.controls.masterVolume;

      if (osState === 'speaking') {
        targetGain *= 1.5;
      } else if (osState === 'charged') {
        targetGain *= 2.0;
      } else if (osState === 'idle') {
        targetGain *= 0.5;
      }

      // Smooth transition
      gain.gain.linearRampToValueAtTime(targetGain, now + 0.5);
    });
  }

  /**
   * Triggered on each beat
   */
  private onBeat(beat: number, state: PerformanceAudioState): void {
    if (!this.controls.osVoicesEnabled) return;

    const ctx = this.graph.context;
    const now = ctx.currentTime;
    const osTypes: OSType[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue'];

    osTypes.forEach((os) => {
      const profile = getOSProfile(os);
      const osState = state.osStates[os];

      // Check if this OS should trigger on this beat
      if (beat % profile.rhythmSubdivision !== 0) return;
      if (osState === 'idle' && Math.random() > 0.3) return; // Idle OSs trigger less

      // Play a short motif note
      const osc = ctx.createOscillator();
      osc.type = profile.brightness > 0.6 ? 'sine' : 'triangle';

      // Frequency based on cohesion and tension
      const baseFreq = 220 + (osTypes.indexOf(os) * 110);
      const cohesionShift = state.cohesion * 100;
      const tensionShift = state.tension * -50;
      osc.frequency.value = baseFreq + cohesionShift + tensionShift;

      const gain = ctx.createGain();
      const attackTime = 0.02;
      const releaseTime = 0.15;
      const peakGain = 0.1 * profile.baseGain * this.controls.masterVolume;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + attackTime);
      gain.gain.exponentialRampToValueAtTime(0.001, now + attackTime + releaseTime);

      osc.connect(gain);
      gain.connect(this.graph.osBuses[os].pan);

      osc.start(now);
      osc.stop(now + attackTime + releaseTime);
    });
  }

  /**
   * Update control nodes based on control state
   */
  private updateControlNodes(): void {
    const ctx = this.graph.context;
    const now = ctx.currentTime;

    // Master mute
    this.graph.masterGain.gain.linearRampToValueAtTime(
      this.controls.masterMuted ? 0 : this.controls.masterVolume,
      now + 0.05
    );

    // OS voices
    if (!this.controls.osVoicesEnabled) {
      Object.values(this.graph.osBuses).forEach((bus) => {
        bus.gain.gain.linearRampToValueAtTime(0, now + 0.05);
      });
    }

    // Ambience
    this.graph.ambienceGain.gain.linearRampToValueAtTime(
      this.controls.ambienceEnabled ? 1.0 : 0,
      now + 0.05
    );

    // SFX
    this.graph.sfxGain.gain.linearRampToValueAtTime(
      this.controls.sfxEnabled ? 1.0 : 0,
      now + 0.05
    );
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stop();
  }
}
