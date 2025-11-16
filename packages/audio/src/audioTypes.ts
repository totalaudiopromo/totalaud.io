/**
 * Audio System Types
 * Core types for the performance audio engine
 */

export type OSType = 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue';

export type OSSonicState = 'idle' | 'thinking' | 'speaking' | 'charged';

export interface OSAudioProfile {
  os: OSType;
  basePan: number; // -1 to 1 (left to right)
  baseGain: number; // 0 to 1
  brightness: number; // 0 to 1 (affects filter cutoff)
  reverbSend: number; // 0 to 1 (wet/dry mix)
  rhythmSubdivision: 1 | 2 | 4 | 8 | 16; // beats per trigger
}

export interface AudioEngineConfig {
  bpm: number;
  sampleRate?: number;
}

export interface PerformanceAudioState {
  bpm: number;
  bar: number;
  beat: number;
  subdivision: number;
  cohesion: number; // 0 to 1
  tension: number; // 0 to 1
  energy: number; // 0 to 1
  osStates: Record<OSType, OSSonicState>;
}

export interface AudioControlState {
  masterMuted: boolean;
  masterVolume: number; // 0 to 1
  osVoicesEnabled: boolean;
  ambienceEnabled: boolean;
  sfxEnabled: boolean;
}
