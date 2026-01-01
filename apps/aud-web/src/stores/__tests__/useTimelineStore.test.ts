/**
 * Timeline Store Tests (Fixed)
 * Testing event management, Scout integration, and persistence
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimelineStore } from '../useTimelineStore'
import type { Opportunity } from '@/types/scout'

const mockOpportunity: Opportunity = {
  id: 'opp-1',
  name: 'BBC Radio 6 Music',
  type: 'radio',
  genres: ['indie', 'rock'],
  vibes: [],
  audienceSize: 'large',
  source: 'curated',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

describe('useTimelineStore', () => {
  beforeEach(() => {
    act(() => {
      useTimelineStore.setState({
        events: [],
        selectedEventId: null,
      })
    })
  })

  describe('Event Management', () => {
    it('should initialize with sample events', () => {
      const { result } = renderHook(() => useTimelineStore())
      act(() => {
        result.current.resetToSamples()
      })
      expect(result.current.events.length).toBeGreaterThan(0)
    })

    it('should add an event manually', async () => {
      const { result } = renderHook(() => useTimelineStore())

      await act(async () => {
        await result.current.clearSampleEvents()
      })

      let eventId: string
      await act(async () => {
        eventId = await result.current.addEvent({
          lane: 'release',
          title: 'Release Single',
          date: '2024-06-01',
          colour: '#3AA9BE',
          source: 'manual',
        })
      })

      expect(result.current.events).toHaveLength(1)
      expect(result.current.events[0].title).toBe('Release Single')
      expect(result.current.events[0].lane).toBe('release')
    })

    it('should add event from Scout opportunity', async () => {
      const { result } = renderHook(() => useTimelineStore())

      await act(async () => {
        await result.current.clearSampleEvents()
      })

      await act(async () => {
        await result.current.addFromOpportunity(mockOpportunity, 'post-release')
      })

      expect(result.current.events).toHaveLength(1)
      expect(result.current.events[0].title).toContain('BBC Radio 6 Music')
      expect(result.current.events[0].lane).toBe('post-release')
      expect(result.current.events[0].opportunityId).toBe('opp-1')
    })

    it('should update an event', async () => {
      const { result } = renderHook(() => useTimelineStore())
      let eventId: string

      await act(async () => {
        await result.current.clearSampleEvents()
        eventId = await result.current.addEvent({
          lane: 'release',
          title: 'Original Title',
          date: '2024-06-01',
          colour: '#3AA9BE',
          source: 'manual',
        })
      })

      await act(async () => {
        await result.current.updateEvent(eventId!, {
          title: 'Updated Title',
        })
      })

      expect(result.current.events[0].title).toBe('Updated Title')
    })

    it('should delete an event', async () => {
      const { result } = renderHook(() => useTimelineStore())
      let eventId: string

      await act(async () => {
        await result.current.clearSampleEvents()
        eventId = await result.current.addEvent({
          lane: 'release',
          title: 'Test Event',
          date: '2024-06-01',
          colour: '#3AA9BE',
          source: 'manual',
        })
      })

      await act(async () => {
        await result.current.deleteEvent(eventId!)
      })

      expect(result.current.events).toHaveLength(0)
    })

    it('should clear sample events', async () => {
      const { result } = renderHook(() => useTimelineStore())

      act(() => {
        result.current.resetToSamples()
      })

      expect(result.current.events.length).toBeGreaterThan(0)

      await act(async () => {
        await result.current.clearSampleEvents()
      })

      expect(result.current.events.filter((e) => e.source === 'sample')).toHaveLength(0)
    })
  })

  describe('Event Selection', () => {
    it('should select an event', async () => {
      const { result } = renderHook(() => useTimelineStore())
      let eventId: string

      await act(async () => {
        await result.current.clearSampleEvents()
        eventId = await result.current.addEvent({
          lane: 'release',
          title: 'Test Event',
          date: '2024-06-01',
          colour: '#3AA9BE',
          source: 'manual',
        })
      })

      act(() => {
        result.current.selectEvent(eventId!)
      })

      expect(result.current.selectedEventId).toBe(eventId!)
    })

    it('should deselect event', async () => {
      const { result } = renderHook(() => useTimelineStore())
      let eventId: string

      await act(async () => {
        await result.current.clearSampleEvents()
        eventId = await result.current.addEvent({
          lane: 'release',
          title: 'Test Event',
          date: '2024-06-01',
          colour: '#3AA9BE',
          source: 'manual',
        })
      })

      act(() => {
        result.current.selectEvent(eventId!)
        result.current.selectEvent(null)
      })

      expect(result.current.selectedEventId).toBe(null)
    })
  })

  describe('Scout Integration', () => {
    it('should link opportunity to event', async () => {
      const { result } = renderHook(() => useTimelineStore())

      await act(async () => {
        await result.current.clearSampleEvents()
        await result.current.addFromOpportunity(mockOpportunity, 'post-release')
      })

      const event = result.current.events[0]
      expect(event.opportunityId).toBe('opp-1')
      expect(event.title).toContain('BBC Radio 6 Music')
      expect(event.source).toBe('scout')
    })

    it('should check if opportunity is in timeline', async () => {
      const { result } = renderHook(() => useTimelineStore())

      await act(async () => {
        await result.current.clearSampleEvents()
        await result.current.addFromOpportunity(mockOpportunity, 'post-release')
      })

      expect(result.current.isOpportunityInTimeline('opp-1')).toBe(true)
      expect(result.current.isOpportunityInTimeline('nonexistent')).toBe(false)
    })

    it('should allow multiple events from same opportunity', async () => {
      const { result } = renderHook(() => useTimelineStore())

      await act(async () => {
        await result.current.clearSampleEvents()
        await result.current.addFromOpportunity(mockOpportunity, 'post-release')
        await result.current.addFromOpportunity(mockOpportunity, 'post-release')
      })

      expect(result.current.events).toHaveLength(2)
      expect(result.current.events.every((e) => e.opportunityId === 'opp-1')).toBe(true)
    })
  })

  describe('Persistence', () => {
    it('should persist events to localStorage', async () => {
      const { result } = renderHook(() => useTimelineStore())

      await act(async () => {
        await result.current.clearSampleEvents()
        await result.current.addEvent({
          lane: 'release',
          title: 'Persisted Event',
          date: '2024-06-01',
          colour: '#3AA9BE',
          source: 'manual',
        })
      })

      // Simulate page reload
      const { result: newResult } = renderHook(() => useTimelineStore())

      expect(newResult.current.events.some((e) => e.title === 'Persisted Event')).toBe(true)
    })
  })

  describe('Tracker Integration', () => {
    it('should check if event is synced to Tracker', async () => {
      const { result } = renderHook(() => useTimelineStore())
      let eventId: string

      await act(async () => {
        await result.current.clearSampleEvents()
        eventId = await result.current.addEvent({
          lane: 'post-release',
          title: 'Test Event',
          date: '2024-06-01',
          colour: '#10B981',
          source: 'manual',
        })
      })

      expect(result.current.isEventSynced(eventId!)).toBe(false)
    })

    it('should get tracker sync status', async () => {
      const { result } = renderHook(() => useTimelineStore())
      let eventId: string

      await act(async () => {
        await result.current.clearSampleEvents()
        eventId = await result.current.addEvent({
          lane: 'post-release',
          title: 'Test Event',
          date: '2024-06-01',
          colour: '#10B981',
          source: 'manual',
        })
      })

      const status = result.current.getTrackerSyncStatus(eventId!)
      expect(['idle', 'syncing', 'synced', 'error']).toContain(status)
    })
  })
})
