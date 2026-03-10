'use client'

import { useEffect, useRef } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { useIdeasStore } from '@/stores/useIdeasStore'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { usePitchStore } from '@/stores/usePitchStore'

export function useSyncToasts() {
  const { success } = useToast()
  
  const ideasSyncedAt = useIdeasStore((state) => state.lastSyncedAt)
  const timelineSyncedAt = useTimelineStore((state) => state.lastSyncedAt)
  const pitchSyncedAt = usePitchStore((state) => state.lastSyncedAt)
  
  // Keep track of previous values to only trigger on change
  const prevIdeasSyncedAt = useRef(ideasSyncedAt)
  const prevTimelineSyncedAt = useRef(timelineSyncedAt)
  const prevPitchSyncedAt = useRef(pitchSyncedAt)

  useEffect(() => {
    if (ideasSyncedAt && ideasSyncedAt !== prevIdeasSyncedAt.current) {
      success('Saved')
      prevIdeasSyncedAt.current = ideasSyncedAt
    }
  }, [ideasSyncedAt, success])

  useEffect(() => {
    if (timelineSyncedAt && timelineSyncedAt !== prevTimelineSyncedAt.current) {
      success('Saved')
      prevTimelineSyncedAt.current = timelineSyncedAt
    }
  }, [timelineSyncedAt, success])

  useEffect(() => {
    if (pitchSyncedAt && pitchSyncedAt !== prevPitchSyncedAt.current) {
      success('Saved')
      prevPitchSyncedAt.current = pitchSyncedAt
    }
  }, [pitchSyncedAt, success])
}
