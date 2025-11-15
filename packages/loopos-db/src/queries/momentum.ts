import { createServerClient } from '../dbClient'
import type { Momentum, UpdateMomentum } from '../schemas/momentum'

/**
 * Get momentum for a user (creates if doesn't exist)
 */
export async function getMomentum(userId: string): Promise<Momentum> {
  const supabase = createServerClient()

  // Try to get existing momentum
  const { data, error } = await supabase
    .from('loopos_momentum')
    .select('*')
    .eq('user_id', userId)
    .single()

  // If not found, create it
  if (error && error.code === 'PGRST116') {
    const { data: newData, error: createError } = await supabase
      .from('loopos_momentum')
      .insert({
        user_id: userId,
        momentum: 0,
        streak: 0,
      })
      .select()
      .single()

    if (createError) {
      throw new Error(`Failed to create momentum: ${createError.message}`)
    }

    return newData as Momentum
  }

  if (error) {
    throw new Error(`Failed to fetch momentum: ${error.message}`)
  }

  return data as Momentum
}

/**
 * Update momentum for a user
 */
export async function updateMomentum(
  userId: string,
  updates: UpdateMomentum
): Promise<Momentum> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('loopos_momentum')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update momentum: ${error.message}`)
  }

  return data as Momentum
}

/**
 * Increment momentum by a given amount
 */
export async function incrementMomentum(
  userId: string,
  amount: number
): Promise<Momentum> {
  const current = await getMomentum(userId)
  const newMomentum = Math.min(100, current.momentum + amount)

  return updateMomentum(userId, {
    momentum: newMomentum,
    last_gain: new Date().toISOString(),
  })
}

/**
 * Decrement momentum by a given amount
 */
export async function decrementMomentum(
  userId: string,
  amount: number
): Promise<Momentum> {
  const current = await getMomentum(userId)
  const newMomentum = Math.max(0, current.momentum - amount)

  return updateMomentum(userId, {
    momentum: newMomentum,
  })
}

/**
 * Increment streak
 */
export async function incrementStreak(userId: string): Promise<Momentum> {
  const current = await getMomentum(userId)

  return updateMomentum(userId, {
    streak: current.streak + 1,
  })
}

/**
 * Reset streak to 0
 */
export async function resetStreak(userId: string): Promise<Momentum> {
  return updateMomentum(userId, {
    streak: 0,
    last_reset: new Date().toISOString(),
  })
}
