/**
 * Pure DSP analysis functions for Finish mode.
 *
 * Everything in this file operates on plain Float32Array channel data so it
 * is unit-testable in Node without any Web Audio dependency. The browser
 * wrapper lives in analyse-client.ts.
 *
 * Loudness follows ITU-R BS.1770-4 (K-weighting, 400 ms gated blocks) and
 * EBU R128/Tech 3342 (loudness range). True peak uses 4x oversampling with
 * a windowed-sinc interpolator. These are faithful implementations rather
 * than approximations, but single-precision maths means values can differ
 * from reference meters by ~0.1 LU — fine for finishing notes, not for
 * broadcast compliance certification.
 */

export interface DspAnalysis {
  integrated_lufs: number
  true_peak_dbfs: number
  loudness_range_lu: number
  dynamic_range_db: number
  crest_factor_db: number
  rms_db: number
  stereo_width: number
  mid_side_ratio: number
  correlation: number
  dc_offset: number
  silence_ratio: number
  sample_rate: number
  channels: number
  duration_seconds: number
  spectral_centroid_hz: number
  spectral_rolloff_hz: number
}

const MIN_DB = -120

function amplitudeToDb(value: number): number {
  if (value <= 0) return MIN_DB
  return 20 * Math.log10(value)
}

function energyToLufs(energy: number): number {
  if (energy <= 0) return MIN_DB
  return -0.691 + 10 * Math.log10(energy)
}

// ---------------------------------------------------------------------------
// K-weighting (ITU-R BS.1770-4) — two biquad stages with coefficients
// designed for the actual sample rate using the published analogue
// prototypes and bilinear transform (per the pyloudnorm/BS.1770 method).
// ---------------------------------------------------------------------------

interface Biquad {
  b0: number
  b1: number
  b2: number
  a1: number
  a2: number
}

/** High-shelf stage (head-related response). */
function designShelf(sampleRate: number): Biquad {
  const db = 3.999843853973347
  const f0 = 1681.974450955533
  const Q = 0.7071752369554196
  const K = Math.tan((Math.PI * f0) / sampleRate)
  const Vh = Math.pow(10, db / 20)
  const Vb = Math.pow(Vh, 0.4996667741545416)
  const denominator = 1 + K / Q + K * K
  return {
    b0: (Vh + (Vb * K) / Q + K * K) / denominator,
    b1: (2 * (K * K - Vh)) / denominator,
    b2: (Vh - (Vb * K) / Q + K * K) / denominator,
    a1: (2 * (K * K - 1)) / denominator,
    a2: (1 - K / Q + K * K) / denominator,
  }
}

/** High-pass stage (revised low-frequency B-curve). */
function designHighpass(sampleRate: number): Biquad {
  const f0 = 38.13547087602444
  const Q = 0.5003270373238773
  const K = Math.tan((Math.PI * f0) / sampleRate)
  const denominator = 1 + K / Q + K * K
  return {
    b0: 1 / denominator,
    b1: -2 / denominator,
    b2: 1 / denominator,
    a1: (2 * (K * K - 1)) / denominator,
    a2: (1 - K / Q + K * K) / denominator,
  }
}

function applyBiquad(input: Float32Array, coeffs: Biquad): Float32Array {
  const output = new Float32Array(input.length)
  let x1 = 0
  let x2 = 0
  let y1 = 0
  let y2 = 0
  for (let i = 0; i < input.length; i++) {
    const x0 = input[i]
    const y0 = coeffs.b0 * x0 + coeffs.b1 * x1 + coeffs.b2 * x2 - coeffs.a1 * y1 - coeffs.a2 * y2
    x2 = x1
    x1 = x0
    y2 = y1
    y1 = y0
    output[i] = y0
  }
  return output
}

function kWeight(channel: Float32Array, sampleRate: number): Float32Array {
  return applyBiquad(applyBiquad(channel, designShelf(sampleRate)), designHighpass(sampleRate))
}

// ---------------------------------------------------------------------------
// Gated loudness (BS.1770-4 §4) and loudness range (EBU Tech 3342)
// ---------------------------------------------------------------------------

function blockLoudnesses(
  weighted: Float32Array[],
  sampleRate: number,
  blockSeconds: number,
  hopSeconds: number
): number[] {
  const blockSize = Math.round(blockSeconds * sampleRate)
  const hopSize = Math.round(hopSeconds * sampleRate)
  const length = weighted[0].length
  if (length < blockSize) {
    // Single short block — measure what we have
    let energy = 0
    for (const channel of weighted) {
      let sum = 0
      for (let i = 0; i < length; i++) sum += channel[i] * channel[i]
      energy += sum / Math.max(length, 1)
    }
    return [energyToLufs(energy)]
  }

  const loudnesses: number[] = []
  for (let start = 0; start + blockSize <= length; start += hopSize) {
    let energy = 0
    for (const channel of weighted) {
      let sum = 0
      const end = start + blockSize
      for (let i = start; i < end; i++) sum += channel[i] * channel[i]
      energy += sum / blockSize
    }
    loudnesses.push(energyToLufs(energy))
  }
  return loudnesses
}

