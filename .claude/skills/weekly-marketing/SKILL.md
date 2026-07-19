---
name: weekly-marketing
description: One-command weekly marketing flywheel for totalaud.io - chains topic discovery, a quality-gated asset, and a founder social thread. Use when the user wants their weekly content produced end-to-end, or invokes /weekly-marketing.
aliases: ['weekly-content', 'content-flywheel']
---

# Weekly Marketing Flywheel

Chains the three highest-leverage marketing skills into one pass so a week's
content ships from a single command. Runs with **no external API keys** in its
default mode.

Pipeline: **topic brief -> quality-gated asset -> founder social thread**

Backed by three skills from `ericosiu/ai-marketing-skills`:
- `seo-ops` (topic + keyword brief)
- `content-ops` (recursive 90/100 expert-panel quality gate)
- `x-longform-post` (founder-voice thread with humaniser pass)

If those skills are installed, delegate each stage to them. If not, this file
carries enough of each stage's logic to run standalone.

## Brand rules (non-negotiable)

- British English throughout (colour, optimise, analyse, recognise, licence/license).
- Voice: "second opinion", "finishing notes", "what matters", "release with confidence".
- Never use: "AI-powered", "revolutionary", "game-changing", "agents", "leverage" (the verb), corporate SaaS filler.
- Decision support over automation. No hype.

## Inputs (ask once, then run)

1. **Focus** - agency PR, totalaud.io product, or a specific artist campaign.
2. **This week's angle** (optional) - a real event, data point, or opinion. If blank, Stage 1 proposes three.
3. **Primary channel** - blog, newsletter, or X (defaults to X thread + blog outline).

## Stage 1 - Topic brief (seo-ops)

If `seo-ops` is installed, run its trend scout + content attack brief for the
focus area and return the top striking-distance topic.

Standalone fallback:
- Propose 3 candidate angles tied to the focus. For each: the search intent it
  serves, the funnel stage (TOFU/MOFU/BOFU), and one specific proof point the
  piece must contain.
- Rank by (audience relevance x specificity of the proof) and pick one.
- Output a one-paragraph brief: working title, the single idea, the proof, the CTA.

Stop and show the brief. Do not proceed until the human picks/approves an angle.

## Stage 2 - Write and gate the asset (content-ops)

Draft the asset for the chosen channel from the Stage 1 brief.

Then run the quality gate. If `content-ops` is installed, pass the draft to it
(content type = the channel, offer context = the focus) and iterate to >=90/100.

Standalone fallback - score the draft 0-100 against this rubric, revise, repeat
up to 3 rounds, and refuse to pass anything under 90:
- **Specificity** - real numbers/examples, no vague claims.
- **Brand voice match** - hits the "what matters / release with confidence" register; zero banned words.
- **AI-detection (1.5x weight)** - no "This isn't X, it's Y", no "leverage/ecosystem/unlock", varied sentence length, no listicle scaffolding tells.
- **Clarity of the one idea** - a reader can restate the point in a sentence.
- **CTA** - one clear next step.

Show the final score and the asset. Log any human rejection as a rule for next time.

## Stage 3 - Founder social thread (x-longform-post)

Atomise the approved asset into a founder-voice X thread. If `x-longform-post`
is installed, delegate. Standalone fallback:
- Hook (contrarian, backed by a specific number) -> credibility line -> 2-3 problem/solution beats -> one uncomfortable truth -> payoff/CTA.
- Short declarative sentences. One monospace ASCII diagram under 40 chars wide.
- Run the same AI-detection pass from Stage 2; rewrite anything under 90.
- Split into numbered posts, ready to paste. No preamble.

## Final output

Return three artefacts in one message:
1. The topic brief (Stage 1).
2. The channel asset with its quality score (Stage 2).
3. The ready-to-paste X thread (Stage 3).

Nothing is sent anywhere. Everything is human-reviewed before it leaves.

## Money mode (higher ceiling, needs setup)

Once Instantly + a client-data source are wired, swap the chain to
`outbound-engine -> content-ops -> revenue-intelligence` for the PR agency:
draft the week's pitch campaign, gate every pitch to 90, then roll results into
a client report. Higher revenue proximity, but it does not run key-free - build
it once the outbound stack exists.
