# &ldquo;Get Live&rdquo; Audit &mdash; totalaud.io

## 1. Executive Summary

**Status:** **READY TO DEPLOY** (Soft Launch Mode)

The `apps/aud-web` application is structurally sound, verified, and configured for a safe "Soft Launch".
- **Primary Entrance:** The "Coming Soon" page (default).
- **Secondary Entrance:** Auth routes (`/login`, `/workspace`, `/signup`) are UNBLOCKED and functional.
- **Safety:** Server-side auth checks protect private routes.

**Final Verdict:** The codebase is ready. Run the RLS checklist, then deploy.

---

## 2. What We Fixed (Since Initial Audit)

| Blocker | Status | Fix |
| :--- | :--- | :--- |
| **Middleware Gating** | **RESOLVED** | `GATED_ROUTES` emptied in `middleware.ts`. Auth routes are now reachable. |
| **Auth/RLS Leaks** | **RESOLVED** | Added server-side auth redirects to `workspace/layout.tsx` and `console/layout.tsx`. |
| **Email Confusion** | **RESOLVED** | Verified distinct Form IDs for `totalaud.io` (Waitlist) vs `totalaudiopromo` (Newsletter). |
| **Pricing Link** | **HIDDEN** | Comms removed from Coming Soon page for softer launch. |

---

## 3. Final Pre-Flight Checklist

### A. Database (Critical)
1.  **RLS Verification:** Run the SQL snippets from `docs/DEPLOY_RLS_CHECKLIST.md` in Supabase Dashboard.
    *   *Must confirm: Anon user sees 0 rows.*
2.  **Migrate:**
    ```bash
    pnpm db:migrate
    # or
    supabase db push
    ```

### B. Environment (Railway)
1.  **Check URLs:** Ensure `NEXT_PUBLIC_APP_URL` = `https://totalaud.io`.
2.  **Check Kit:** Ensure `NEXT_PUBLIC_CONVERTKIT_FORM_ID` matches the intended list (verified as differing from default promo list).

### C. Deploy
1.  **Deploy:** Push to main branch (Railway/Vercel triggers).
2.  **Smoke Test:**
    -   **Guest:** Visit https://totalaud.io -> See "Coming Soon" (Waitlist only).
    -   **Guest:** Visit https://totalaud.io/login -> See Login Form.
    -   **Member:** Log in -> Redirect to `/workspace`.
    -   **Member:** Visit `/console` -> See Dashboard.

---

## 4. Rollback Plan

If critical failure occurs (e.g. infinite redirect loops or RLS failure):
1.  **Revert:** Use "Instant Rollback" in deployment provider.
2.  **Lock:** Edit `middleware.ts` to re-add `['/workspace', '/login']` to `GATED_ROUTES` and redeploy.
