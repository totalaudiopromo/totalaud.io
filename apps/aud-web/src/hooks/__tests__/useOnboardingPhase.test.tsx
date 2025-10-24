import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOnboardingPhase } from '../useOnboardingPhase'

describe('useOnboardingPhase', () => {
  it('should initialise with operator phase', () => {
    const { result } = renderHook(() => useOnboardingPhase())

    expect(result.current.phase).toBe('operator')
  })

  it('should progress through phases in correct order', () => {
    const { result } = renderHook(() => useOnboardingPhase())

    // Start at operator
    expect(result.current.phase).toBe('operator')

    // Next should go to selection
    act(() => {
      result.current.next()
    })
    expect(result.current.phase).toBe('selection')

    // Next should go to transition
    act(() => {
      result.current.next()
    })
    expect(result.current.phase).toBe('transition')

    // Next should go to signal
    act(() => {
      result.current.next()
    })
    expect(result.current.phase).toBe('signal')

    // Next should stay at signal (final phase)
    act(() => {
      result.current.next()
    })
    expect(result.current.phase).toBe('signal')
  })

  it('should allow setting phase directly', () => {
    const { result } = renderHook(() => useOnboardingPhase())

    act(() => {
      result.current.setPhase('transition')
    })

    expect(result.current.phase).toBe('transition')
  })

  it('should reset to operator phase', () => {
    const { result } = renderHook(() => useOnboardingPhase())

    // Move to signal phase
    act(() => {
      result.current.setPhase('signal')
    })
    expect(result.current.phase).toBe('signal')

    // Reset should go back to operator
    act(() => {
      result.current.reset()
    })
    expect(result.current.phase).toBe('operator')
  })

  it('should not progress beyond signal phase', () => {
    const { result } = renderHook(() => useOnboardingPhase())

    // Set to signal phase
    act(() => {
      result.current.setPhase('signal')
    })

    // Try to progress further
    act(() => {
      result.current.next()
    })

    // Should remain at signal
    expect(result.current.phase).toBe('signal')
  })

  it('should maintain phase across multiple renders', () => {
    const { result, rerender } = renderHook(() => useOnboardingPhase())

    act(() => {
      result.current.next()
    })

    expect(result.current.phase).toBe('selection')

    rerender()

    expect(result.current.phase).toBe('selection')
  })

  it('should provide all required functions', () => {
    const { result } = renderHook(() => useOnboardingPhase())

    expect(typeof result.current.next).toBe('function')
    expect(typeof result.current.reset).toBe('function')
    expect(typeof result.current.setPhase).toBe('function')
  })

  describe('phase transitions', () => {
    it('operator -> selection', () => {
      const { result } = renderHook(() => useOnboardingPhase())

      act(() => {
        result.current.next()
      })

      expect(result.current.phase).toBe('selection')
    })

    it('selection -> transition', () => {
      const { result } = renderHook(() => useOnboardingPhase())

      act(() => {
        result.current.setPhase('selection')
        result.current.next()
      })

      expect(result.current.phase).toBe('transition')
    })

    it('transition -> signal', () => {
      const { result } = renderHook(() => useOnboardingPhase())

      act(() => {
        result.current.setPhase('transition')
        result.current.next()
      })

      expect(result.current.phase).toBe('signal')
    })
  })
})
