# TAP API Reference

> Companion document to the public **TAP for AI Agents** post on [totalaudiopromo.com](https://totalaudiopromo.com/blog/tap-for-ai-agents). This reference is the canonical, corrected source -- it supersedes the published blog where the two disagree.

The Total Audio Platform (TAP) API is an AI-agent-native interface for music promotion: contact discovery and enrichment, pitch generation, outcome tracking, and an action queue for daily prioritisation. This document defines the resource shapes, conventions, and behaviours that every endpoint and SDK must honour.

---

## Base URL

Use the dedicated API subdomain. Do not use a path-prefixed form -- the `/api/` segment is redundant when the host's sole purpose is an API.

```
https://api.totalaudiopromo.com/v1/...
```

The legacy `https://totalaudiopromo.com/api/v1/...` form remains routable for existing integrations, but new code must use the subdomain.

---

## Authentication

All requests authenticate with a TAP API key passed as a bearer token:

```
Authorization: Bearer tap_ak_<token>
```

### Key format

API keys use a double-segment, type-identifying prefix:

| Prefix | Token type |
|--------|-----------|
| `tap_ak_` | API key (server-to-server, agent integrations) |
| `tap_wh_` | Webhook signing secret (reserved) |

The prefix is human-readable in logs, code reviews, and environment dumps, and is recognised by secret-scanning tools. Treat the entire key as secret -- only the prefix should ever be logged.

### Scopes

Scopes use a uniform `resource:action` shape across the entire API. Wildcards are accepted but should be reserved for trusted automation.

```json
[
  "contacts:read",
  "contacts:write",
  "contacts:enrich",
  "emails:validate",
  "campaigns:read",
  "campaigns:write",
  "pitches:read",
  "pitches:write",
  "outcomes:read",
  "outcomes:write",
  "*"
]
```

Bare-verb scopes (`validate`, `enrich`) from earlier drafts are deprecated -- use the `resource:action` form. Each scope grants the documented operations on its resource and nothing more; least-privilege keys are encouraged.

---

## Resource IDs

Every resource carries a prefixed string ID. The prefix lets developers and AI agents distinguish resource types at a glance in logs, error messages, and SDK responses without consulting the schema.

| Resource | Prefix | Example |
|----------|--------|---------|
| Contact | `ctc_` | `ctc_a1b2c3d4` |
| Campaign | `cmp_` | `cmp_e5f6g7h8` |
| Pitch | `pch_` | `pch_i9j0k1l2` |
| Outcome | `out_` | `out_m3n4o5p6` |
| Enrichment job | `enj_` | `enj_q7r8s9t0` |
| Action queue item | `act_` | `act_u1v2w3x4` |

Prefixes are short (under 7 characters excluding the underscore), memorable, and consistent across paired resources. Numeric or bare UUID IDs are not used on any public resource.

---

## Resource type identifier

Every resource response includes a read-only `object` field that names the resource type. SDKs use this to look up the deserialisation class; AI agents use it to dispatch on heterogeneous collections (such as the action queue).

```json
{
  "id": "ctc_a1b2c3",
  "object": "contact",
  "name": "Jo Smith",
  "outlet": "BBC Radio 6 Music",
  "created": 1712000000
}
```

The field name is `object` everywhere -- it is never `type`, `kind`, `resource_type`, or any other variant. The value is stable for the life of the resource.

---

## Dates and timestamps

| Kind | Representation | Example |
|------|----------------|---------|
| Datetime | Unix integer seconds since epoch | `1712003600` |
| Date-only | ISO 8601 `YYYY-MM-DD` string | `"2026-04-01"` |

Timestamp fields follow the `<verb>ed_at` convention (`enriched_at`, `imported_at`, `pitched_at`, `last_contacted_at`). The single exception is the resource creation timestamp, which is named `created` -- not `created_at` -- consistently across every resource.

`updated` / `updated_at` fields are not exposed on resources: non-user-facing changes can move them and trigger confusing webhook payloads.

---

## Pagination

All list endpoints use cursor-based pagination. Offset pagination is not supported; unbounded list responses are not returned.

### Request

```
GET /v1/contacts?limit=25&starting_after=ctc_abc
```

| Parameter | Type | Default | Maximum |
|-----------|------|---------|---------|
| `limit` | integer | 25 | 100 |
| `starting_after` | resource ID | -- | -- |
| `ending_before` | resource ID | -- | -- |

### Response

```json
{
  "object": "list",
  "data": [
    { "id": "ctc_abc", "object": "contact", "...": "..." }
  ],
  "has_more": true,
  "next_cursor": "ctc_xyz",
  "url": "/v1/contacts"
}
```

`next_cursor` is the ID of the last item in `data` (suitable for passing to `starting_after` on the next call). `has_more` is `true` when more items exist after the cursor. Each list endpoint documents its specific `limit` ceiling.

---

## Errors

All error responses use a consistent envelope with appropriate HTTP status codes.

### Envelope

```json
{
  "error": {
    "message": "The email at contacts[3] failed SMTP validation.",
    "type": "invalid_request_error",
    "code": "email_undeliverable",
    "param": "contacts[3].email"
  }
}
```

| Field | Description |
|-------|-------------|
| `message` | Human-readable explanation, suitable for logs and end-user surfacing. |
| `type` | Error category (`invalid_request_error`, `authentication_error`, `permission_error`, `rate_limit_error`, `api_error`). |
| `code` | Optional machine-readable identifier for conditions clients may want to handle programmatically (`email_disposable`, `duplicate_contact`, `email_undeliverable`). |
| `param` | Optional path to the offending field in the request body, including array indices. |

### Status codes

| Status | Meaning |
|--------|---------|
| 400 | Malformed request (bad JSON, missing required field) |
| 401 | Authentication failed (missing or invalid `Authorization` header) |
| 403 | Authenticated but insufficient scope for the requested operation |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate idempotency key with different payload) |
| 422 | Semantic validation failed (well-formed but business-rule violation) |
| 429 | Rate limit exceeded |
| 500 | Server-side failure not resolvable by the client |
| 503 | Upstream provider unavailable |

