/**
 * Timeline Zoom Hook
 * Handles mouse wheel zoom (Ctrl/Cmd + Wheel)
 */

import { useEffect, RefObject } from 'react'
import { useTimeline } from '@totalaud/os-state/campaign'

interface TimelineZoomOptions {
  timelineRef: RefObject<HTMLElement>
}

export function useTimelineZoom({ timelineRef }: TimelineZoomOptions) {
  const { setZoom, timeline } = useTimeline()

  useEffect(() => {
    const element = timelineRef.current
    if (!element) return

    const handleWheel = (e: WheelEvent) => {
      // Only zoom if Ctrl/Cmd is pressed
      if (!e.ctrlKey && !e.metaKey) return

      e.preventDefault()

      const delta = e.deltaY
      const zoomFactor = delta > 0 ? 0.9 : 1.1

      setZoom(timeline.zoom * zoomFactor)
    }

    element.addEventListener('wheel', handleWheel, { passive: false })
    return () => element.removeEventListener('wheel', handleWheel)
  }, [timelineRef, timeline.zoom, setZoom])
}
