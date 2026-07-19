/**
 * Beta access allowlist — temporary launch gate.
 *
 * While totalaud.io is in waiting-list mode, only allowed emails may hold a
 * usable session. Enforced app-side (OAuth callback + requireAuth) so it can't
 * be left in the wrong state by a Supabase dashboard toggle.
 *
 * The gate ships ON with a built-in DEFAULT_ALLOWLIST (the beta testers), so a
 * deploy with no configuration still pauses public signups. Control it via the
 * BETA_ALLOWLIST env var:
 *   - unset            → use DEFAULT_ALLOWLIST (gate ON)
 *   - "a@x.com,b@y.com" → use exactly that list (extend/replace testers)
 *   - "off" | "*" | ""  → reopen signups (gate OFF, everyone allowed)
 *
 * Server-only — reads process.env directly so it stays usable in any server
 * context without pulling in the full validated env.
 */

// Built-in beta testers. Extend by setting BETA_ALLOWLIST in Vercel.
const DEFAULT_ALLOWLIST = ['sadactmusic@gmail.com', 'schofield.christopher@gmail.com']

// Explicit values that reopen signups (case-insensitive).
const DISABLE_TOKENS = new Set(['', 'off', '*'])

function parseAllowlist(): string[] {
  const raw = process.env.BETA_ALLOWLIST
  if (raw === undefined) return [...DEFAULT_ALLOWLIST]

  const trimmed = raw.trim().toLowerCase()
  if (DISABLE_TOKENS.has(trimmed)) return [] // explicit reopen

  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * True when the beta gate is switched on (BETA_ALLOWLIST is set and non-empty).
 * When false, every authenticated user is allowed through.
 */
export function isAllowlistActive(): boolean {
  return parseAllowlist().length > 0
}

/**
 * Whether an email may hold a usable session. Returns true for everyone when the
 * gate is dormant; otherwise only for emails on the list.
 */
export function isEmailAllowed(email: string | null | undefined): boolean {
  const list = parseAllowlist()
  if (list.length === 0) return true // gate dormant — allow all
  if (!email) return false
  return list.includes(email.trim().toLowerCase())
}