### Batch endpoint partial failures

Batch endpoints (bulk import, bulk validation) return a per-item `errors` array. Successful items are summarised at the top level; failed items reference their request index.

```json
{
  "object": "contact_import_result",
  "imported": 498,
  "errors": [
    { "index": 3, "code": "email_invalid", "message": "Email is missing a top-level domain." },
    { "index": 47, "code": "duplicate_contact", "message": "A contact with this email already exists." }
  ]
}
```

---

## Idempotency

Mutating endpoints accept an `Idempotency-Key` header (any unique client-generated string, max 255 characters). Replays within 24 hours return the original response. This is especially important for the bulk contact import endpoint, where retries must not produce duplicate records:

```
POST /v1/contacts
Idempotency-Key: 7f3c1e9a-...
```

Retrying with the same key but a different payload returns `409 Conflict` with `code: "idempotency_key_reuse"`.

---

## Dry-run mode

Mutating endpoints support `dry_run=true` (query string or body, depending on the endpoint). When set, the request is fully validated -- including business rules and external lookups where safe -- but no data is written. The response shape mirrors the non-dry-run shape, with an additional top-level `dry_run: true` field. Dry-run is the recommended way to validate a 500-contact import payload before committing it.

---

## Resources

### Contact

```json
{
  "id": "ctc_a1b2c3",
  "object": "contact",
  "name": "Jo Smith",
  "email": "jo@example.com",
  "outlet": "BBC Radio 6 Music",
  "role": "Presenter",
  "genres": ["indie", "alternative"],
  "last_contacted_at": 1711900000,
  "imported_at": 1711800000,
  "enriched_at": 1712003600,
  "enrichment": {
    "role_detail": "Presenter and producer",
    "submission_guidelines": "Email only, no attachments",
    "best_timing": "Tuesday morning",
    "bbc_station": "BBC Radio 6 Music"
  },
  "created": 1711800000
}
```

### Campaign

```json
{
  "id": "cmp_e5f6g7h8",
  "object": "campaign",
  "name": "Summer single rollout",
  "artist_name": "Lonely Pilots",
  "status": "active",
  "platform": "radio",
  "start_date": "2026-04-01",
  "end_date": "2026-06-30",
  "created": 1711000000
}
```

### Pitch

```json
{
  "id": "pch_i9j0k1l2",
  "object": "pitch",
  "contact": "ctc_a1b2c3",
  "campaign": "cmp_e5f6g7h8",
  "subject": "New single from Lonely Pilots",
  "body": "...",
  "pitched_at": 1712100000,
  "created": 1712050000
}
```

### Outcome

Outcomes log the result of a pitch. `status` is a closed enum -- free-form strings are rejected.

```json
{
  "id": "out_m3n4o5p6",
  "object": "outcome",
  "contact": "ctc_a1b2c3",
  "campaign": "cmp_e5f6g7h8",
  "pitch": "pch_i9j0k1l2",
  "status": "added",
  "logged_at": 1712200000,
  "created": 1712200000
}
```

| `status` value | Meaning |
|---------------|---------|
| `pending` | Awaiting outcome (default) |
| `replied` | Recipient responded but did not commit |
| `added` | Track added to playlist / show / publication |
| `declined` | Recipient declined |
| `no_response` | No reply within the configured window |

Adding new values is a documented, managed change. Clients should treat unknown values as `pending` for forward compatibility.

---

## Enrichment

Enrichment is a custom method on the contact resource -- not a top-level resource and not a magic update. It produces up to 14 data points per contact and is rate-limited to 50 contacts per request.

```
POST /v1/contacts/{id}/enrich
```

