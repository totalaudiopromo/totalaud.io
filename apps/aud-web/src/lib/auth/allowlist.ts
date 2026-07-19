/**
 * Beta access allowlist — temporary launch gate.
 *
 * While totalaud.io is in waiting-list mode, only explicitly allowed emails may
 * hold a usable session. This is enforced app-side (OAuth callback + requireAuth)
 * so it can't be left in the wrong state by a Supabase dashboard toggle.
 *
 * Activation is opt-in: the gate is DORMANT unless BETA_ALLOWLIST is set, so an
 * unconfigured or misconfigured deploy never accidentally locks everyone out.
 * Set BETA_ALLOWLIST to a comma-separated list of emails (case-insensitive) in
 * Vercel to switch it on. Clear it to reopen signups.
 *
 * Server-only — reads process.env directly so it stays usable in any server
 * context (route handlers, middleware-adjacent code) without pulling in the
 * full validated env.
 */

function parseAllowlist(): string[] {
  const raw = process.env.BETA_ALLOWLIST
  if (!raw) return []
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