function meanEnergyOfBlocks(blocks: number[]): number {
  if (blocks.length === 0) return 0
  let total = 0
  for (const lufs of blocks) {
    total += Math.pow(10, (lufs + 0.691) / 10)
  }
  return total / blocks.length
}

export function integratedLoudness(weighted: Float32Array[], sampleRate: number): number {
  // 400 ms blocks, 75% overlap
  const blocks = blockLoudnesses(weighted, sampleRate, 0.4, 0.1)
  // Absolute gate at -70 LUFS
  const absGated = blocks.filter((l) => l > -70)
  if (absGated.length === 0) return MIN_DB
  // Relative gate 10 LU below the abs-gated mean
  const relThreshold = energyToLufs(meanEnergyOfBlocks(absGated)) - 10
  const relGated = absGated.filter((l) => l > relThreshold)
  if (relGated.length === 0) return MIN_DB
  return energyToLufs(meanEnergyOfBlocks(relGated))
}

export function loudnessRange(weighted: Float32Array[], sampleRate: number): number {
  // Short-term loudness: 3 s blocks, 1 s hop (Tech 3342 uses 100% overlap
  // steps of 1s minimum; 1 s hop is standard practice)
  const blocks = blockLoudnesses(weighted, sampleRate, 3, 1)
  const absGated = blocks.filter((l) => l > -70)
  if (absGated.length < 2) return 0
  const relThreshold = energyToLufs(meanEnergyOfBlocks(absGated)) - 20
  const gated = absGated.filter((l) => l > relThreshold).sort((a, b) => a - b)
  if (gated.length < 2) return 0
  const low = gated[Math.floor(0.1 * (gated.length - 1))]
  const high = gated[Math.floor(0.95 * (gated.length - 1))]
  return Math.max(0, high - low)
}

// ---------------------------------------------------------------------------
// True peak (BS.1770-4 Annex 2) — 4x oversampling, windowed-sinc phases
// ---------------------------------------------------------------------------

const OVERSAMPLE = 4
const TAPS_PER_PHASE = 12

function interpolatorPhases(): number[][] {
  const phases: number[][] = []
  const total = OVERSAMPLE * TAPS_PER_PHASE
  for (let phase = 1; phase < OVERSAMPLE; phase++) {
    const coeffs: number[] = []
    for (let tap = 0; tap < TAPS_PER_PHASE; tap++) {
      const n = tap * OVERSAMPLE + phase
      const x = n / OVERSAMPLE - TAPS_PER_PHASE / 2
      const sinc = x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x)
      // Hann window over the full filter length
      const window = 0.5 * (1 - Math.cos((2 * Math.PI * n) / total))
      coeffs.push(sinc * window)
    }
    phases.push(coeffs)
  }
  return phases
}

export function truePeakDb(channels: Float32Array[]): number {
  const phases = interpolatorPhases()
  let peak = 0
  for (const channel of channels) {
    for (let i = 0; i < channel.length; i++) {
      const sample = Math.abs(channel[i])
      if (sample > peak) peak = sample
    }
    // Inter-sample peaks
    for (let i = 0; i < channel.length - TAPS_PER_PHASE; i++) {
      for (const coeffs of phases) {
        let value = 0
        for (let tap = 0; tap < TAPS_PER_PHASE; tap++) {
          value += channel[i + tap] * coeffs[tap]
        }
        const magnitude = Math.abs(value)
        if (magnitude > peak) peak = magnitude
      }
    }
  }
  return amplitudeToDb(peak)
}

// ---------------------------------------------------------------------------
// Level, stereo and shape metrics
// ---------------------------------------------------------------------------

export function rmsDb(channels: Float32Array[]): number {
  let energy = 0
  let count = 0
  for (const channel of channels) {
    for (let i = 0; i < channel.length; i++) {
      energy += channel[i] * channel[i]
    }
    count += channel.length
  }
  if (count === 0) return MIN_DB
  return amplitudeToDb(Math.sqrt(energy / count))
}

