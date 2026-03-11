interface DiscoveryStatsProps {
  totalFound: number
  totalVerified: number
  totalB2B: number
  fetchTimeMs: number
}

export function DiscoveryStats({
  totalFound,
  totalVerified,
  totalB2B,
  fetchTimeMs,
}: DiscoveryStatsProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        marginBottom: 16,
        padding: '12px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 10,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#F7F8F9' }}>{totalFound}</div>
        <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>Found</div>
      </div>
      <div style={{ width: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#3AA9BE' }}>{totalVerified}</div>
        <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>Verified</div>
      </div>
      <div style={{ width: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#22C55E' }}>{totalB2B}</div>
        <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>B2B</div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.4)' }}>{fetchTimeMs}ms</div>
      </div>
    </div>
  )
}
