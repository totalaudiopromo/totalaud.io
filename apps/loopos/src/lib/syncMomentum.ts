import { useMomentumStore } from '@/state/momentumStore'
import type { UpdateMomentum } from '@total-audio/loopos-db'

// TODO: Replace with actual user ID from auth session
const getUserId = () => 'demo-user-id'

/**
 * Fetch momentum from the server
 */
export async function fetchMomentum() {
  const { setMomentum, setSyncState, setError } = useMomentumStore.getState()

  try {
    setSyncState('syncing')

    const response = await fetch('/api/momentum', {
      headers: {
        'x-user-id': getUserId(),
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch momentum: ${response.statusText}`)
    }

    const { momentum } = await response.json()
    setMomentum(momentum)
  } catch (error) {
    console.error('Error fetching momentum:', error)
    setError(error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * Update momentum
 */
export async function updateMomentumSync(updates: UpdateMomentum) {
  const { setMomentum, setSyncState, setError } = useMomentumStore.getState()

  try {
    setSyncState('syncing')

    const response = await fetch('/api/momentum', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': getUserId(),
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error(`Failed to update momentum: ${response.statusText}`)
    }

    const { momentum } = await response.json()
    setMomentum(momentum)

    return momentum
  } catch (error) {
    console.error('Error updating momentum:', error)
    setError(error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Increment momentum by a given amount
 */
export async function incrementMomentum(amount: number) {
  const { momentum } = useMomentumStore.getState()

  if (!momentum) {
    throw new Error('Momentum not initialized')
  }

  const newValue = Math.min(100, momentum.momentum + amount)

  return updateMomentumSync({
    momentum: newValue,
    last_gain: new Date().toISOString(),
  })
}

/**
 * Decrement momentum by a given amount
 */
export async function decrementMomentum(amount: number) {
  const { momentum } = useMomentumStore.getState()

  if (!momentum) {
    throw new Error('Momentum not initialized')
  }

  const newValue = Math.max(0, momentum.momentum - amount)

  return updateMomentumSync({
    momentum: newValue,
  })
}

/**
 * Increment streak
 */
export async function incrementStreak() {
  const { momentum } = useMomentumStore.getState()

  if (!momentum) {
    throw new Error('Momentum not initialized')
  }

  return updateMomentumSync({
    streak: momentum.streak + 1,
  })
}

/**
 * Reset streak to 0
 */
export async function resetStreak() {
  return updateMomentumSync({
    streak: 0,
    last_reset: new Date().toISOString(),
  })
}
