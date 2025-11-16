'use client';

/**
 * ShowreelExportDialog
 * Modal for configuring and exporting showreel as video
 */

import { useState } from 'react';
import {
  RENDER_PRESETS,
  type RenderPresetId,
  type ShowreelRenderOptions,
} from '@totalaud/render';
import { Film, Download, X, Loader2 } from 'lucide-react';

interface ShowreelExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (
    options: ShowreelRenderOptions,
    onProgress: (progress: number, estimatedSeconds?: number) => void
  ) => Promise<{ blob: Blob; fileSize: number; downloadUrl: string }>;
  estimatedDurationSeconds: number;
}

export function ShowreelExportDialog({
  isOpen,
  onClose,
  onExport,
  estimatedDurationSeconds,
}: ShowreelExportDialogProps) {
  const [preset, setPreset] = useState<RenderPresetId>('showreel-720p-30');
  const [includeCaptions, setIncludeCaptions] = useState(true);
  const [includeHud, setIncludeHud] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [estimatedSecondsRemaining, setEstimatedSecondsRemaining] = useState<
    number | null
  >(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setDownloadUrl(null);
    setFileSize(null);

    try {
      const result = await onExport(
        {
          preset,
          includeCaptions,
          includeHud,
        },
        (prog, estSeconds) => {
          setProgress(prog);
          setEstimatedSecondsRemaining(estSeconds ?? null);
        }
      );

      setDownloadUrl(result.downloadUrl);
      setFileSize(result.fileSize);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      onClose();
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-centre justify-centre bg-black/80">
      <div className="relative w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-centre justify-between">
          <div className="flex items-centre gap-2">
            <Film className="h-5 w-5 text-[#3AA9BE]" />
            <h2 className="text-xl font-semibold text-white">Export as video</h2>
          </div>
          {!isExporting && (
            <button
              onClick={handleClose}
              className="rounded p-1 text-slate-400 transition-colours hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        {!downloadUrl ? (
          <div className="space-y-6">
            {/* Preset selector */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Quality preset
              </label>
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value as RenderPresetId)}
                disabled={isExporting}
                className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-[#3AA9BE] focus:outline-none disabled:opacity-50"
              >
                {RENDER_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <label className="flex items-centre gap-3">
                <input
                  type="checkbox"
                  checked={includeCaptions}
                  onChange={(e) => setIncludeCaptions(e.target.checked)}
                  disabled={isExporting}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-[#3AA9BE] focus:ring-[#3AA9BE] disabled:opacity-50"
                />
                <span className="text-sm text-slate-300">Include captions</span>
              </label>

              <label className="flex items-centre gap-3">
                <input
                  type="checkbox"
                  checked={includeHud}
                  onChange={(e) => setIncludeHud(e.target.checked)}
                  disabled={isExporting}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-[#3AA9BE] focus:ring-[#3AA9BE] disabled:opacity-50"
                />
                <span className="text-sm text-slate-300">Include HUD elements</span>
              </label>
            </div>

            {/* Info */}
            <div className="rounded border border-slate-700 bg-slate-800/50 p-4">
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>Estimated duration:</span>
                  <span className="font-medium text-slate-300">
                    {formatDuration(estimatedDurationSeconds)}
                  </span>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Export runs in your browser and may take up to the length of the
                  showreel.
                </div>
              </div>
            </div>

            {/* Progress */}
            {isExporting && (
              <div className="space-y-2">
                <div className="flex items-centre justify-between text-sm">
                  <span className="text-slate-300">
                    Rendering {Math.round(progress * 100)}%
                  </span>
                  {estimatedSecondsRemaining !== null && (
                    <span className="text-slate-400">
                      ~{Math.ceil(estimatedSecondsRemaining)}s remaining
                    </span>
                  )}
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-[#3AA9BE] transition-all duration-300"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isExporting}
                className="flex-1 rounded border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colours hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 rounded bg-[#3AA9BE] px-4 py-2 text-sm font-medium text-white transition-colours hover:bg-[#3AA9BE]/90 disabled:opacity-50"
              >
                {isExporting ? (
                  <span className="flex items-centre justify-centre gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </span>
                ) : (
                  'Export video'
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Download ready */
          <div className="space-y-6">
            <div className="rounded border border-green-700/50 bg-green-900/20 p-4 text-centre">
              <div className="mb-2 text-lg font-medium text-green-400">
                Export complete!
              </div>
              {fileSize && (
                <div className="text-sm text-green-300">
                  File size: {formatFileSize(fileSize)}
                </div>
              )}
            </div>

            <a
              href={downloadUrl}
              download
              className="flex items-centre justify-centre gap-2 rounded bg-[#3AA9BE] px-4 py-3 text-sm font-medium text-white transition-colours hover:bg-[#3AA9BE]/90"
            >
              <Download className="h-4 w-4" />
              Download WebM
            </a>

            <button
              onClick={handleClose}
              className="w-full rounded border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colours hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
