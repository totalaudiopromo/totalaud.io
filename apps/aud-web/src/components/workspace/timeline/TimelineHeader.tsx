import React, { forwardRef } from 'react'

interface TimelineHeaderProps {
  timeColumns: Date[]
  columnWidth: number
  formatColumnHeader: (date: Date) => string
  sidebarWidth?: number
}

export const TimelineHeader = forwardRef<HTMLDivElement, TimelineHeaderProps>(
  ({ timeColumns, columnWidth, formatColumnHeader, sidebarWidth = 100 }, ref) => {
    return (
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div
          style={{
            width: sidebarWidth,
            minWidth: sidebarWidth,
            flexShrink: 0,
            borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            padding: sidebarWidth < 80 ? '10px 8px' : '12px 12px',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Lanes
          </span>
        </div>

        <div
          ref={ref}
          style={{
            flex: 1,
            overflowX: 'auto',
            display: 'flex',
          }}
        >
          {timeColumns.map((column) => (
            <div
              key={column.getTime()}
              style={{
                width: columnWidth,
                flexShrink: 0,
                padding: '12px 8px',
                borderRight: '1px solid rgba(255, 255, 255, 0.03)',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                {formatColumnHeader(column)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
)

TimelineHeader.displayName = 'TimelineHeader'
