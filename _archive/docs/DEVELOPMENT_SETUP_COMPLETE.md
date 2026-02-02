# Development Setup Complete - totalaud.io

**Date**: October 2025
**Status**: ✅ Fully Configured for Claude Code + Cursor IDE

---

## 🎯 Overview

Your totalaud.io project is now fully configured with **two complementary configuration files** that work together to provide a seamless development experience:

1. **CLAUDE.md** - Comprehensive project documentation and workflow guide
2. **.cursorrules** - Automated behaviour rules for Cursor IDE + Claude Code

---

## 📋 Configuration Files

### 1. CLAUDE.md (Project Documentation)

**Purpose**: Human-readable documentation that explains the project, workflows, and conventions

**Contains**:
- ✅ Mandatory Git workflow (check → pull → branch)
- ✅ British English requirements
- ✅ Design system & style tokens
- ✅ Git & branch naming conventions
- ✅ Project overview & tech stack
- ✅ Code quality infrastructure
- ✅ Claude Code behaviour rules
- ✅ Quick start prompts for users
- ✅ Cursor-specific integration notes
- ✅ Current build phases (Phase 4.5)
- ✅ All implemented features documentation

**Used by**: Claude Code, developers, documentation reference

### 2. .cursorrules (Automation Rules)

**Purpose**: Machine-readable rules that automate Cursor IDE + Claude Code behaviour

**Contains**:
- ✅ Context preloading (specs, tokens, docs)
- ✅ File protection (read-only safeguards)
- ✅ Directory context mapping
- ✅ Design & motion token enforcement
- ✅ Behavioural automation rules
- ✅ Git workflow automation
- ✅ Active phase detection (4.5)
- ✅ Safety nets (never edit without context)
- ✅ Dependency management (pnpm)
- ✅ Cross-model handoff rules

**Used by**: Cursor IDE automation engine, Claude Code agent

---

## 🔄 How They Work Together

```
User: "Ready to work on landing page scroll effects"
    ↓
.cursorrules triggers:
    → Check git status
    → Load CLAUDE.md
    → Load specs/LANDING_PAGE_PHASE_4.5_SCROLLFLOW.md
    → Load packages/ui/tokens/motion.ts
    → Detect active phase: 4.5
    → Confirm working directory: apps/aud-web
    ↓
Claude Code reads CLAUDE.md:
    → Understands Phase 4.5 context
    → Loads design system tokens
    → Knows motion rules (120/240/400ms)
    → Understands Framer Motion requirement
    → Follows British spelling
    ↓
Claude implements changes:
    → Uses design tokens (#3AA9BE accent)
    → Applies motion tokens (cubic-bezier easing)
    → Mobile-first responsive design
    → Framer Motion for animations
    → British spelling in code/comments
    ↓
.cursorrules on_commit:
    → Run eslint --fix
    → Run prettier --write
    → Verify branch naming
    → Confirm British spelling
    ↓
Result: Clean, consistent, phase-aware code
```

---

## 🎨 Design System Enforcement

Both files enforce the same design system:

| Token | Value | Enforced By |
|-------|-------|-------------|
| Accent Colour | `#3AA9BE` | Both |
| Background | `#0F1113` | Both |
| Motion Fast | `120ms cubic-bezier(0.22,1,0.36,1)` | Both |
| Motion Normal | `240ms cubic-bezier(0.22,1,0.36,1)` | Both |
| Motion Slow | `400ms ease-in-out` | Both |
| Typography | Geist Sans / Geist Mono | Both |
| Spacing | 8px grid system | .cursorrules |
| Contrast | WCAG AA (≥4.5:1) | Both |

---

## 🚀 User Experience

### Starting Work

**What you say:**
```
"Ready to work on scroll flow improvements"
```

**What happens automatically:**

1. **.cursorrules** triggers `on_start` automation:
   - ✅ Checks git status
   - ✅ Loads CLAUDE.md
   - ✅ Loads active phase context (4.5)
   - ✅ Pulls latest from main if behind
   - ✅ Confirms working in apps/aud-web

2. **Claude Code** reads context:
   - ✅ Phase 4.5: Scroll Flow Enhancements
   - ✅ Focus: Landing page cinematic scroll
   - ✅ Target files: landing/page.tsx, ScrollFlow.tsx
   - ✅ Motion tokens: 120/240/400ms
   - ✅ Use Framer Motion (not CSS)

3. **Implementation** follows rules:
   - ✅ British spelling
   - ✅ Design tokens
   - ✅ Motion tokens
   - ✅ Mobile-first
   - ✅ Type-safe (no `any`)

4. **.cursorrules** `on_commit` automation:
   - ✅ ESLint fix
   - ✅ Prettier format
   - ✅ Branch naming verification
   - ✅ British spelling check

**Result**: You never touch the terminal. Everything is automated.

---

