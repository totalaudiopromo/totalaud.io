## Description
This PR synchronises the Total.io platform with the latest launch readiness standards and incorporates the "nearly four decades" industry journey content. It focuses on timeline interactivity, onboarding persistence, and premium OpenGraph image rendering.

## Related Issue
Closes #68 (Onboarding persistence)

## Changes
- **Timeline & Threads**: Major refactor of `ThreadsPanel` for persistent visibility and improved transition logic. Updated `TimelineCanvas` and `EventCard` for better interaction feedback.
- **EPK & OG Engine**: Overhauled OG image generation and EPK layouts to ensure high-fidelity previews across all socials.
- **Onboarding**: Improved `OnboardingChat` with better state management and `ModeTour` integration.
- **Journey Content**: Integrated 30+ years of industry experience images and content into the landing page (`JourneyGallery` component).
- **Database**: Added `track_memory_v0.sql` migration for robust data persistence.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [x] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [x] Refactor (no functional changes, code improvements)
- [x] Documentation update

## Checklist
- [x] I have adhered to the conventional commit style in the PR title
- [x] I have used British English spelling throughout
- [x] I have added or updated tests where necessary
- [x] I have updated documentation as appropriate
- [x] I have run `pnpm lint` and `pnpm typecheck` locally and both pass

---

## �� Automated Review

This PR will be automatically reviewed by:

- **CodeRabbit** — AI code review focusing on quality, security, and best practices
- **Claude** — Auto-fixes CodeRabbit suggestions when possible

### Commands

| Command | Description |
|---------|-------------|
| `@coderabbitai review` | Request a fresh CodeRabbit review |
| `@coderabbitai summary` | Generate a PR summary |
| `@claude fix this` | Ask Claude to fix a specific comment |

### Auto-Fix Behaviour

When CodeRabbit identifies an issue, Claude will automatically:
1. Analyse the suggestion
2. Apply the fix if appropriate
3. Run lint and typecheck
4. Commit with a clear message

To disable auto-fix for a specific comment, include `[skip claude]` in your response.
