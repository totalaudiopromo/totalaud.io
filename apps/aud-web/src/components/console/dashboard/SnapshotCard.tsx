import { Card } from '../ui/Card'
import { Metric } from '../ui/Metric'

interface SnapshotCardProps {
  data: {
    activeCampaigns: number
    totalContacts: number
    coverageEvents: number
    avgReplyRate: number
  }
}

export function SnapshotCard({ data }: SnapshotCardProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-tap-white lowercase mb-6">snapshot</h3>
      <div className="grid grid-cols-2 gap-6">
        <Metric label="active campaigns" value={data.activeCampaigns} format="number" />
        <Metric label="total contacts" value={data.totalContacts} format="number" />
        <Metric label="coverage events" value={data.coverageEvents} format="number" />
        <Metric
          label="avg reply rate"
          value={(data.avgReplyRate * 100).toFixed(1)}
          format="percentage"
        />
      </div>
    </Card>
  )
}
