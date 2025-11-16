/**
 * Audio Graph
 * Builds the Web Audio routing graph with master gain, reverb, and per-OS buses
 */

import type { OSType } from './audioTypes';

export interface OSAudioBus {
  gain: GainNode;
  pan: StereoPannerNode;
}

export interface AudioGraph {
  context: AudioContext;
  masterGain: GainNode;
  osBuses: Record<OSType, OSAudioBus>;
  reverbSend: GainNode;
  reverbReturn: GainNode;
  reverbNode: ConvolverNode | DelayNode; // Simple reverb substitute
  ambienceGain: GainNode;
  sfxGain: GainNode;
}

/**
 * Create the main audio routing graph
 */
export function createAudioGraph(ctx: AudioContext): AudioGraph {
  // Master output
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.8; // Leave some headroom
  masterGain.connect(ctx.destination);

  // Reverb send/return (simple feedback delay for v1)
  const reverbSend = ctx.createGain();
  reverbSend.gain.value = 0;

  const reverbReturn = ctx.createGain();
  reverbReturn.gain.value = 0.3;
  reverbReturn.connect(masterGain);

  // Simple reverb: feedback delay + lowpass filter
  const reverbDelay = ctx.createDelay(2.0);
  reverbDelay.delayTime.value = 0.3; // 300ms delay

  const reverbFeedback = ctx.createGain();
  reverbFeedback.gain.value = 0.4; // Feedback amount

  const reverbFilter = ctx.createBiquadFilter();
  reverbFilter.type = 'lowpass';
  reverbFilter.frequency.value = 2000; // Dull the reverb

  // Connect reverb chain
  reverbSend.connect(reverbDelay);
  reverbDelay.connect(reverbFilter);
  reverbFilter.connect(reverbFeedback);
  reverbFeedback.connect(reverbDelay); // Feedback loop
  reverbFilter.connect(reverbReturn); // Send to output

  // Ambience and SFX buses
  const ambienceGain = ctx.createGain();
  ambienceGain.gain.value = 1.0;
  ambienceGain.connect(masterGain);

  const sfxGain = ctx.createGain();
  sfxGain.gain.value = 1.0;
  sfxGain.connect(masterGain);

  // Per-OS buses
  const osTypes: OSType[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue'];
  const osBuses: Record<OSType, OSAudioBus> = {} as Record<OSType, OSAudioBus>;

  osTypes.forEach((os) => {
    const gain = ctx.createGain();
    gain.gain.value = 1.0;

    const pan = ctx.createStereoPanner();
    pan.pan.value = 0; // Will be set by profiles

    // Connect: pan -> gain -> master
    pan.connect(gain);
    gain.connect(masterGain);

    osBuses[os] = { gain, pan };
  });

  return {
    context: ctx,
    masterGain,
    osBuses,
    reverbSend,
    reverbReturn,
    reverbNode: reverbDelay,
    ambienceGain,
    sfxGain,
  };
}

/**
 * Apply sonic profiles to OS buses
 */
export function applyOSProfiles(
  graph: AudioGraph,
  profiles: Record<OSType, any>
): void {
  Object.entries(profiles).forEach(([os, profile]) => {
    const bus = graph.osBuses[os as OSType];
    if (bus) {
      bus.pan.pan.value = profile.basePan;
      bus.gain.gain.value = profile.baseGain;
    }
  });
}