export function samplePeakDb(channels: Float32Array[]): number {
  let peak = 0
  for (const channel of channels) {
    for (let i = 0; i < channel.length; i++) {
      const sample = Math.abs(channel[i])
      if (sample > peak) peak = sample
    }
  }
  return amplitudeToDb(peak)
}

export function dcOffset(channels: Float32Array[]): number {
  let sum = 0
  let count = 0
  for (const channel of channels) {
    for (let i = 0; i < channel.length; i++) sum += channel[i]
    count += channel.length
  }
  return count === 0 ? 0 : sum / count
}

export function silenceRatio(channels: Float32Array[], thresholdDb = -60): number {
  const threshold = Math.pow(10, thresholdDb / 20)
  const length = channels[0]?.length ?? 0
  if (length === 0) return 1
  let silent = 0
  for (let i = 0; i < length; i++) {
    let maxAbs = 0
    for (const channel of channels) {
      const sample = Math.abs(channel[i])
      if (sample > maxAbs) maxAbs = sample
    }
    if (maxAbs < threshold) silent++
  }
  return silent / length
}

export interface StereoMetrics {
  stereo_width: number
  mid_side_ratio: number
  correlation: number
}

export function stereoMetrics(left: Float32Array, right: Float32Array): StereoMetrics {
  let midEnergy = 0
  let sideEnergy = 0
  let sumL = 0
  let sumR = 0
  let sumLL = 0
  let sumRR = 0
  let sumLR = 0
  const length = Math.min(left.length, right.length)
  for (let i = 0; i < length; i++) {
    const l = left[i]
    const r = right[i]
    const mid = (l + r) / 2
    const side = (l - r) / 2
    midEnergy += mid * mid
    sideEnergy += side * side
    sumL += l
    sumR += r
    sumLL += l * l
    sumRR += r * r
    sumLR += l * r
  }
  const total = midEnergy + sideEnergy
  const width = total > 0 ? sideEnergy / total : 0
  const ratio = sideEnergy > 0 ? midEnergy / sideEnergy : Number.POSITIVE_INFINITY

  const n = length || 1
  const covariance = sumLR / n - (sumL / n) * (sumR / n)
  const varL = sumLL / n - (sumL / n) ** 2
  const varR = sumRR / n - (sumR / n) ** 2
  const denominator = Math.sqrt(Math.max(varL, 0) * Math.max(varR, 0))
  const correlation = denominator > 0 ? covariance / denominator : 1

  return {
    stereo_width: width,
    mid_side_ratio: Number.isFinite(ratio) ? ratio : 1000,
    correlation: Math.max(-1, Math.min(1, correlation)),
  }
}

/**
 * Dynamic range as the spread of short-term RMS (95th minus 10th percentile
 * over 1 s windows) — an indicative "how much does the level move" figure,
 * not the PMF/EBU "DR" measurement.
 */
export function dynamicRangeDb(channels: Float32Array[], sampleRate: number): number {
  const windowSize = Math.max(1, Math.round(sampleRate))
  const length = channels[0]?.length ?? 0
  if (length < windowSize * 2) return 0
  const values: number[] = []
  for (let start = 0; start + windowSize <= length; start += windowSize) {
    let energy = 0
    for (const channel of channels) {
      for (let i = start; i < start + windowSize; i++) energy += channel[i] * channel[i]
    }
    const rms = Math.sqrt(energy / (windowSize * channels.length))
    const db = amplitudeToDb(rms)
    if (db > -70) values.push(db)
  }
  if (values.length < 2) return 0
  values.sort((a, b) => a - b)
  const low = values[Math.floor(0.1 * (values.length - 1))]
  const high = values[Math.floor(0.95 * (values.length - 1))]
  return Math.max(0, high - low)
}

// ---------------------------------------------------------------------------
// Spectral metrics — iterative radix-2 FFT over sampled Hann windows
// ---------------------------------------------------------------------------

function fftMagnitudes(frame: Float32Array): Float32Array {
  const n = frame.length
  const real = new Float32Array(frame)
  const imag = new Float32Array(n)

  // Bit-reversal permutation
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      const tmp = real[i]
      real[i] = real[j]
      real[j] = tmp
    }
  }

  for (let size = 2; size <= n; size <<= 1) {
    const angle = (-2 * Math.PI) / size
    const wReal = Math.cos(angle)
    const wImag = Math.sin(angle)
    for (let start = 0; start < n; start += size) {
      let curReal = 1
      let curImag = 0
      for (let k = 0; k < size / 2; k++) {
        const evenIndex = start + k
        const oddIndex = start + k + size / 2
        const tReal = real[oddIndex] * curReal - imag[oddIndex] * curImag
        const tImag = real[oddIndex] * curImag + imag[oddIndex] * curReal
        real[oddIndex] = real[evenIndex] - tReal
        imag[oddIndex] = imag[evenIndex] - tImag
        real[evenIndex] += tReal
        imag[evenIndex] += tImag
        const nextReal = curReal * wReal - curImag * wImag
        curImag = curReal * wImag + curImag * wReal
        curReal = nextReal
      }
    }
  }

  const magnitudes = new Float32Array(n / 2)
  for (let i = 0; i < n / 2; i++) {
    magnitudes[i] = Math.hypot(real[i], imag[i])
  }
  return magnitudes
}