The response is the updated contact, with the enrichment data nested in a subdocument. Subdocument nesting keeps future data points additive: new fields land in `contact.enrichment.*` without breaking existing consumers.

```json
{
  "id": "ctc_a1b2c3",
  "object": "contact",
  "name": "Jo Smith",
  "enrichment": {
    "role_detail": "Presenter and producer",
    "genres": ["indie", "alternative"],
    "submission_guidelines": "Email only, no attachments",
    "best_timing": "Tuesday morning",
    "bbc_station": "BBC Radio 6 Music",
    "enriched_at": 1712003600
  },
  "created": 1711800000
}
```

### Bulk enrichment

`POST /v1/contacts/enrich` accepts up to 50 contact IDs and runs synchronously when the workload fits within the request budget; otherwise it returns a `202 Accepted` with an enrichment job:

```json
{
  "id": "enj_q7r8s9t0",
  "object": "enrichment_job",
  "status": "running",
  "contact_count": 50,
  "created": 1712003600
}
```

Poll `GET /v1/enrichment_jobs/{id}` or subscribe to the `enrichment.completed` webhook.

---

## Action queue

The action queue surfaces today's prioritised follow-ups, stale contacts, and pending pitches. Items are heterogeneous, so each item carries a `type` discriminator and a type-specific subdocument with the keys appropriate to that type.

```
GET /v1/action_queue
```

```json
{
  "object": "list",
  "data": [
    {
      "id": "act_u1v2w3x4",
      "object": "action_queue_item",
      "type": "follow_up",
      "priority": 1,
      "follow_up": {
        "contact": "ctc_a1b2c3",
        "pitch": "pch_i9j0k1l2",
        "due_at": 1712200000
      }
    },
    {
      "id": "act_y5z6a7b8",
      "object": "action_queue_item",
      "type": "stale_contact",
      "priority": 2,
      "stale_contact": {
        "contact": "ctc_def",
        "last_contacted_at": 1710000000
      }
    },
    {
      "id": "act_c9d0e1f2",
      "object": "action_queue_item",
      "type": "pending_pitch",
      "priority": 3,
      "pending_pitch": {
        "pitch": "pch_ghi",
        "contact": "ctc_jkl"
      }
    }
  ],
  "has_more": false,
  "next_cursor": null,
  "url": "/v1/action_queue"
}
```

| `type` value | Subdocument key | Meaning |
|--------------|-----------------|---------|
| `follow_up` | `follow_up` | A pitch is due for follow-up today |
| `stale_contact` | `stale_contact` | Contact has not been engaged within the staleness window |
| `pending_pitch` | `pending_pitch` | A pitch was generated but not yet sent |

If a future `type` has no type-specific properties, the subdocument is still present as `{}` so consumers can rely on the invariant that every `type` has a corresponding key.

---

## MCP server

The TAP MCP server authenticates with a TAP API key -- the same key used for REST. It does not require, and must not be configured with, raw database credentials. Earlier drafts that exposed `TAP_SUPABASE_URL` / `TAP_SUPABASE_KEY` are deprecated and unsupported; configurations using those variables will be rejected.

```json
{
  "mcpServers": {
    "tap": {
      "command": "npx",
      "args": ["-y", "@total-audio/tap-mcp"],
      "env": {
        "TAP_API_KEY": "tap_ak_your_key_here"
      }
    }
  }
}
```

This keeps a single auth model across REST and MCP, applies the same scope and rate-limit enforcement to both paths, and decouples MCP consumers from infrastructure decisions.

---

## Conventions reference

| Area | Rule |
|------|------|
| Resource IDs | Prefixed strings, under 7 chars + `_`, never numeric or bare UUID |
| Type discriminator | `object` field on every resource, stable string |
| Datetimes | Unix integer seconds, named `<verb>ed_at` |
| Date-only | ISO 8601 `YYYY-MM-DD` |
| Creation field | `created` (no `_at`) |
| Updates | No `updated` / `updated_at` exposed |
| Pagination | Cursor-based with `has_more` + `next_cursor` |
| Scopes | `resource:action` form throughout |
| Enums | Closed sets with documented values; default value always explicit |
| Booleans for state | Avoided -- prefer enums for extensibility |
| Custom methods | `<resource>/{id}/<verb>` for state transitions with side effects |
| Subdocuments | Nest related fields rather than flatten |
| Errors | `{ error: { message, type, code, param } }` envelope |
| Status codes | 4xx user-resolvable, 5xx server-side |
| Batch errors | Per-item `errors` array with `index` |
| Idempotency | `Idempotency-Key` header on mutating endpoints |
| Dry-run | `dry_run=true` on mutating endpoints |
| Auth | `Authorization: Bearer tap_ak_...` |
| Base URL | `https://api.totalaudiopromo.com/v1/` |

---

**Source of truth.** Where the public blog post on totalaudiopromo.com disagrees with this reference, this reference wins. The blog will be updated to match.
