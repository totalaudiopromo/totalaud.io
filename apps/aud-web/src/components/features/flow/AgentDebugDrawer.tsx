/**
 * Agent Debug Drawer
 * Phase 18: Read-only telemetry view for agent nodes
 */

'use client'

import { useEffect, useState } from 'react'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { createBrowserSupabaseClient } from '@aud-web/lib/supabase/client'

interface AgentDebugDrawerProps {
  nodeId: string | null
  isOpen: boolean
  onClose: () => void
}

interface TelemetryEvent {
  id: string
  event_type: string
  event_data: Record<string, unknown>
  created_at: string
}

export function AgentDebugDrawer({ nodeId, isOpen, onClose }: AgentDebugDrawerProps) {
  const [events, setEvents] = useState<TelemetryEvent[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !nodeId) {
      setEvents([])
      return
    }

    const supabase = createBrowserSupabaseClient()
    setLoading(true)

    // Fetch last 5 telemetry events for this node
    supabase
      .from('flow_telemetry')
      .select('id, event_type, event_data, created_at')
      .eq('node_id', nodeId)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data, error }) => {
        if (error) {
          console.warn('Failed to load telemetry', error)
          setEvents([])
        } else {
          setEvents((data as TelemetryEvent[]) ?? [])
        }
        setLoading(false)
      })
  }, [isOpen, nodeId])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: '420px',
        backgroundColor: flowCoreColours.overlayStrong,
        borderLeft: `1px solid ${flowCoreColours.borderGrey}`,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--flowcore-font-mono)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '13px',
              color: flowCoreColours.slateCyan,
              marginBottom: '4px',
              textTransform: 'lowercase',
            }}
          >
            agent debug
          </div>
          <div style={{ fontSize: '11px', color: flowCoreColours.textTertiary }}>{nodeId}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: flowCoreColours.textSecondary,
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
        }}
      >
        {loading && (
          <div style={{ color: flowCoreColours.textTertiary, fontSize: '12px' }}>
            loading telemetry...
          </div>
        )}

        {!loading && events.length === 0 && (
          <div style={{ color: flowCoreColours.textTertiary, fontSize: '12px' }}>
            no telemetry events recorded
          </div>
        )}

        {!loading && events.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '11px',
                color: flowCoreColours.textSecondary,
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Recent Events ({events.length})
            </div>

            {events.map((event) => (
              <div
                key={event.id}
                style={{
                  marginBottom: '12px',
                  padding: '12px',
                  backgroundColor: flowCoreColours.matteBlack,
                  border: `1px solid ${flowCoreColours.borderGrey}`,
                  borderRadius: '4px',
                  fontSize: '11px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ color: flowCoreColours.slateCyan }}>{event.event_type}</span>
                  <span style={{ color: flowCoreColours.textTertiary }}>
                    {new Date(event.created_at).toLocaleTimeString()}
                  </span>
                </div>

                {event.event_data && Object.keys(event.event_data).length > 0 && (
                  <div
                    style={{
                      fontSize: '10px',
                      color: flowCoreColours.textSecondary,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {JSON.stringify(event.event_data, null, 2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Notice */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: `1px solid ${flowCoreColours.borderGrey}`,
          fontSize: '10px',
          color: flowCoreColours.textTertiary,
          textAlign: 'center',
        }}
      >
        read-only telemetry view
      </div>
    </div>
  )
}
