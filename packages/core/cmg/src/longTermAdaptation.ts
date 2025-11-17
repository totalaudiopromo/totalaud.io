/**
 * Long-Term Adaptation Engine
 * Phase 22: Universal Creative Memory Graph
 *
 * Uses Creative Fingerprint to gently bias future behavior across systems.
 */

import { computeCreativeFingerprint } from './patternMiner';
import type {
  CreativeFingerprint,
  LongTermAdaptationProfile,
  OSName,
} from './cmg.types';

// =====================================================================
// Main Adaptation Profile Computation
// =====================================================================

/**
 * Compute long-term adaptation profile from user's creative fingerprint
 */
export async function computeLongTermAdaptation(
  userId: string,
  window: string = '90d'
): Promise<LongTermAdaptationProfile> {
  // Get or compute fingerprint
  const fingerprint = await computeCreativeFingerprint({ userId, window });

  // Transform fingerprint into adaptation biases
  const profile: LongTermAdaptationProfile = {
    preferredArcAdjustments: computeArcAdjustments(fingerprint),
    defaultTempoRange: fingerprint.sonic.typicalTempoRange,
    defaultTensionTolerance: computeTensionTolerance(fingerprint),
    osRoleBiases: computeOSRoleBiases(fingerprint),
    paletteBiases: {
      harmonic: fingerprint.sonic.harmonicPalette,
      timbral: fingerprint.sonic.timbralPreference,
    },
    computedAt: new Date().toISOString(),
  };

  return profile;
}

// =====================================================================
// Arc Adjustments
// =====================================================================

/**
 * Compute preferred arc adjustments based on structural fingerprint
 */
function computeArcAdjustments(fingerprint: CreativeFingerprint) {
  const { structural } = fingerprint;

  // Peak shift: if user typically peaks early/late, bias toward that
  const peakShift = (structural.peakPosition - 0.5) * 0.4; // Scale to ±0.2

  // Length bias: if user typically creates longer/shorter arcs
  const avgLength = structural.typicalArcLength;
  const lengthBias =
    avgLength > 15 ? 0.2 : avgLength < 8 ? -0.2 : 0;

  // Complexity bias: if user typically creates complex/simple structures
  const complexityBias =
    structural.typicalComplexity > 5
      ? 0.2
      : structural.typicalComplexity < 2
        ? -0.2
        : 0;

  return {
    peakShift: clamp(peakShift, -0.2, 0.2),
    lengthBias: clamp(lengthBias, -0.2, 0.2),
    complexityBias: clamp(complexityBias, -0.2, 0.2),
  };
}

/**
 * Compute tension tolerance based on emotional fingerprint
 */
function computeTensionTolerance(fingerprint: CreativeFingerprint): number {
  const { emotional } = fingerprint;

  // Higher negative ratio + higher volatility = higher tension tolerance
  const baseTolerance = 0.5;
  const negativeContribution = emotional.negativeRatio * 0.3;
  const volatilityContribution = emotional.volatility * 0.2;

  return clamp(baseTolerance + negativeContribution + volatilityContribution, 0, 1);
}

/**
 * Compute OS role biases based on OS fingerprint
 */
function computeOSRoleBiases(fingerprint: CreativeFingerprint) {
  const { os } = fingerprint;

  const leadBias: Partial<Record<OSName, number>> = {};
  const resolveBias: Partial<Record<OSName, number>> = {};
  const tensionBias: Partial<Record<OSName, number>> = {};

  // Lead bias: based on which OS leads most often
  if (os.leadOS) {
    leadBias[os.leadOS] = 0.8;
  }

  // Resolve bias: based on which OS resolves most often
  if (os.resolutionOS) {
    resolveBias[os.resolutionOS] = 0.8;
  }

  // Tension bias: based on which OS introduces tension most often
  if (os.tensionOS) {
    tensionBias[os.tensionOS] = 0.8;
  }

  return {
    leadBias,
    resolveBias,
    tensionBias,
  };
}

