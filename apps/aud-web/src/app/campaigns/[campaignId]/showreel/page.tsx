'use client';

/**
 * Showreel Page
 * View and export campaign showreel as video
 */

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Film, Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ShowreelScriptEngine, ShowreelPlayer } from '@totalaud/showreel';
import type { ShowreelScript, ShowreelPlayerState } from '@totalaud/showreel';
import { renderShowreelWithAudio } from '@totalaud/render';
import type {
  ShowreelRenderOptions,
  RenderProgress,
} from '@totalaud/render';
import { ShowreelExportDialog } from '@/components/showreel/ShowreelExportDialog';

export default function ShowreelPage() {
  const params = useParams();
  const campaignId = params?.campaignId as string;

  const [script, setScript] = useState<ShowreelScript | null>(null);
  const [player, setPlayer] = useState<ShowreelPlayer | null>(null);
  const [playerState, setPlayerState] = useState<ShowreelPlayerState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [renderProgress, setRenderProgress] = useState<RenderProgress | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Initialize script and player
  useEffect(() => {
    // Generate script from campaign data
    // In a real app, this would fetch campaign data from Supabase
    const mockCampaign = {
      id: campaignId,
      title: 'Summer Tour 2024',
      goal: 'Reach 100k streams',
    };

    const generatedScript = ShowreelScriptEngine.generateScript(mockCampaign);
    setScript(generatedScript);

    const newPlayer = new ShowreelPlayer(generatedScript);
    setPlayer(newPlayer);

    // Subscribe to player updates
    const unsubscribe = newPlayer.subscribe((state) => {
      setPlayerState(state);
      if (state.isComplete) {
        setIsPlaying(false);
      }
    });

    return () => {
      unsubscribe();
      newPlayer.destroy();
    };
  }, [campaignId]);

  const handlePlay = () => {
    if (!player) return;
    player.start();
    setIsPlaying(true);
  };

  const handlePause = () => {
    if (!player) return;
    player.pause();
    setIsPlaying(false);
  };

  const handleReset = () => {
    if (!player) return;
    player.reset();
    setIsPlaying(false);
  };

  const handleExport = async (
    options: ShowreelRenderOptions,
    onProgress: (progress: number, estimatedSeconds?: number) => void
  ) => {
    if (!script) throw new Error('No script available');

    const result = await renderShowreelWithAudio(
      {
        campaignId,
        script,
        options,
      },
      (progress) => {
        setRenderProgress(progress);
        onProgress(
          progress.progress,
          progress.estimatedSecondsRemaining
        );
      }
    );

    // Create download URL
    const url = URL.createObjectURL(result.blob);
    setDownloadUrl(url);

    // Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    return {
      blob: result.blob,
      fileSize: result.blob.size,
      downloadUrl: url,
    };
  };

  if (!script || !playerState) {
    return (
      <div className="flex min-h-screen items-centre justify-centre bg-[#0F1113]">
        <div className="text-slate-400">Loading showreel...</div>
      </div>
    );
  }

  const currentScene = player?.getCurrentScene();
  const progress = script.totalDurationSeconds > 0
    ? playerState.totalElapsedSeconds / script.totalDurationSeconds
    : 0;

  return (
    <div className="min-h-screen bg-[#0F1113] text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-centre justify-between">
          <div className="flex items-centre gap-4">
            <Link
              href={`/campaigns/${campaignId}`}
              className="rounded p-2 text-slate-400 transition-colours hover:bg-slate-800 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold">{script.title}</h1>
              <p className="text-sm text-slate-400">
                {script.scenes.length} scenes • {Math.round(script.totalDurationSeconds)}s
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExportDialogOpen(true)}
            className="flex items-centre gap-2 rounded border border-[#3AA9BE] bg-transparent px-4 py-2 text-sm font-medium text-[#3AA9BE] transition-colours hover:bg-[#3AA9BE] hover:text-white"
          >
            <Film className="h-4 w-4" />
            Export as video
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Preview area */}
        <div className="mb-8 rounded-lg border border-slate-800 bg-slate-900/30 p-8">
          <div className="mb-4 text-centre">
            {currentScene && (
              <>
                <h2 className="text-2xl font-bold">{currentScene.title}</h2>
                {currentScene.subtitle && (
                  <p className="mt-2 text-lg text-slate-400">{currentScene.subtitle}</p>
                )}
              </>
            )}
          </div>

          {/* Scene info */}
          <div className="mb-6 text-centre">
            <div className="text-sm text-slate-500">
              Scene {playerState.currentSceneIndex + 1} of {script.scenes.length}
            </div>
          </div>

          {/* Caption */}
          {playerState.currentCaption && (
            <div className="mb-6 text-centre">
              <p className="text-lg text-slate-300">{playerState.currentCaption}</p>
            </div>
          )}

          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-1 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-[#3AA9BE] transition-all duration-100"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>{Math.round(playerState.totalElapsedSeconds)}s</span>
              <span>{Math.round(script.totalDurationSeconds)}s</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-centre justify-centre gap-4">
            <button
              onClick={handleReset}
              className="rounded p-2 text-slate-400 transition-colours hover:bg-slate-800 hover:text-white"
              title="Reset"
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            {!isPlaying ? (
              <button
                onClick={handlePlay}
                className="rounded-full bg-[#3AA9BE] p-4 text-white transition-colours hover:bg-[#3AA9BE]/90"
                title="Play"
              >
                <Play className="h-6 w-6" />
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="rounded-full bg-[#3AA9BE] p-4 text-white transition-colours hover:bg-[#3AA9BE]/90"
                title="Pause"
              >
                <Pause className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {/* Scene list */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-6">
          <h3 className="mb-4 text-lg font-semibold">Scenes</h3>
          <div className="space-y-2">
            {script.scenes.map((scene, index) => (
              <button
                key={scene.id}
                onClick={() => player?.seekToScene(index)}
                className={`w-full rounded border p-4 text-left transition-colours ${
                  index === playerState.currentSceneIndex
                    ? 'border-[#3AA9BE] bg-[#3AA9BE]/10'
                    : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{scene.title}</div>
                    {scene.subtitle && (
                      <div className="mt-1 text-sm text-slate-400">{scene.subtitle}</div>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">
                    {scene.durationSeconds}s
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Export dialog */}
      <ShowreelExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={handleExport}
        estimatedDurationSeconds={script.totalDurationSeconds}
      />
    </div>
  );
}
