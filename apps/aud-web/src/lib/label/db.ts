/**
 * Label OS — the single cast boundary for Supabase queries.
 *
 * The label_* tables are not yet present in the generated Database types
 * (regeneration requires a running local Supabase). Rather than scattering
 * `as any` across routes, every query builder for a Label OS table is
 * obtained here. Once `pnpm db:types` includes these tables, delete the
 * cast and this file becomes a thin naming layer.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { createRouteSupabaseClient } from '@/lib/supabase/server'

type RouteClient = Awaited<ReturnType<typeof createRouteSupabaseClient>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedClient = SupabaseClient<any, 'public', any>

export interface LabelDb {
  labels: () => ReturnType<UntypedClient['from']>
  members: () => ReturnType<UntypedClient['from']>
  artists: () => ReturnType<UntypedClient['from']>
  releases: () => ReturnType<UntypedClient['from']>
  tracks: () => ReturnType<UntypedClient['from']>
  tasks: () => ReturnType<UntypedClient['from']>
  contacts: () => ReturnType<UntypedClient['from']>
  rpc: UntypedClient['rpc']
}

export function labelDb(client: RouteClient): LabelDb {
  // The one deliberate cast: RouteClient's Database type lacks label_* tables.
  const untyped = client as unknown as UntypedClient

  return {
    labels: () => untyped.from('labels'),
    members: () => untyped.from('label_members'),
    artists: () => untyped.from('label_artists'),
    releases: () => untyped.from('label_releases'),
    tracks: () => untyped.from('label_tracks'),
    tasks: () => untyped.from('label_release_tasks'),
    contacts: () => untyped.from('label_contacts'),
    rpc: untyped.rpc.bind(untyped),
  }
}
