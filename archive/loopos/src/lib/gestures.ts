// Touch gesture utilities for mobile/tablet devices

export interface GestureHandlers {
  onPinch?: (scale: number) => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void
}

export function useTouchGestures(element: HTMLElement, handlers: GestureHandlers) {
  let touchStartX = 0
  let touchStartY = 0
  let touchStartTime = 0
  let touchStartDistance = 0
  let longPressTimer: NodeJS.Timeout | null = null
  let lastTapTime = 0

  const handleTouchStart = (e: TouchEvent) => {
    const touches = e.touches

    if (touches.length === 1) {
      // Single touch
      touchStartX = touches[0].clientX
      touchStartY = touches[0].clientY
      touchStartTime = Date.now()

      // Check for double tap
      const now = Date.now()
      if (now - lastTapTime < 300 && handlers.onDoubleTap) {
        handlers.onDoubleTap()
        lastTapTime = 0
      } else {
        lastTapTime = now
      }

      // Start long press timer
      if (handlers.onLongPress) {
        longPressTimer = setTimeout(() => {
          if (handlers.onLongPress) {
            handlers.onLongPress()
            vibrate(50) // Medium haptic feedback
          }
        }, 500)
      }
    } else if (touches.length === 2) {
      // Pinch gesture
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      touchStartDistance = Math.sqrt(dx * dx + dy * dy)

      // Cancel long press
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        longPressTimer = null
      }
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    const touches = e.touches

    // Cancel long press on move
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }

    if (touches.length === 2 && handlers.onPinch) {
      // Pinch zoom
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const scale = distance / touchStartDistance
      handlers.onPinch(scale)
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    // Cancel long press
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }

    if (e.changedTouches.length === 1 && handlers.onSwipe) {
      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartX
      const deltaY = touch.clientY - touchStartY
      const deltaTime = Date.now() - touchStartTime

      // Swipe detection (>50px movement in <300ms)
      if (deltaTime < 300) {
        if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            handlers.onSwipe(deltaX > 0 ? 'right' : 'left')
            vibrate(10) // Light haptic feedback
          } else {
            // Vertical swipe
            handlers.onSwipe(deltaY > 0 ? 'down' : 'up')
            vibrate(10)
          }
        }
      }
    }
  }

  // Attach listeners
  element.addEventListener('touchstart', handleTouchStart, { passive: false })
  element.addEventListener('touchmove', handleTouchMove, { passive: false })
  element.addEventListener('touchend', handleTouchEnd, { passive: false })

  // Cleanup function
  return () => {
    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchmove', handleTouchMove)
    element.removeEventListener('touchend', handleTouchEnd)

    if (longPressTimer) {
      clearTimeout(longPressTimer)
    }
  }
}

// Haptic feedback using Vibration API
export function vibrate(duration: number | number[]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration)
  }
}

export const haptics = {
  light: () => vibrate(10),
  medium: () => vibrate(50),
  heavy: () => vibrate(100),
  success: () => vibrate([10, 50, 10]),
  error: () => vibrate([50, 100, 50]),
  selection: () => vibrate(5),
}
