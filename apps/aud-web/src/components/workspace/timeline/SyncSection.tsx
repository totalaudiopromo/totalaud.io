import { TrackerSyncStatus } from '@/types/timeline'

interface SyncSectionProps {
  isSynced: boolean
  syncStatus: TrackerSyncStatus
  syncError?: string
  trackerSyncedAt?: string
  showAuthPrompt: boolean
  canSync: boolean
  onSync: () => void
}

export function SyncSection({
  isSynced,
  syncStatus,
  syncError,
  trackerSyncedAt,
  showAuthPrompt,
  canSync,
  onSync,
}: SyncSectionProps) {
  return (
    <div
      className={`mb-5 p-3 rounded-lg border flex items-center justify-between gap-3
        ${isSynced ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-ta-cyan/5 border-ta-cyan/15'}
      `}
    >
      <div>
        <div
          className={`text-[11px] font-semibold uppercase tracking-wider mb-0.5
            ${isSynced ? 'text-emerald-500' : 'text-ta-grey'}
          `}
        >
          {isSynced ? '✓ Logged to TAP Tracker' : 'TAP Tracker'}
        </div>
        {isSynced && trackerSyncedAt && (
          <div className="text-[11px] text-ta-grey/50">
            Synced {new Date(trackerSyncedAt).toLocaleDateString('en-GB')}
          </div>
        )}
        {syncError && <div className="text-[11px] text-red-400 mt-0.5">{syncError}</div>}
      </div>

      {!isSynced && (
        <button
          onClick={onSync}
          disabled={!canSync && syncStatus !== 'idle'}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all
            ${
              showAuthPrompt
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-500'
                : syncStatus === 'syncing'
                  ? 'bg-transparent text-ta-cyan/60 border-ta-cyan/30'
                  : 'bg-transparent text-ta-cyan border-ta-cyan/30 hover:bg-ta-cyan/10'
            }
            ${!canSync && syncStatus !== 'idle' ? 'cursor-wait' : 'cursor-pointer'}
          `}
        >
          {showAuthPrompt ? (
            'Sign up to unlock'
          ) : syncStatus === 'syncing' ? (
            <>
              <span className="w-3 h-3 border-2 border-ta-cyan/30 border-t-ta-cyan rounded-full animate-spin" />
              Syncing...
            </>
          ) : syncStatus === 'error' ? (
            'Retry'
          ) : (
            'Log to TAP'
          )}
        </button>
      )}
    </div>
  )
}
