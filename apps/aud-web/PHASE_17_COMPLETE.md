# Phase 17 — FlowCore Unification & Legacy Module Repair

## Summary

- Reinforced authenticated data paths end-to-end: console assets now filter by the active campaign, Flow Hub pulls cache via Supabase, and the public EPK page/OG image generator hydrate from live `campaign_context`, `campaigns`, and `artist_assets` rows (service-role backed, limited to public records).
- Brought the collaboration stack online: collaborators/comments CRUD routes enforce session auth, real-time subscriptions refresh drawers, optimistic updates stay in sync with Supabase RLS, and invite links honour role boundaries.
- Rewired agent surfaces to send real telemetry and tracker data. Intel + Pitch nodes emit `agentRun` events (success/error), Pitch logs `pitch_sent`, the orchestration bridge and tracker dashboard fire `tracker_update`, and outreach logging is stored against `campaign_outreach_logs`.
- FlowCore design tokens apply across console/EPK (motion vars, warning colour, lowercase copy, no emojis); asset drawers, analytics drawers, and buttons now use `--flowcore-motion-*` plus live lucide icons.

## Telemetry Contract Updates

- New events: `pitch_sent`, `tracker_update`, and enriched `agentRun` metadata (agent name, success flag, attachments used).
- `docs/telemetry-contracts.md` documents the expanded schema; emitters are centralised through `useFlowStateTelemetry` with offline queue + opt-in flag.

## Testing & QA

- `pnpm typecheck`
- `pnpm lint`
- Manual verification: toggled `prefers-reduced-motion`, Flow Hub open/close, asset inbox attach flows, tracker refresh, authenticated EPK load (anonymous + signed-in). Visual spot-check for new lucide replacements and theme tokens.



