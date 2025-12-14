/**
 * Pitch Store Tests (Fixed)
 * Testing pitch types, sections, AI coach integration
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePitchStore, buildPitchMarkdown, buildPitchPlainText } from '../usePitchStore'

describe('usePitchStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => usePitchStore())
    act(() => {
      result.current.resetPitch()
    })
  })

  describe('Pitch Type Selection', () => {
    it('should initialize with no type selected', () => {
      const { result } = renderHook(() => usePitchStore())
      expect(result.current.currentType).toBe(null)
    })

    it('should select a pitch type', () => {
      const { result } = renderHook(() => usePitchStore())

      act(() => {
        result.current.selectType('radio')
      })

      expect(result.current.currentType).toBe('radio')
      expect(result.current.sections.length).toBeGreaterThan(0)
    })

    it('should reset pitch', () => {
      const { result } = renderHook(() => usePitchStore())

      act(() => {
        result.current.selectType('radio')
        result.current.updateSection(result.current.sections[0].id, 'Test content')
        result.current.resetPitch()
      })

      expect(result.current.currentType).toBe(null)
      expect(result.current.sections.every((s) => s.content === '')).toBe(true)
    })
  })

  describe('Section Management', () => {
    beforeEach(() => {
      const { result } = renderHook(() => usePitchStore())
      act(() => {
        result.current.selectType('radio')
      })
    })

    it('should create sections when type is selected', () => {
      const { result } = renderHook(() => usePitchStore())

      act(() => {
        result.current.selectType('radio')
      })

      expect(result.current.sections.length).toBeGreaterThan(0)
      expect(result.current.sections[0]).toHaveProperty('id')
      expect(result.current.sections[0]).toHaveProperty('title')
      expect(result.current.sections[0]).toHaveProperty('content')
    })

    it('should update section content', () => {
      const { result } = renderHook(() => usePitchStore())

      act(() => {
        result.current.selectType('radio')
      })

      const sectionId = result.current.sections[0].id

      act(() => {
        result.current.updateSection(sectionId, 'New content')
      })

      expect(result.current.sections[0].content).toBe('New content')
    })

    it('should select a section', () => {
      const { result } = renderHook(() => usePitchStore())

      act(() => {
        result.current.selectType('radio')
      })

      const sectionId = result.current.sections[0].id

      act(() => {
        result.current.selectSection(sectionId)
      })

      expect(result.current.selectedSectionId).toBe(sectionId)
    })
  })

  describe('AI Coach', () => {
    it('should open coach', () => {
      const { result } = renderHook(() => usePitchStore())

      act(() => {
        result.current.openCoach()
      })

      expect(result.current.isCoachOpen).toBe(true)
    })

    it('should close coach', () => {
      const { result } = renderHook(() => usePitchStore())

      act(() => {
        result.current.openCoach()
        result.current.closeCoach()
      })

      expect(result.current.isCoachOpen).toBe(false)
    })

    it('should set coach loading state', () => {
      const { result } = renderHook(() => usePitchStore())

      act(() => {
        result.current.setCoachLoading(true)
      })

      expect(result.current.isCoachLoading).toBe(true)
    })

    it('should set coach response', () => {
      const { result } = renderHook(() => usePitchStore())
      const response = 'This is a great start!'

      act(() => {
        result.current.setCoachResponse(response)
      })

      expect(result.current.coachResponse).toBe(response)
    })

    it('should set coach error', () => {
      const { result } = renderHook(() => usePitchStore())
      const error = 'Failed to get suggestion'

      act(() => {
        result.current.setCoachError(error)
      })

      expect(result.current.coachError).toBe(error)
    })

    it('should apply coach suggestion to section', () => {
      const { result } = renderHook(() => usePitchStore())

      act(() => {
        result.current.selectType('radio')
      })

      const sectionId = result.current.sections[0].id
      const suggestion = 'Improved content from coach'

      act(() => {
        result.current.applyCoachSuggestion(sectionId, suggestion)
      })

      expect(result.current.sections[0].content).toBe(suggestion)
    })
  })

  describe('Export Functionality', () => {
    it('should export pitch as markdown using helper function', () => {
      const { result } = renderHook(() => usePitchStore())

      act(() => {
        result.current.selectType('radio')
        result.current.updateSection(result.current.sections[0].id, 'Section 1 content')
      })

      const markdown = buildPitchMarkdown(result.current.sections, result.current.currentType!)

      expect(markdown).toContain('Section 1 content')
      expect(markdown).toContain('Radio Pitch')
    })

    it('should export pitch as plain text using helper function', () => {
      const { result } = renderHook(() => usePitchStore())

      act(() => {
        result.current.selectType('press')
        result.current.updateSection(result.current.sections[0].id, 'Press content')
      })

      const text = buildPitchPlainText(result.current.sections, result.current.currentType!)

      expect(text).toContain('Press content')
      expect(text).toContain('PRESS RELEASE')
    })
  })

  describe('Draft Management', () => {
    it('should save a draft', async () => {
      const { result } = renderHook(() => usePitchStore())

      await act(async () => {
        result.current.selectType('playlist')
        result.current.updateSection(result.current.sections[0].id, 'Draft content')
      })

      let draftId: string
      await act(async () => {
        draftId = await result.current.saveDraft('My First Draft')
      })

      expect(result.current.drafts).toHaveLength(1)
      expect(result.current.drafts[0].name).toBe('My First Draft')
    })

    it('should load a draft', async () => {
      const { result } = renderHook(() => usePitchStore())
      let draftId: string

      await act(async () => {
        result.current.selectType('radio')
        result.current.updateSection(result.current.sections[0].id, 'Saved content')
        draftId = await result.current.saveDraft('Test Draft')
      })

      // Reset pitch
      act(() => {
        result.current.resetPitch()
      })

      // Load draft
      act(() => {
        result.current.loadDraft(draftId!)
      })

      expect(result.current.sections[0].content).toBe('Saved content')
    })
  })

  describe('Persistence', () => {
    it('should persist pitch to localStorage', async () => {
      const { result } = renderHook(() => usePitchStore())

      await act(async () => {
        result.current.selectType('playlist')
        result.current.updateSection(result.current.sections[0].id, 'Persisted content')
        await result.current.saveDraft('Persisted Draft')
      })

      // Simulate page reload
      const { result: newResult } = renderHook(() => usePitchStore())

      expect(newResult.current.drafts.some((d) => d.name === 'Persisted Draft')).toBe(true)
    })
  })

  describe('TAP Integration', () => {
    it('should open TAP modal', () => {
      const { result } = renderHook(() => usePitchStore())

      act(() => {
        result.current.openTAPModal()
      })

      expect(result.current.isTAPModalOpen).toBe(true)
    })

    it('should close TAP modal', () => {
      const { result } = renderHook(() => usePitchStore())

      act(() => {
        result.current.openTAPModal()
        result.current.closeTAPModal()
      })

      expect(result.current.isTAPModalOpen).toBe(false)
    })

    it('should track TAP generation status', () => {
      const { result } = renderHook(() => usePitchStore())

      expect(result.current.tapGenerationStatus).toBe('idle')
    })
  })
})
