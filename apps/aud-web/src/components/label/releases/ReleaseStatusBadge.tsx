import { RELEASE_STATUS_LABELS, type ReleaseStatus } from '@/lib/label/types'

const STATUS_STYLES: Record<ReleaseStatus, string> = {
  idea: 'bg-white/[0.06] text-ta-grey',
  in_progress: 'bg-ta-warning/15 text-ta-warning',
  scheduled: 'bg-ta-cyan/15 text-ta-cyan',
  released: 'bg-ta-success/15 text-ta-success',
}

export function ReleaseStatusBadge({ status }: { status: ReleaseStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-ta-pill text-[11px] font-medium ${STATUS_STYLES[status]}`}
    >
      {RELEASE_STATUS_LABELS[status]}
    </span>
  )
}
