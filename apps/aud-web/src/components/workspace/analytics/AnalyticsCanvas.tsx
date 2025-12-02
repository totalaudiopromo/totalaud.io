/**
 * Analytics Canvas Component
 * 2025 Brand Pivot - Cinematic Editorial
 *
 * Dashboard for tracking release performance
 * Placeholder with sample data visualisation
 */

'use client'

import { motion } from 'framer-motion'

// Sample metrics for demo
const METRICS = [
  {
    id: 'streams',
    label: 'Total Streams',
    value: '12,847',
    change: '+24%',
    isPositive: true,
  },
  {
    id: 'listeners',
    label: 'Monthly Listeners',
    value: '3,291',
    change: '+18%',
    isPositive: true,
  },
  {
    id: 'saves',
    label: 'Saves',
    value: '847',
    change: '+31%',
    isPositive: true,
  },
  {
    id: 'playlists',
    label: 'Playlist Adds',
    value: '23',
    change: '+5',
    isPositive: true,
  },
]

const RECENT_ACTIVITY = [
  { id: 1, text: 'Added to "Indie Chill" playlist', time: '2 hours ago', type: 'playlist' },
  { id: 2, text: 'BBC Radio 1 play recorded', time: '5 hours ago', type: 'radio' },
  { id: 3, text: 'Featured in NME article', time: '1 day ago', type: 'press' },
  { id: 4, text: 'Reached 10k streams milestone', time: '2 days ago', type: 'milestone' },
]

export function AnalyticsCanvas() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px',
        overflowY: 'auto',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      {/* Metrics Grid - responsive */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {METRICS.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{
              padding: 24,
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 10,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: 8,
              }}
            >
              {metric.label}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: '#F7F8F9',
                marginBottom: 8,
                letterSpacing: '-0.02em',
              }}
            >
              {metric.value}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: metric.isPositive ? '#10B981' : '#EF4444',
              }}
            >
              {metric.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout - stacks on mobile */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: 24,
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#F7F8F9',
              marginBottom: 20,
            }}
          >
            Streaming Performance
          </div>

          {/* Simple bar chart placeholder */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'flex-end',
              gap: 8,
              paddingBottom: 24,
            }}
          >
            {[65, 40, 80, 55, 90, 70, 85, 45, 75, 60, 95, 72].map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                style={{
                  flex: 1,
                  backgroundColor: i === 10 ? '#3AA9BE' : 'rgba(58, 169, 190, 0.3)',
                  borderRadius: 4,
                  minHeight: 8,
                }}
              />
            ))}
          </div>

          {/* X-axis labels */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              paddingTop: 12,
            }}
          >
            {[
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'May',
              'Jun',
              'Jul',
              'Aug',
              'Sep',
              'Oct',
              'Nov',
              'Dec',
            ].map((month) => (
              <span
                key={month}
                style={{
                  fontSize: 11,
                  color: 'rgba(255, 255, 255, 0.4)',
                }}
              >
                {month}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            padding: 24,
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#F7F8F9',
              marginBottom: 20,
            }}
          >
            Recent Activity
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {RECENT_ACTIVITY.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#3AA9BE',
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'rgba(255, 255, 255, 0.8)',
                      lineHeight: 1.4,
                      marginBottom: 4,
                    }}
                  >
                    {activity.text}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    {activity.time}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
