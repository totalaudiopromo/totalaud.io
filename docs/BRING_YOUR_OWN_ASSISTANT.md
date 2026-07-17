# Bring your own assistant

totalaud.io exposes an MCP endpoint so an artist's own AI assistant can read
their workspace. Agent-native, consent-scoped, read-mostly
(docs/ROADMAP_2026.md Phase 6; architecture principles in
docs/STRATEGY_2026.md).

## Connecting

1. In **Settings → Bring your own assistant**, create a personal access
   token. It is shown once; only its SHA-256 hash is stored.
2. Point any MCP-capable client at the endpoint with the token as a bearer
   token:

   - Endpoint: `https://totalaud.io/api/mcp` (streamable HTTP, stateless)
   - Header: `Authorization: Bearer aud_pat_…`

   Claude Desktop example (custom connector): add a remote MCP server with
   that URL and bearer token.

3. Revoke a token any time from the same settings section. Revocation is
   immediate.

## What the assistant can do

| Tool | Access | What it returns |
|------|--------|-----------------|
| `get_timeline` | read | Recent and upcoming release timeline events |
| `get_finishing_notes` | read | Recent finishing notes from Finish |
| `get_follow_ups` | read | The TAP follow-up queue (degrades gracefully without TAP) |
| `get_pitch_drafts` | read | Saved pitch drafts and their sections |
| `add_timeline_event` | write | Adds one timeline event, tagged `assistant` |

## Trust boundaries

- Nothing here can send anything on the artist's behalf; the single write
  tool only adds a timeline event.
- Audio never leaves the artist's device, so it cannot be read here either.
- Tokens are per-artist, revocable, and capped at five active at once.
- Requests without a valid token get a 401 and no information.

## Implementation notes

- Route: `apps/aud-web/src/app/api/mcp/route.ts` (hand-rolled JSON-RPC,
  protocol `2025-06-18`, no server-initiated streams).
- Tokens: `user_api_tokens` table (hash + last four characters only),
  helpers in `apps/aud-web/src/lib/api/tokens.ts`, management routes under
  `/api/tokens`.