## 🧠 Active Phase Context

Both files know you're in **Phase 4.5**:

```yaml
# .cursorrules
active_phase:
  id: "4.5"
  name: "Scroll Flow Enhancements"
  focus_area: "Landing Page cinematic scroll experience"
  target_files:
    - "apps/aud-web/src/app/landing/page.tsx"
    - "apps/aud-web/src/components/ScrollFlow.tsx"
```

```markdown
# CLAUDE.md
| Phase | Focus | Status |
|-------|-------|--------|
| 4.5 | Scroll Flow Enhancements | 🔄 In Progress |
```

This means Claude Code **automatically prioritises**:
- Landing page scroll effects
- Framer Motion animations
- ScrollFlow component refinements
- 60fps performance target
- <250ms latency goal

---

## 🔒 Safety Features

### File Protection (.cursorrules)

Read-only files (unless explicitly requested):
- README.md
- LICENSE
- CHANGELOG.md
- docs/**
- public/**
- .env.local

### Safety Nets (.cursorrules)

Never do without explicit instruction:
- ❌ Edit without loading context
- ❌ Commit without confirmation
- ❌ Rewrite working animations
- ❌ Modify database schema
- ❌ Delete existing files
- ❌ Add emojis in commits
- ❌ Remove accessibility features

### Quality Gates (Both)

Every commit must:
- ✅ Pass ESLint (no `any` types)
- ✅ Pass Prettier (consistent formatting)
- ✅ Use British spelling
- ✅ Follow branch naming convention
- ✅ Include proper commit message format

---

## 📦 Dependency Management

**Package Manager**: pnpm (enforced by .cursorrules)
**Node Version**: >=18.17
**Workspace Filters**: aud-web, aud-api
**Auto-install**: Missing dependencies installed automatically

---

## 🎯 Quick Reference

### For Users

| Goal | Say This |
|------|----------|
| Start work | "Ready to work on [feature]" |
| Add feature | "Add magnetic CTA to landing page" |
| Fix issue | "Fix scroll blur timing" |
| Review | "Audit Framer Motion transitions" |
| Test | "Run lint and a11y checks" |

### For Claude Code

**Always do:**
1. Check git status first
2. Load CLAUDE.md + active phase context
3. Pull latest if needed
4. Create feature branch if needed
5. Follow design tokens
6. Use British spelling
7. Format + lint before commit

**Never do:**
- Edit without context
- Use CSS transitions (Framer Motion only)
- Hardcode media queries (Tailwind only)
- Add `any` types
- Skip accessibility checks
- Add emojis to commits

---

## 🧩 Cross-Model Compatibility

Both files support handoff between:
- Claude (Anthropic)
- GPT-4/GPT-5 (OpenAI)
- Atlas (Cursor)
- Other AI coding assistants

**Guaranteed consistency:**
- ✅ Motion tokens preserved
- ✅ Accent colours preserved
- ✅ British spelling maintained
- ✅ Phase context respected
- ✅ Design system enforced

---

## 📊 Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| CLAUDE.md | ✅ Complete | All sections from CURSOR_QUICK_START.md integrated |
| .cursorrules | ✅ Complete | Full automation rules configured |
| Design System | ✅ Enforced | Tokens in both files match |
| Git Workflow | ✅ Automated | Check → Pull → Branch → Commit |
| Phase Detection | ✅ Active | Phase 4.5 context loaded |
| Quality Gates | ✅ Configured | ESLint + Prettier + TypeScript |
| Safety Nets | ✅ Active | Protected files + behaviour rules |
| Documentation | ✅ Complete | All guides linked |

---

## 🎓 What This Means

**For You:**
- 🚀 Zero terminal usage required
- 🤖 Fully automated Git workflow
- 🎨 Guaranteed design consistency
- 📋 Phase-aware development
- ✅ Quality gates on every commit
- 🔒 Protected from accidental edits

**For Claude Code:**
- 📚 Full project context loaded automatically
- 🎯 Phase-aware prioritisation
- 🎨 Design token enforcement
- 🔄 Automated quality checks
- 🇬🇧 British spelling validation
- 🧠 Cross-session consistency

**For Your Team:**
- 📖 Clear documentation (CLAUDE.md)
- 🤝 Consistent code style
- 🎨 Enforced design system
- 🔒 Safe collaboration
- 🧩 Multi-model compatibility

---

## 🚀 Next Steps

Your development environment is **ready to use**. Simply:

1. Open project in **Cursor IDE**
2. Say: **"Ready to work on [feature]"**
3. Claude Code handles everything automatically

No terminal. No manual Git. No style inconsistencies.

**Just pure, focused development.**

---

**Last Updated**: October 2025
**Configuration**: CLAUDE.md + .cursorrules (v2)
**Status**: ✅ Production Ready
**Active Phase**: 4.5 - Scroll Flow Enhancements
