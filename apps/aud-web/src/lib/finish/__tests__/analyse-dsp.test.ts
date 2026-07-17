import { describe, expect, it } from 'vitest'
import {
  analyseChannels,
  dcOffset,
  dynamicRangeDb,
  rmsDb,
  samplePeakDb,
  silenceRatio,
  spectralMetrics,
  stereoMetrics,
  truePeakDb,
} from '../analyse-dsp'
import { deriveQc, toAnalysisResult } from '../analyse-client'

const SAMPLE_RATE = 48000

function sine(frequencyHz: number, seconds: number, amplitude = 1, sampleRate = SAMPLE_RATE) {
  const length = Math.round(seconds * sampleRate)
  const data = new Float32Array(length)
  for (let i = 0; i < length; i++) {
    data[i] = amplitude * Math.sin((2 * Math.PI * frequencyHz * i) / sampleRate)
  }
  return data
}

describe('level metrics', () => {
  it('measures RMS of a full-scale sine as ~-3.01 dB', () => {
    const tone = sine(997, 2)
    expect(rmsDb([tone])).toBeCloseTo(-3.01, 1)
  })

  it('measures sample peak of a half-scale sine as ~-6.02 dB', () => {
    const tone = sine(997, 2, 0.5)
    expect(samplePeakDb([tone])).toBeCloseTo(-6.02, 1)
  })

  it('true peak is at or above sample peak', () => {
    const tone = sine(11025, 1, 0.5, 44100) // high freq → inter-sample peaks
    const sampled = samplePeakDb([tone])
    const truePk = truePeakDb([tone])
    expect(truePk).toBeGreaterThanOrEqual(sampled - 0.01)
  })

  it('detects DC offset', () => {
    const tone = sine(440, 1, 0.5)
    const shifted = tone.map((s) => s + 0.05) as Float32Array
    expect(dcOffset([shifted])).toBeCloseTo(0.05, 2)
  })

  it('measures silence ratio', () => {
    const half = new Float32Array(SAMPLE_RATE) // 1s silence
    const tone = sine(440, 1, 0.5)
    const combined = new Float32Array(half.length + tone.length)
    combined.set(half, 0)
    combined.set(tone, half.length)
    expect(silenceRatio([combined])).toBeCloseTo(0.5, 1)
  })
})

describe('BS.1770 loudness', () => {
  it('measures a 997 Hz full-scale sine at approximately -3.01 LUFS', () => {
    // BS.1770 reference: 997 Hz 0 dBFS sine reads -3.01 LUFS (K-weighting
    // is ~0 dB at 1 kHz). Allow tolerance for single-precision filters.
    const tone = sine(997, 5)
    const analysis = analyseChannels([tone], SAMPLE_RATE)
    expect(analysis.integrated_lufs).toBeGreaterThan(-3.6)
    expect(analysis.integrated_lufs).toBeLessThan(-2.6)
  })

  it('gates out silence: loudness of tone+silence matches tone alone', () => {
    const tone = sine(997, 4, 0.25)
    const silence = new Float32Array(SAMPLE_RATE * 4)
    const combined = new Float32Array(tone.length + silence.length)
    combined.set(tone, 0)
    combined.set(silence, tone.length)

    const toneOnly = analyseChannels([tone], SAMPLE_RATE).integrated_lufs
    const withSilence = analyseChannels([combined], SAMPLE_RATE).integrated_lufs
    expect(Math.abs(toneOnly - withSilence)).toBeLessThan(0.5)
  })

  it('reports level movement between loud and quiet sections', () => {
    const loud = sine(440, 4, 0.8)
    const quiet = sine(440, 4, 0.1)
    const combined = new Float32Array(loud.length + quiet.length)
    combined.set(loud, 0)
    combined.set(quiet, loud.length)
    expect(dynamicRangeDb([combined], SAMPLE_RATE)).toBeGreaterThan(10)
  })
})

describe('stereo metrics', () => {
  it('identical channels: zero width, correlation 1', () => {
    const tone = sine(440, 1, 0.5)
    const metrics = stereoMetrics(tone, new Float32Array(tone))
    expect(metrics.stereo_width).toBeCloseTo(0, 3)
    expect(metrics.correlation).toBeCloseTo(1, 3)
  })

  it('inverted channels: full width, correlation -1', () => {
    const tone = sine(440, 1, 0.5)
    const inverted = tone.map((s) => -s) as Float32Array
    const metrics = stereoMetrics(tone, inverted)
    expect(metrics.stereo_width).toBeCloseTo(1, 3)
    expect(metrics.correlation).toBeCloseTo(-1, 3)
  })
})

describe('spectral metrics', () => {
  it('centroid of a pure tone sits near the tone frequency', () => {
    const tone = sine(1000, 2)
    const metrics = spectralMetrics([tone], SAMPLE_RATE)
    expect(metrics.spectral_centroid_hz).toBeGreaterThan(850)
    expect(metrics.spectral_centroid_hz).toBeLessThan(1150)
  })

  it('higher tones move the centroid up', () => {
    const low = spectralMetrics([sine(200, 2)], SAMPLE_RATE)
    const high = spectralMetrics([sine(5000, 2)], SAMPLE_RATE)
    expect(high.spectral_centroid_hz).toBeGreaterThan(low.spectral_centroid_hz)
  })
})

describe('QC derivation', () => {
  it('flags hot true peaks', () => {
    const analysis = analyseChannels([sine(997, 2, 0.999)], SAMPLE_RATE)
    const qc = deriveQc(analysis)
    expect(qc.qc_warnings.some((w) => w.includes('True peak'))).toBe(true)
    expect(qc.qc_passed).toBe(false)
  })

  it('passes a healthy signal', () => {
    // -14ish LUFS tone with sensible peak
    const analysis = analyseChannels([sine(997, 5, 0.28)], SAMPLE_RATE)
    const result = toAnalysisResult(analysis)
    expect(result.qc_passed).toBe(true)
    expect(result.qc_warnings).toHaveLength(0)
  })

  it('flags negative stereo correlation', () => {
    const tone = sine(440, 2, 0.3)
    const inverted = tone.map((s) => -s) as Float32Array
    const analysis = analyseChannels([tone, inverted], SAMPLE_RATE)
    const qc = deriveQc(analysis)
    expect(qc.qc_warnings.some((w) => w.includes('correlation'))).toBe(true)
  })
})