// =====================================================================
// Integration Helpers for Other Systems
// =====================================================================

/**
 * Apply arc adjustments to default arc parameters
 * Used by DAW OS and Intent Engine
 */
export function applyArcAdjustments(
  defaultArc: {
    peakPosition: number;
    length: number;
    complexity: number;
  },
  profile: LongTermAdaptationProfile
): {
  peakPosition: number;
  length: number;
  complexity: number;
} {
  const { preferredArcAdjustments } = profile;

  return {
    peakPosition: clamp(
      defaultArc.peakPosition + preferredArcAdjustments.peakShift,
      0.2,
      0.8
    ),
    length: Math.round(defaultArc.length * (1 + preferredArcAdjustments.lengthBias)),
    complexity: Math.round(defaultArc.complexity * (1 + preferredArcAdjustments.complexityBias)),
  };
}

/**
 * Apply tempo adjustments to default tempo
 * Used by Intent Engine and DAW OS
 */
export function applyTempoAdjustments(
  defaultTempo: number,
  profile: LongTermAdaptationProfile
): number {
  const [minTempo, maxTempo] = profile.defaultTempoRange;

  // If default is outside user's typical range, gently pull toward it
  if (defaultTempo < minTempo) {
    return Math.round(defaultTempo * 0.7 + minTempo * 0.3);
  }
  if (defaultTempo > maxTempo) {
    return Math.round(defaultTempo * 0.7 + maxTempo * 0.3);
  }

  return defaultTempo;
}

/**
 * Apply tension tolerance to performance thresholds
 * Used by Performance Adaptive System (Phase 21)
 */
export function applyTensionThresholds(
  defaultThresholds: {
    maxTension: number;
    minCohesion: number;
  },
  profile: LongTermAdaptationProfile
): {
  maxTension: number;
  minCohesion: number;
} {
  const tolerance = profile.defaultTensionTolerance;

  // Higher tolerance = allow more tension, require less cohesion
  return {
    maxTension: clamp(defaultThresholds.maxTension * (1 + tolerance * 0.3), 0, 1),
    minCohesion: clamp(defaultThresholds.minCohesion * (1 - tolerance * 0.2), 0, 1),
  };
}

/**
 * Get preferred OS for a given role
 * Used by Intent Engine for OS selection
 */
export function getPreferredOSForRole(
  role: 'lead' | 'resolve' | 'tension',
  profile: LongTermAdaptationProfile
): OSName | null {
  const { osRoleBiases } = profile;

  const biasMap =
    role === 'lead'
      ? osRoleBiases.leadBias
      : role === 'resolve'
        ? osRoleBiases.resolveBias
        : osRoleBiases.tensionBias;

  // Find OS with highest bias
  const entries = Object.entries(biasMap) as [OSName, number][];
  if (entries.length === 0) return null;

  const max = Math.max(...entries.map(([, bias]) => bias));
  return entries.find(([, bias]) => bias === max)?.[0] || null;
}

/**
 * Apply palette biases to default palette selection
 * Used by Intent Engine
 */
export function applyPaletteBiases(
  defaultPalette: {
    harmonic?: string;
    timbral?: string;
  },
  profile: LongTermAdaptationProfile
): {
  harmonic: string;
  timbral: string;
} {
  return {
    harmonic: defaultPalette.harmonic || profile.paletteBiases.harmonic,
    timbral: defaultPalette.timbral || profile.paletteBiases.timbral,
  };
}

// =====================================================================
// Utility Functions
// =====================================================================

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Check if adaptation profile is fresh enough to use
 */
export function isProfileFresh(
  profile: LongTermAdaptationProfile,
  maxAgeHours: number = 24
): boolean {
  const computedAt = new Date(profile.computedAt);
  const now = new Date();
  const ageHours = (now.getTime() - computedAt.getTime()) / (1000 * 60 * 60);

  return ageHours <= maxAgeHours;
}

/**
 * Merge multiple adaptation profiles (for multi-user scenarios)
 */