export interface SpectralMetrics {
  spectral_centroid_hz: number
  spectral_rolloff_hz: number
}

export function spectralMetrics(
  channels: Float32Array[],
  sampleRate: number,
  fftSize = 2048,
  maxFrames = 64
): SpectralMetrics {
  const length = channels[0]?.length ?? 0
  if (length < fftSize) return { spectral_centroid_hz: 0, spectral_rolloff_hz: 0 }

  // Mono mix
  const frameCount = Math.min(maxFrames, Math.floor(length / fftSize))
  const stride = Math.floor((length - fftSize) / Math.max(frameCount - 1, 1))
  const binHz = sampleRate / fftSize

  let centroidWeighted = 0
  let centroidTotal = 0
  const rolloffs: number[] = []
  const frame = new Float32Array(fftSize)

  for (let f = 0; f < frameCount; f++) {
    const start = f * stride
    for (let i = 0; i < fftSize; i++) {
      let sample = 0
      for (const channel of channels) sample += channel[start + i]
      sample /= channels.length
      // Hann window
      const window = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)))
      frame[i] = sample * window
    }

    const magnitudes = fftMagnitudes(frame)
    let frameEnergy = 0
    let frameWeighted = 0
    for (let bin = 1; bin < magnitudes.length; bin++) {
      const power = magnitudes[bin] * magnitudes[bin]
      frameEnergy += power
      frameWeighted += power * bin * binHz
    }
    if (frameEnergy > 0) {
      centroidWeighted += frameWeighted
      centroidTotal += frameEnergy

      // 85% rolloff for this frame
      const target = frameEnergy * 0.85
      let cumulative = 0
      for (let bin = 1; bin < magnitudes.length; bin++) {
        cumulative += magnitudes[bin] * magnitudes[bin]
        if (cumulative >= target) {
          rolloffs.push(bin * binHz)
          break
        }
      }
    }
  }

  const centroid = centroidTotal > 0 ? centroidWeighted / centroidTotal : 0
  const rolloff =
    rolloffs.length > 0 ? rolloffs.reduce((sum, value) => sum + value, 0) / rolloffs.length : 0
  return { spectral_centroid_hz: centroid, spectral_rolloff_hz: rolloff }
}

// ---------------------------------------------------------------------------
// Top-level analysis
// ---------------------------------------------------------------------------

export function analyseChannels(channels: Float32Array[], sampleRate: number): DspAnalysis {
  if (channels.length === 0 || channels[0].length === 0) {
    throw new Error('No audio data to analyse')
  }

  const weighted = channels.map((channel) => kWeight(channel, sampleRate))
  const lufs = integratedLoudness(weighted, sampleRate)
  const lra = loudnessRange(weighted, sampleRate)
  const truePeak = truePeakDb(channels)
  const rms = rmsDb(channels)
  const samplePeak = samplePeakDb(channels)
  const stereo =
    channels.length >= 2
      ? stereoMetrics(channels[0], channels[1])
      : { stereo_width: 0, mid_side_ratio: 1000, correlation: 1 }
  const spectral = spectralMetrics(channels, sampleRate)

  return {
    integrated_lufs: round(lufs, 2),
    true_peak_dbfs: round(truePeak, 2),
    loudness_range_lu: round(lra, 2),
    dynamic_range_db: round(dynamicRangeDb(channels, sampleRate), 2),
    crest_factor_db: round(samplePeak - rms, 2),
    rms_db: round(rms, 2),
    stereo_width: round(stereo.stereo_width, 4),
    mid_side_ratio: round(stereo.mid_side_ratio, 3),
    correlation: round(stereo.correlation, 4),
    dc_offset: round(dcOffset(channels), 6),
    silence_ratio: round(silenceRatio(channels), 4),
    sample_rate: sampleRate,
    channels: channels.length,
    duration_seconds: round(channels[0].length / sampleRate, 2),
    spectral_centroid_hz: round(spectral.spectral_centroid_hz, 1),
    spectral_rolloff_hz: round(spectral.spectral_rolloff_hz, 1),
  }
}

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}
