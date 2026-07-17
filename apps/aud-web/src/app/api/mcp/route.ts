/**
 * POST /api/mcp — the totalaud.io MCP endpoint (Phase 6, docs/ROADMAP_2026.md).
 *
 * "Bring your own assistant": an artist's AI assistant (Claude, or any MCP
 * client) can read their workspace with a personal access token created in
 * Settings. Stateless streamable-HTTP JSON-RPC; every response is a single
 * JSON body.
 *
 * Consent and trust boundaries:
 * - Bearer token required; tokens are created and revoked by the artist
 * - Read-mostly: four read tools plus one deliberately safe write
 *   (adding a timeline event). Nothing here sends anything anywhere.
 * - The audio never left the artist's device, so it cannot be read here.
 */

import { NextRequest, NextResponse } from 'next/server'
import { resolveToken } from '@/lib/api/tokens'
import { getSupabaseServiceRoleClient } from '@/lib/supabase/serviceRole'
import { getTapClient, TapApiError } from '@/lib/tap/client'
import { generateEventId, getLaneColour, type LaneType } from '@/types/timeline'
import { logger } from '@/lib/logger'

const log = logger.scope('McpRoute')

const PROTOCOL_VERSION = '2025-06-18'
const VALID_LANES = new Set<LaneType>(['pre-release', 'release', 'post-release'])

interface JsonRpcRequest {
  jsonrpc: '2.0'
  id?: number | string | null
  method: string
  params?: Record<string, unknown>
}

function rpcResult(id: number | string | null | undefined, result: unknown) {
  return NextResponse.json({ jsonrpc: '2.0', id: id ?? null, result })
}

function rpcError(id: number | string | null | undefined, code: number, message: string) {
  return NextResponse.json({ jsonrpc: '2.0', id: id ?? null, error: { code, message } })
}

function textContent(text: string) {
  return { content: [{ type: 'text', text }] }
}

const TOOLS = [
  {
    name: 'get_timeline',
    description:
      'The artist release timeline: recent and upcoming events across pre-release, release and post-release lanes.',
    inputSchema: {
      type: 'object',
      properties: {
        days_ahead: {
          type: 'number',
          description: 'How far forward to look, in days (default 60)',
        },
      },
    },
  },
  {
    name: 'get_finishing_notes',
    description:
      'Recent finishing notes: perspectives on tracks the artist analysed in Finish (the audio itself never leaves their device and is not available).',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'How many recent notes to return (default 3)' },
      },
    },
  },
  {
    name: 'get_follow_ups',
    description:
      'The follow-up queue from the artist promo history: follow-ups due, contacts gone quiet, pitches drafted but not sent. Nothing is ever sent automatically.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_pitch_drafts',
    description: 'The artist saved pitch drafts, with their sections.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'How many drafts to return (default 5)' },
      },
    },
  },
  {
    name: 'add_timeline_event',
    description:
      'Add one event to the artist release timeline. The only write this endpoint offers; it never contacts anyone.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Event title' },
        date: { type: 'string', description: 'Event date, YYYY-MM-DD' },
        lane: {
          type: 'string',
          enum: ['pre-release', 'release', 'post-release'],
          description: 'Timeline lane (default pre-release)',
        },
        description: { type: 'string', description: 'Optional note on the event' },
      },
      required: ['title', 'date'],
    },
  },
]

