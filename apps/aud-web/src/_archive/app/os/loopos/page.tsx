'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  LoopOSContainer,
  LoopOSToolbar,
  LoopOSTimeline,
  LoopOSInspector,
  LoopOSMomentumBar,
  LoopOSMiniMap,
  LoopSelector,
  useLoopOSLocalStore,
} from '@/components/os/loopos'
import { consumeOSBridges } from '@/components/os/navigation/OSBridges'
import {
  DEFAULT_TIMELINE_UNITS,
  BASE_UNIT_WIDTH,
} from '@/components/os/loopos/engines/timelineMath'
import type { Database } from '@total-audio/schemas-database'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useOptionalDemo } from '@/components/demo/DemoOrchestrator'
import { registerLoopOSController } from '@/components/demo/director/DirectorEngine'
import { useOptionalMood } from '@/components/mood/useMood'
import { useProjectEngine } from '@/components/projects/useProjectEngine'
import { useProjectLoopPrefs } from '@/components/projects/useProjectLoopPrefs'

export default function LoopOSPage() {
  const demo = useOptionalDemo()
  const isDemoMode =
    demo?.isDemoMode || (typeof window !== 'undefined' && (window as any).__TA_DEMO__ === true)

  const {
    activeLoopId,
    availableLoops,
    tracks,
    clips,
    sequencedClips,
    selectedClipId,
    playhead,
    isPlaying,
    bpm,
    zoom,
    momentum,
    nextActionClips,
    validationWarnings,
    addClip,
    updateClip,
    deleteClip,
    setSelectedClipId,
    toggleLoopOSReady,
    setBpm,
    setPlayhead,
    startPlayback,
    stopPlayback,
    engineTick,
    setZoom,
    clearValidationWarnings,
    consumeIncoming,
    loadFromPersisted,
    upsertPersistedLoopMeta,
    aiSuggestions,
    setAISuggestions,
    clearAISuggestions,
    applyAISuggestionClip,
    applyAllAISuggestions,
    markSaving,
    markSaved,
    pendingSaves,
    initialiseDemoLoopIfNeeded,
    setAvailableLoops,
    setActiveLoopId,
    createLoopLocally,
    removeLoopLocally,
    renameLoopLocally,
  } = useLoopOSLocalStore()

  const [showGrid, setShowGrid] = useState(true)
  const [viewportStartUnits, setViewportStartUnits] = useState(0)
  const [viewportUnits, setViewportUnits] = useState(16)
  const [loopId, setLoopId] = useState<string | null>(null)

  const saveTimeoutRef = useRef<number | null>(null)

  const supabase = useMemo(() => createClientComponentClient<Database>(), [])
  const mood = useOptionalMood()
  const { currentProject } = useProjectEngine()
  const { getLastLoopId, setLastLoopId, clearLoopId } = useProjectLoopPrefs()

  useEffect(() => {
    if (isDemoMode) {
      return
    }

    let isMounted = true

    async function bootstrapLoop() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.warn('[LoopOS] failed to get session', sessionError)
          return
        }

        const userId = session?.user?.id
        if (!userId) {
          console.warn('[LoopOS] no authenticated user, skipping persistence')
          return
        }

        const { data: existingLoops, error: loopsError } = await supabase
          .from('loopos_loops')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })

        if (loopsError) {
          console.warn('[LoopOS] failed to load loops', loopsError)
          return
        }

        const mappedLoops =
          existingLoops?.map((existing) => ({
            id: existing.id,
            name: existing.name,
            createdAt: existing.created_at,
          })) ?? []

        setAvailableLoops(mappedLoops)

        let loop =
          (activeLoopId && existingLoops?.find((candidate) => candidate.id === activeLoopId)) ??
          existingLoops?.[0] ??
          null

        if (!loop) {
          const { data: inserted, error: insertError } = await supabase
            .from('loopos_loops')
            .insert({
              user_id: userId,
              name: 'My Loop',
            })
            .select('*')
            .single()

          if (insertError) {
            console.warn('[LoopOS] failed to create default loop', insertError)
            return
          }

          loop = inserted

          setAvailableLoops([
            ...mappedLoops,
            {
              id: inserted.id,
              name: inserted.name,
              createdAt: inserted.created_at,
            },
          ])
        }

        if (!isMounted || !loop) return

        setLoopId(loop.id)
        setActiveLoopId(loop.id)

        const { data: clips, error: clipsError } = await supabase
          .from('loopos_clips')
          .select('*')
          .eq('loop_id', loop.id)
          .order('start', { ascending: true })

        if (clipsError) {
          console.warn('[LoopOS] failed to load loop clips', clipsError)
          loadFromPersisted({
            loop: {
              id: loop.id,
              userId: loop.user_id,
              name: loop.name,
              bpm: loop.bpm,
              zoom: loop.zoom,
            },
            clips: [],
          })
          return
        }

        loadFromPersisted({
          loop: {
            id: loop.id,
            userId: loop.user_id,
            name: loop.name,
            bpm: loop.bpm,
            zoom: loop.zoom,
          },
          clips: clips ?? [],
        })
      } catch (error) {
        console.warn('[LoopOS] bootstrap failed', error)
      }
    }

    bootstrapLoop()

    return () => {
      isMounted = false
      if (saveTimeoutRef.current != null) {
        window.clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [activeLoopId, isDemoMode, loadFromPersisted, setActiveLoopId, setAvailableLoops, supabase])

  useEffect(() => {
    if (!mood) return
    mood.setLoopMomentum(momentum?.score ?? 0)
  }, [mood, momentum?.score])

  useEffect(() => {
    const payloads = consumeOSBridges('loopos')
    if (!payloads.length) return
    consumeIncoming(payloads)
  }, [consumeIncoming])

  useEffect(() => {
    if (!loopId || isDemoMode) return

    if (saveTimeoutRef.current != null) {
      window.clearTimeout(saveTimeoutRef.current)
    }

    markSaving()

    saveTimeoutRef.current = window.setTimeout(async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const userId = session?.user?.id
        if (!userId) {
          console.warn('[LoopOS] no authenticated user during save, skipping')
          markSaved()
          return
        }

        const loopUpdate = {
          bpm,
          zoom,
        }

        const { error: loopError } = await supabase
          .from('loopos_loops')
          .update(loopUpdate)
          .eq('id', loopId)
          .eq('user_id', userId)

        if (loopError) {
          console.warn('[LoopOS] failed to save loop meta', loopError)
        }

        const { data: existingClips, error: fetchError } = await supabase
          .from('loopos_clips')
          .select('id')
          .eq('loop_id', loopId)

        if (fetchError) {
          console.warn('[LoopOS] failed to fetch existing clips for sync', fetchError)
          markSaved()
          return
        }

        const existingIds = new Set((existingClips ?? []).map((clip) => clip.id))
        const localIds = new Set(clips.map((clip) => clip.id))

        const clipsToInsert = clips
          .filter((clip) => !existingIds.has(clip.id))
          .map((clip) => ({
            id: clip.id,
            loop_id: loopId,
            lane: clip.lane,
            start: clip.start,
            length: clip.length,
            name: clip.name,
            notes: clip.notes,
            loopos_ready: clip.loopOSReady,
          }))

        const clipsToUpdate = clips
          .filter((clip) => existingIds.has(clip.id))
          .map((clip) => ({
            id: clip.id,
            loop_id: loopId,
            lane: clip.lane,
            start: clip.start,
            length: clip.length,
            name: clip.name,
            notes: clip.notes,
            loopos_ready: clip.loopOSReady,
          }))

        const idsToDelete = Array.from(existingIds).filter((id) => !localIds.has(id))

        if (clipsToInsert.length > 0) {
          const { error: insertError } = await supabase.from('loopos_clips').insert(clipsToInsert)
          if (insertError) {
            console.warn('[LoopOS] failed to insert clips', insertError)
          }
        }

        for (const update of clipsToUpdate) {
          const { error: updateError } = await supabase
            .from('loopos_clips')
            .update(update)
            .eq('id', update.id)
            .eq('loop_id', loopId)

          if (updateError) {
            console.warn('[LoopOS] failed to update clip', updateError)
          }
        }

        if (idsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('loopos_clips')
            .delete()
            .in('id', idsToDelete)
            .eq('loop_id', loopId)

          if (deleteError) {
            console.warn('[LoopOS] failed to delete clips', deleteError)
          }
        }
      } catch (error) {
        console.warn('[LoopOS] save failed', error)
      } finally {
        markSaved()
      }
    }, 250)
  }, [bpm, clips, isDemoMode, loopId, markSaving, markSaved, supabase, zoom])

  const handleAddClip = () => {
    const visibleStart = viewportStartUnits
    const visibleEnd = viewportStartUnits + viewportUnits
    const lane = tracks[0] ?? 'creative'

    addClip(lane, {
      start: visibleStart + (visibleEnd - visibleStart) / 3,
    })
  }

  const handleClearSelection = () => {
    setSelectedClipId(null)
  }

  const handleScrollChange = (scrollLeft: number, viewportWidth: number) => {
    const scale = BASE_UNIT_WIDTH * zoom || 1
    const startUnits = scrollLeft / scale
    const visibleUnits = viewportWidth / scale

    setViewportStartUnits(startUnits)
    setViewportUnits(visibleUnits)
  }

  const handleScrubFromMiniMap = (targetUnit: number) => {
    const scale = BASE_UNIT_WIDTH * zoom || 1
    const startPx = Math.max(0, Math.min(DEFAULT_TIMELINE_UNITS * scale, targetUnit * scale))

    const container = document.querySelector<HTMLDivElement>(
      '[data-loopos-timeline-scroll-container="true"]'
    )

    if (container) {
      container.scrollTo({
        left: startPx,
        behavior: 'smooth',
      })
    }
  }

  const handleSeek = (position: number) => {
    setPlayhead(Math.max(0, Math.min(DEFAULT_TIMELINE_UNITS, position)))
  }

  useEffect(() => {
    if (!isDemoMode) return

    initialiseDemoLoopIfNeeded({
      bpm: 118,
      zoom: 1.1,
      clips: [
        {
          lane: 'creative',
          start: 0,
          length: 4,
          name: 'write lead single – midnight signals',
          notes:
            'Sketch the lead single for “Midnight Signals” – glitchy drums, glassy pads, late-night energy.',
          loopOSReady: true,
        },
        {
          lane: 'creative',
          start: 4,
          length: 4,
          name: 'record vocals – lana glass',
          notes:
            'Lock in the vocal takes and harmonies for the EP title track. Capture the “after midnight” feeling.',
          loopOSReady: false,
        },
        {
          lane: 'promo',
          start: 2,
          length: 4,
          name: 'send to key blogs',
          notes:
            'Shortlist key tastemaker blogs and newsletters that actually cover left-field electronic pop.',
          loopOSReady: false,
        },
        {
          lane: 'promo',
          start: 6,
          length: 4,
          name: 'tiktok teaser run',
          notes:
            'Cut a 15s hook teaser and run a small creator test – focus on people who already love glitchy club music.',
          loopOSReady: false,
        },
        {
          lane: 'analysis',
          start: 8,
          length: 4,
          name: 'check stats & refine pitch',
          notes:
            'Review early saves, completions, and press responses. Fold what’s working back into the Aqua pitch.',
          loopOSReady: false,
        },
      ],
    })
  }, [initialiseDemoLoopIfNeeded, isDemoMode])

  useEffect(() => {
    if (!isDemoMode) {
      registerLoopOSController(null)
      return
    }

    registerLoopOSController({
      playFor: (durationMs: number) => {
        startPlayback()
        window.setTimeout(() => {
          stopPlayback()
        }, durationMs)
      },
      stop: () => {
        stopPlayback()
      },
    })

    return () => {
      registerLoopOSController(null)
    }
  }, [isDemoMode, startPlayback, stopPlayback])

  const handleCreateLoop = async (name: string) => {
    if (isDemoMode) return
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
         
        console.warn('[LoopOS] failed to get session for createLoop', sessionError)
        return
      }

      const userId = session?.user?.id
      if (!userId) {
         
        console.warn('[LoopOS] no authenticated user during loop create, skipping')
        return
      }

      const { data: inserted, error: insertError } = await supabase
        .from('loopos_loops')
        .insert({
          user_id: userId,
          name,
        })
        .select('*')
        .single()

      if (insertError || !inserted) {
         
        console.warn('[LoopOS] failed to create loop', insertError)
        return
      }

      createLoopLocally({
        id: inserted.id,
        name: inserted.name,
        createdAt: inserted.created_at,
      })

      setLoopId(inserted.id)

      const { data: clips, error: clipsError } = await supabase
        .from('loopos_clips')
        .select('*')
        .eq('loop_id', inserted.id)
        .order('start', { ascending: true })

      if (clipsError) {
        loadFromPersisted({
          loop: {
            id: inserted.id,
            userId: inserted.user_id,
            name: inserted.name,
            bpm: inserted.bpm,
            zoom: inserted.zoom,
          },
          clips: [],
        })
        return
      }

      loadFromPersisted({
        loop: {
          id: inserted.id,
          userId: inserted.user_id,
          name: inserted.name,
          bpm: inserted.bpm,
          zoom: inserted.zoom,
        },
        clips: clips ?? [],
      })

      if (currentProject?.id) {
        setLastLoopId(currentProject.id, inserted.id)
      }
    } catch (error) {
       
      console.warn('[LoopOS] create loop failed', error)
    }
  }

  const handleSetActiveLoop = useCallback(
    async (id: string) => {
      if (isDemoMode) return
      if (!id) return

      try {
        const { data: loop, error: loopError } = await supabase
          .from('loopos_loops')
          .select('*')
          .eq('id', id)
          .single()

        if (loopError || !loop) {
           
          console.warn('[LoopOS] failed to load loop for switch', loopError)
          return
        }

        const { data: clips, error: clipsError } = await supabase
          .from('loopos_clips')
          .select('*')
          .eq('loop_id', loop.id)
          .order('start', { ascending: true })

        if (clipsError) {
           
          console.warn('[LoopOS] failed to load loop clips for switch', clipsError)
        }

        setLoopId(loop.id)
        loadFromPersisted({
          loop: {
            id: loop.id,
            userId: loop.user_id,
            name: loop.name,
            bpm: loop.bpm,
            zoom: loop.zoom,
          },
          clips: clips ?? [],
        })

        if (currentProject?.id) {
          setLastLoopId(currentProject.id, loop.id)
        }
      } catch (error) {
         
        console.warn('[LoopOS] switch loop failed', error)
      }
    },
    [currentProject?.id, isDemoMode, loadFromPersisted, setLastLoopId, supabase]
  )

  const handleRenameLoop = async (id: string, newName: string) => {
    if (isDemoMode) return
    const trimmed = newName.trim()
    if (!trimmed) return

    try {
      const { error } = await supabase.from('loopos_loops').update({ name: trimmed }).eq('id', id)

      if (error) {
         
        console.warn('[LoopOS] failed to rename loop', error)
        return
      }

      renameLoopLocally(id, trimmed)
    } catch (error) {
       
      console.warn('[LoopOS] rename loop failed', error)
    }
  }

  const handleDeleteLoop = (id: string) => {
    if (isDemoMode) return
    if (!id) return

    // Soft delete: update local state only, leave Supabase rows intact for now.
    removeLoopLocally(id)

    if (currentProject?.id) {
      clearLoopId(currentProject.id, id)
    }

    if (loopId === id) {
      setLoopId(null)
    }
  }

  useEffect(() => {
    if (isDemoMode) return
    if (!currentProject?.id) return
    if (!availableLoops.length) return

    const preferredId = getLastLoopId(currentProject.id)
    let targetId: string | null = null

    if (preferredId && availableLoops.some((loop) => loop.id === preferredId)) {
      targetId = preferredId
    } else if (activeLoopId && availableLoops.some((loop) => loop.id === activeLoopId)) {
      targetId = activeLoopId
    } else {
      targetId = availableLoops[0]?.id ?? null
    }

    if (!targetId || targetId === activeLoopId) return

    void handleSetActiveLoop(targetId)
  }, [
    activeLoopId,
    availableLoops,
    currentProject?.id,
    getLastLoopId,
    handleSetActiveLoop,
    isDemoMode,
  ])

  return (
    <LoopOSContainer>
      <LoopOSToolbar
        isPlaying={isPlaying}
        bpm={bpm}
        zoom={zoom}
        showGrid={showGrid}
        isSaving={pendingSaves > 0}
        onTogglePlay={isPlaying ? stopPlayback : startPlayback}
        onBpmChange={setBpm}
        onZoomChange={setZoom}
        onAddClip={handleAddClip}
        onClearSelection={handleClearSelection}
        onToggleGrid={() => setShowGrid((value) => !value)}
      />

      <div className="flex items-center justify-between gap-4 border-b border-slate-800/60 bg-black/40 px-4 py-2 text-[11px] text-slate-300">
        <LoopSelector
          onCreateLoop={handleCreateLoop}
          onRenameLoop={handleRenameLoop}
          onDeleteLoop={handleDeleteLoop}
          onSetActiveLoop={handleSetActiveLoop}
        />
        {availableLoops.length > 0 && (
          <span className="text-[10px] text-slate-500">
            {availableLoops.length} loop
            {availableLoops.length === 1 ? '' : 's'} in this account
          </span>
        )}
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-0 flex-1">
          <LoopOSTimeline
            tracks={tracks}
            clips={sequencedClips}
            selectedClipId={selectedClipId}
            playhead={playhead}
            isPlaying={isPlaying}
            zoom={zoom}
            totalUnits={DEFAULT_TIMELINE_UNITS}
            showGrid={showGrid}
            onSelectClip={setSelectedClipId}
            onChangeClipPosition={(id, start) => {
              updateClip(id, { start })
            }}
            onChangeClipLength={(id, start, length) => {
              updateClip(id, { start, length })
            }}
            onToggleLoopOSReady={(id) => {
              toggleLoopOSReady(id)
            }}
            onSeek={handleSeek}
            onEngineTick={engineTick}
            onScrollChange={handleScrollChange}
          />
        </div>

        <LoopOSInspector
          loopId={loopId}
          clips={clips}
          selectedClipId={selectedClipId}
          sequencedClips={sequencedClips}
          momentum={momentum}
          nextActionClips={nextActionClips}
          playhead={playhead}
          validationWarnings={validationWarnings}
          clearValidationWarnings={clearValidationWarnings}
          aiSuggestions={aiSuggestions}
          onSetAISuggestions={setAISuggestions}
          onClearAISuggestions={clearAISuggestions}
          onApplyAISuggestionClip={applyAISuggestionClip}
          onApplyAllAISuggestions={applyAllAISuggestions}
          onUpdateClip={(id, partial) => {
            updateClip(id, partial)
          }}
          onToggleLoopOSReady={toggleLoopOSReady}
          onDeleteClip={deleteClip}
        />
      </div>

      <LoopOSMomentumBar momentum={momentum} />

      <LoopOSMiniMap
        clips={sequencedClips}
        playhead={playhead}
        totalUnits={DEFAULT_TIMELINE_UNITS}
        viewportStart={viewportStartUnits}
        viewportUnits={viewportUnits}
        onScrubTo={handleScrubFromMiniMap}
      />
    </LoopOSContainer>
  )
}
