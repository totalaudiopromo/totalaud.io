# Phase 16 — FlowCore Recovery & Auth Reconnection

## Overview
- Supabase authentication now drives every console surface. Anonymous demo flows are gone; unauthorised calls return 401 with proper logging.
- Flow Hub metrics run against the new `flow_hub_summary_cache` table with the `refresh_flow_hub_summary(uid)` RPC and strict RLS policies.
- FlowCore theming lives in a new global provider that standardises colours, motion, overlays, and Geist Sans/Mono font loading.
- FlowCanvas 2.0 runs on React Flow + Zustand with 60s Supabase persistence, reduced-motion support, and audio cues from Phase 14.8.

## Supabase Authentication
- Added `@supabase/auth-helpers-nextjs` with server/browser helpers under `lib/supabase`.
- All API routes now resolve `supabase.auth.getSession()` via cookie-bound clients and short-circuit with `401` when unauthenticated.
- `/console` bootstraps against live session + campaign data and redirects through `/auth/signin` when the session is missing.

## Flow Hub Backend
- Migration `20251209000000_flow_hub_summary.sql` creates cache table, indexes, RLS policies (select/update/delete), and the `refresh_flow_hub_summary` RPC.
- `/api/flow-hub/summary` serves cached metrics, automatically refreshes when entries expire, and returns 404 if generation fails.
- `/api/flow-hub/brief` generates structured insights with Claude Haiku (`claude-3-haiku-20240307`), caches responses for four hours, and honours manual regenerations.

## Global FlowCore Theme
- `FlowCoreThemeProvider` applies FlowCore CSS variables, overlay tokens, motion timing, reduced-motion fallbacks, and loads Geist Sans/Mono via `next/font`.
- Root layout wraps the entire app with the provider so every surface inherits consistent typography, colour tokens, and accessibility defaults.
- Emoji iconography removed in favour of `lucide-react` so the console stays consistent with FlowCore iconography.

## FlowCanvas 2.0
- Zustand store handles shared node/edge state with functional setters, reset helper, and spawn helper.
- React Flow renders nodes, minimap, controls, and background with FlowCore tokens and reduced-motion aware transitions.
- Scene state auto-saves to Supabase every 60 seconds, on tab hide/unload, and when unmounting — skipping re-saves during hydration.

## Verification
- `supabase db push` — applies the Flow Hub cache migration.
- `pnpm dev` — launch console, sign in, confirm `/console` bootstraps live campaigns and FlowCanvas persists between reloads.
- `/api/flow-hub/summary` — verify refresh path after cache expiry plus `cached` flag toggling.
- `/api/flow-hub/brief` — confirm Claude Haiku responses cache and regenerate correctly.
- Keyboard + reduced-motion sanity checks for Flow Hub overlay, Node Palette, and FlowCanvas interactions.

## Next Steps
- Instrument cache refresh frequency to validate the one-hour TTL.
- Expand `canvas_scenes` schema with scene naming + collaboration metadata.
- Add integration tests around the auth/session bootstrap to guard against regression.