async function callTool(
  userId: string,
  name: string,
  args: Record<string, unknown>
): Promise<{ content: { type: string; text: string }[] }> {
  const supabase = getSupabaseServiceRoleClient()

  switch (name) {
    case 'get_timeline': {
      const daysAhead =
        typeof args.days_ahead === 'number' && args.days_ahead > 0
          ? Math.min(args.days_ahead, 365)
          : 60
      const from = new Date(Date.now() - 7 * 86_400_000).toISOString()
      const to = new Date(Date.now() + daysAhead * 86_400_000).toISOString()
      const { data, error } = await supabase
        .from('user_timeline_events')
        .select('title, event_date, lane, description')
        .eq('user_id', userId)
        .gte('event_date', from)
        .lte('event_date', to)
        .order('event_date', { ascending: true })
        .limit(50)
      if (error) throw new Error('Could not load the timeline')
      if (!data?.length) return textContent('No timeline events in this window.')
      return textContent(
        data
          .map(
            (event) =>
              `${event.event_date.slice(0, 10)} [${event.lane}] ${event.title}${event.description ? ` — ${event.description}` : ''}`
          )
          .join('\n')
      )
    }

    case 'get_finishing_notes': {
      const limit = typeof args.limit === 'number' && args.limit > 0 ? Math.min(args.limit, 10) : 3
      const { data, error } = await supabase
        .from('finish_notes')
        .select('track_name, notes, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw new Error('Could not load finishing notes')
      if (!data?.length) return textContent('No finishing notes yet.')
      return textContent(
        data
          .map(
            (row) =>
              `${row.track_name ?? 'Untitled track'} (${row.created_at.slice(0, 10)}):\n${JSON.stringify(row.notes)}`
          )
          .join('\n\n')
      )
    }

    case 'get_follow_ups': {
      const tap = getTapClient()
      if (!tap.isConfigured) {
        return textContent('The follow-up queue connects when TAP is linked.')
      }
      try {
        const queue = await tap.listActionQueue({ limit: 25 })
        if (!queue.data.length) return textContent('Nothing waiting in the follow-up queue.')
        return textContent(
          queue.data
            .map((item) => {
              const contact =
                item.follow_up?.contact ??
                item.stale_contact?.contact ??
                item.pending_pitch?.contact
              return `${item.type}${contact ? ` — contact ${contact}` : ''}`
            })
            .join('\n')
        )
      } catch (error) {
        if (error instanceof TapApiError && error.isTransient) {
          return textContent('The follow-up queue is unreachable just now.')
        }
        throw error
      }
    }

    case 'get_pitch_drafts': {
      const limit = typeof args.limit === 'number' && args.limit > 0 ? Math.min(args.limit, 10) : 5
      const { data, error } = await supabase
        .from('user_pitch_drafts')
        .select('name, pitch_type, sections, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit)
      if (error) throw new Error('Could not load pitch drafts')
      if (!data?.length) return textContent('No pitch drafts yet.')
      return textContent(
        data
          .map(
            (draft) =>
              `${draft.name} (${draft.pitch_type}, updated ${draft.updated_at.slice(0, 10)}):\n${JSON.stringify(draft.sections)}`
          )
          .join('\n\n')
      )
    }

    case 'add_timeline_event': {
      const title = typeof args.title === 'string' ? args.title.trim() : ''
      const date = typeof args.date === 'string' ? args.date : ''
      if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error('add_timeline_event needs a title and a date in YYYY-MM-DD form')
      }
      const lane: LaneType = VALID_LANES.has(args.lane as LaneType)
        ? (args.lane as LaneType)
        : 'pre-release'
      const description =
        typeof args.description === 'string' ? args.description.trim() || null : null

      const { error } = await supabase.from('user_timeline_events').insert({
        id: generateEventId(),
        user_id: userId,
        lane,
        title,
        event_date: new Date(`${date}T12:00:00`).toISOString(),
        colour: getLaneColour(lane),
        description,
        source: 'manual',
        tags: ['assistant'],
      })
      if (error) throw new Error('Could not add the event')
      return textContent(`Added "${title}" to the ${lane} lane on ${date}.`)
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? null
  const identity = await resolveToken(bearer)
  if (!identity) {
    return NextResponse.json(
      { error: 'A valid personal access token is required (Settings → Bring your own assistant)' },
      { status: 401 }
    )
  }

  let message: JsonRpcRequest
  try {
    message = (await request.json()) as JsonRpcRequest
  } catch {
    return rpcError(null, -32700, 'Parse error')
  }

  // Notifications get an empty 202 per streamable HTTP
  if (message.method?.startsWith('notifications/')) {
    return new NextResponse(null, { status: 202 })
  }

  try {
    switch (message.method) {
      case 'initialize':
        return rpcResult(message.id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: { name: 'totalaud.io', version: '1.0.0' },
          instructions:
            'Read-mostly access to this artist’s totalaud.io workspace: timeline, finishing notes, follow-up queue and pitch drafts, plus adding timeline events. Nothing here sends anything on the artist’s behalf.',
        })

      case 'ping':
        return rpcResult(message.id, {})

      case 'tools/list':
        return rpcResult(message.id, { tools: TOOLS })

      case 'tools/call': {
        const name = message.params?.name
        if (typeof name !== 'string') return rpcError(message.id, -32602, 'Missing tool name')
        const args = (message.params?.arguments ?? {}) as Record<string, unknown>
        try {
          const result = await callTool(identity.userId, name, args)
          return rpcResult(message.id, result)
        } catch (error) {
          const text = error instanceof Error ? error.message : 'Tool call failed'
          return rpcResult(message.id, { ...textContent(text), isError: true })
        }
      }

      default:
        return rpcError(message.id, -32601, `Method not found: ${message.method}`)
    }
  } catch (error) {
    log.error('MCP request failed', error instanceof Error ? error : undefined)
    return rpcError(message.id, -32603, 'Internal error')
  }
}

export async function GET(): Promise<NextResponse> {
  // No server-initiated stream in stateless mode
  return new NextResponse(null, { status: 405 })
}
