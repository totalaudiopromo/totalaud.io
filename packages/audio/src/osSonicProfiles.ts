/**
 * OS Sonic Profiles
 * Defines distinct sonic identities for each Operating System
 */

import type { OSType, OSAudioProfile } from './audioTypes';

/**
 * Static sonic profiles per OS
 */
export const OS_SONIC_PROFILES: Record<OSType, OSAudioProfile> = {
  ascii: {
    os: 'ascii',
    basePan: -0.4, // Slightly left
    baseGain: 0.7,
    brightness: 0.9, // Bright, sharp
    reverbSend: 0.1, // Mostly dry
    rhythmSubdivision: 8, // Fast, precise
  },

  xp: {
    os: 'xp',
    basePan: -0.2, // Centre-left
    baseGain: 0.75,
    brightness: 0.7, // Medium brightness
    reverbSend: 0.3, // Medium reverb
    rhythmSubdivision: 4, // Playful, bouncy
  },

  aqua: {
    os: 'aqua',
    basePan: 0.0, // Centre
    baseGain: 0.65,
    brightness: 0.5, // Smooth, rounded
    reverbSend: 0.6, // High reverb (spacious)
    rhythmSubdivision: 2, // Slow, evolving
  },

  daw: {
    os: 'daw',
    basePan: 0.3, // Centre-right
    baseGain: 0.8,
    brightness: 0.8, // Bright, rhythmic
    reverbSend: 0.15, // Low reverb (tight)
    rhythmSubdivision: 16, // Very fast, sequenced
  },

  analogue: {
    os: 'analogue',
    basePan: 0.5, // Far right
    baseGain: 0.7,
    brightness: 0.4, // Warm, filtered
    reverbSend: 0.4, // Medium reverb
    rhythmSubdivision: 1, // Long, sustained
  },
};

/**
 * Get profile for a specific OS
 */
export function getOSProfile(os: OSType): OSAudioProfile {
  return OS_SONIC_PROFILES[os];
}

/**
 * Get all OS profiles
 */
export function getAllOSProfiles(): Record<OSType, OSAudioProfile> {
  return OS_SONIC_PROFILES;
}