export function mergeAdaptationProfiles(
  profiles: LongTermAdaptationProfile[]
): LongTermAdaptationProfile {
  if (profiles.length === 0) {
    throw new Error('Cannot merge zero profiles');
  }

  if (profiles.length === 1) {
    return profiles[0];
  }

  // Average numeric values
  const avgPeakShift =
    profiles.reduce((sum, p) => sum + p.preferredArcAdjustments.peakShift, 0) / profiles.length;
  const avgLengthBias =
    profiles.reduce((sum, p) => sum + p.preferredArcAdjustments.lengthBias, 0) / profiles.length;
  const avgComplexityBias =
    profiles.reduce((sum, p) => sum + p.preferredArcAdjustments.complexityBias, 0) /
    profiles.length;

  const avgTensionTolerance =
    profiles.reduce((sum, p) => sum + p.defaultTensionTolerance, 0) / profiles.length;

  // Merge tempo ranges (take min of mins, max of maxes)
  const allMins = profiles.map((p) => p.defaultTempoRange[0]);
  const allMaxs = profiles.map((p) => p.defaultTempoRange[1]);
  const mergedTempoRange: [number, number] = [Math.min(...allMins), Math.max(...allMaxs)];

  // For categorical values, take most common
  const harmonicPalettes = profiles.map((p) => p.paletteBiases.harmonic);
  const timbralPreferences = profiles.map((p) => p.paletteBiases.timbral);

  return {
    preferredArcAdjustments: {
      peakShift: clamp(avgPeakShift, -0.2, 0.2),
      lengthBias: clamp(avgLengthBias, -0.2, 0.2),
      complexityBias: clamp(avgComplexityBias, -0.2, 0.2),
    },
    defaultTempoRange: mergedTempoRange,
    defaultTensionTolerance: clamp(avgTensionTolerance, 0, 1),
    osRoleBiases: mergeOSRoleBiases(profiles.map((p) => p.osRoleBiases)),
    paletteBiases: {
      harmonic: (findMostCommon(harmonicPalettes) || 'neutral') as any,
      timbral: (findMostCommon(timbralPreferences) || 'neutral') as any,
    },
    computedAt: new Date().toISOString(),
  };
}

function mergeOSRoleBiases(
  biases: Array<LongTermAdaptationProfile['osRoleBiases']>
): LongTermAdaptationProfile['osRoleBiases'] {
  const merged = {
    leadBias: {} as Partial<Record<OSName, number>>,
    resolveBias: {} as Partial<Record<OSName, number>>,
    tensionBias: {} as Partial<Record<OSName, number>>,
  };

  const osNames: OSName[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue'];

  for (const os of osNames) {
    const leadBiases = biases
      .map((b) => b.leadBias[os])
      .filter((v): v is number => v !== undefined);
    if (leadBiases.length > 0) {
      merged.leadBias[os] = leadBiases.reduce((a, b) => a + b, 0) / leadBiases.length;
    }

    const resolveBiases = biases
      .map((b) => b.resolveBias[os])
      .filter((v): v is number => v !== undefined);
    if (resolveBiases.length > 0) {
      merged.resolveBias[os] = resolveBiases.reduce((a, b) => a + b, 0) / resolveBiases.length;
    }

    const tensionBiases = biases
      .map((b) => b.tensionBias[os])
      .filter((v): v is number => v !== undefined);
    if (tensionBiases.length > 0) {
      merged.tensionBias[os] = tensionBiases.reduce((a, b) => a + b, 0) / tensionBiases.length;
    }
  }

  return merged;
}

function findMostCommon(values: string[]): string | null {
  if (values.length === 0) return null;

  const counts = new Map<string, number>();
  for (const val of values) {
    counts.set(val, (counts.get(val) || 0) + 1);
  }

  let maxCount = 0;
  let mostCommon: string | null = null;

  for (const [val, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = val;
    }
  }

  return mostCommon;
}
