/**
 * AnalysisPanel
 *
 * Displays audio analysis metrics in a calm, readable grid.
 * Grouped by category: loudness, dynamics, stereo, spectral.
 */

'use client'

import { motion } from 'framer-motion'
import type { AnalysisResult } from '@/lib/finisher-client'

interface MetricProps {
  label: string
  value: string
  unit?: string
  status?: 'good' | 'warning' | 'critical' | 'neutral'
}

function Metric({ label, value, unit, status = 'neutral' }: MetricProps) {
  const statusColour = {
    good: 'text-ta-success',
    warning: 'text-ta-warning',
    critical: 'text-ta-error',
    neutral: 'text-ta-white/90',
  }[status]

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-ta-white/40">{label}</span>
      <span className={`text-sm font-mono font-medium ${statusColour}`}>
        {value}
        {unit && <span className="text-ta-white/40 ml-0.5">{unit}</span>}
      </span>
    </div>
  )
}

function MetricGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-ta-white/50 border-b border-ta-white/[0.06] pb-1.5">
        {title}
      </h4>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

function lufsStatus(lufs: number): 'good' | 'warning' | 'critical' {
  if (lufs >= -16 && lufs <= -12) return 'good'
  if (lufs >= -20 && lufs <= -10) return 'warning'
  return 'critical'
}

function peakStatus(peak: number): 'good' | 'warning' | 'critical' {
  if (peak <= -1.0) return 'good'
  if (peak <= 0) return 'warning'
  return 'critical'
}

interface AnalysisPanelProps {
  analysis: AnalysisResult
}

export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="space-y-5"
    >
      {/* QC Status */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-ta-sm text-xs font-medium ${
          analysis.qc_passed
            ? 'bg-ta-success/10 text-ta-success'
            : 'bg-ta-warning/10 text-ta-warning'
        }`}
      >
        <span>{analysis.qc_passed ? 'QC Passed' : 'QC Issues Detected'}</span>
        {analysis.qc_warnings.length > 0 && (
          <span className="text-ta-white/40">
            -- {analysis.qc_warnings.length} warning{analysis.qc_warnings.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <MetricGroup title="Loudness">
        <Metric
          label="Integrated LUFS"
          value={analysis.integrated_lufs.toFixed(1)}
          unit="LUFS"
          status={lufsStatus(analysis.integrated_lufs)}
        />
        <Metric
          label="True Peak"
          value={analysis.true_peak_dbfs.toFixed(1)}
          unit="dBFS"
          status={peakStatus(analysis.true_peak_dbfs)}
        />
        <Metric label="Loudness Range" value={analysis.loudness_range_lu.toFixed(1)} unit="LU" />
        <Metric label="RMS" value={analysis.rms_db.toFixed(1)} unit="dB" />
      </MetricGroup>

      <MetricGroup title="Dynamics">
        <Metric label="Dynamic Range" value={analysis.dynamic_range_db.toFixed(1)} unit="dB" />
        <Metric label="Crest Factor" value={analysis.crest_factor_db.toFixed(1)} unit="dB" />
      </MetricGroup>

      <MetricGroup title="Stereo">
        <Metric label="Width" value={(analysis.stereo_width * 100).toFixed(0)} unit="%" />
        <Metric label="M/S Ratio" value={analysis.mid_side_ratio.toFixed(2)} />
        <Metric
          label="Correlation"
          value={analysis.correlation.toFixed(2)}
          status={
            analysis.correlation < 0 ? 'critical' : analysis.correlation < 0.3 ? 'warning' : 'good'
          }
        />
      </MetricGroup>

      <MetricGroup title="Spectral">
        <Metric label="Centroid" value={analysis.spectral_centroid_hz.toFixed(0)} unit="Hz" />
        <Metric
          label="Rolloff"
          value={(analysis.spectral_rolloff_hz / 1000).toFixed(1)}
          unit="kHz"
        />
      </MetricGroup>

      <MetricGroup title="File">
        <Metric label="Duration" value={formatDuration(analysis.duration_seconds)} />
        <Metric label="Sample Rate" value={(analysis.sample_rate / 1000).toFixed(1)} unit="kHz" />
      </MetricGroup>
    </motion.div>
  )
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
