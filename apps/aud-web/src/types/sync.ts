/**
 * Shared Sync State
 */

export interface SyncState {
  isLoading: boolean
  isSyncing: boolean
  syncError: string | null
  lastSyncedAt: string | null
}
