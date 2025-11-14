# Telemetry Contracts — Phase 17

FlowCore telemetry is opt-in and only emits events when a creator enables the local preference `flowTelemetry=true`. Events buffer offline, are retried when a connection returns, and are sent to `/api/telemetry/batch` in batches of ≤50.

## Event Types

| Event | Metadata |
| ----- | -------- |
| `sessionStart` / `sessionEnd` | `{}` |
| `save` | `{ action?: string, [key: string]: unknown }` |
| `share` | `{ target?: string, [key: string]: unknown }` |
| `agentRun` | `{ agentName?: string, success?: boolean, attachmentsUsed?: number, [key: string]: unknown }` |
| `pitch_sent` | `{ campaignId?: string, contactName?: string, assetIds?: string[] }` |
| `tracker_update` | `{ campaignId?: string, logCount?: number, source?: string }` |
| `tabChange` | `{ fromTab?: string, toTab?: string }` |
| `idle` | `{ reason?: string }` |
| `dashboard_opened` | `{ campaignId?: string, period?: string | number, dataPoints?: number }` |
| `flow_hub_opened` | `{ period?: number }` |
| `flow_hub_tab_changed` | `{ tab?: string }` |
| `flow_brief_generated` | `{ period?: number, forceRefresh?: boolean, cached?: boolean }` |
| `epk_metrics_viewed` | `{ epkId?: string, groupBy?: string, eventCount?: number }` |
| `epk_asset_tracked` | `{ epkId?: string, assetId?: string, eventType?: string }` |
| `epk_collaborators_loaded` | `{ collaboratorCount?: number }` |
| `epk_invite_sent` | `{ role?: string, invitedEmail?: string, inviteId?: string }` |
| `epk_invite_revoked` | `{ inviteId?: string }` |
| `epk_collaborator_removed` | `{ collaboratorId?: string }` |
| `epk_comments_loaded` | `{ commentCount?: number }` |
| `epk_comment_created` | `{ hasParent?: boolean, commentId?: string }` |
| `epk_comment_updated` | `{ commentId?: string }` |
| `epk_comment_deleted` | `{ commentId?: string }` |

## Principles

- Telemetry never emits when offline; events queue locally until `navigator.onLine === true`.
- All metadata stays payload-light and omits PII. E-mail addresses are only emitted when a user explicitly sends an invite.
- Session lifecycle (`sessionStart`, `sessionEnd`) automatically triggers when the console mounts/unmounts.
- `save` remains the generic event for micro-actions (quick attach, palette actions) and includes an `action` string to differentiate behaviours.
- Agent workflows emit dedicated events: `agentRun` (success/failure), `pitch_sent`, and `tracker_update` to describe downstream activity without overloading `save`.

