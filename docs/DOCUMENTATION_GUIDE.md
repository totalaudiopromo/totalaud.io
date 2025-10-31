# Documentation Organization Guide

**Status**: ✅ Automated system active (October 2025)

## 📊 Current State

**Before**: 72 markdown files cluttering the root directory
**After**: 4 essential files in root, everything else organized

## 🗂️ Directory Structure

```
totalaud.io/
├── README.md                    # Project overview (KEEP IN ROOT)
├── CLAUDE.md                    # Claude Code configuration (KEEP IN ROOT)
├── CHANGELOG.md                 # Version history (KEEP IN ROOT)
├── CONTRIBUTING.md              # Contribution guidelines (KEEP IN ROOT)
│
└── docs/
    ├── INDEX.md                 # Documentation index (start here!)
    │
    ├── guides/                  # Step-by-step tutorials (max 15)
    │   ├── GETTING_STARTED.md
    │   ├── QUICK_START.md
    │   ├── CURSOR_QUICK_START.md
    │   ├── BROWSER_AUTOMATION_GUIDE.md
    │   ├── VISUAL_CONTEXT_WORKFLOW.md
    │   ├── THEME_MOTION_GUIDE.md
    │   └── ...
    │
    ├── specs/                   # Technical specifications (max 10)
    │   ├── LANDING_PAGE_MYSTIQUE.md
    │   ├── WISPR_FLOW_ANALYSIS.md
    │   └── ...
    │
    ├── phases/                  # Current active phases ONLY (max 5)
    │   ├── LANDING_PAGE_PHASE_5_COMPLETE.md
    │   ├── PHASE_10_LAUNCH_READINESS.md
    │   ├── NEXT_STEPS.md
    │   └── ...
    │
    ├── troubleshooting/         # Problem-solving guides (max 10)
    │   ├── MCP_TROUBLESHOOTING.md
    │   ├── VERCEL_DEPLOYMENT_ISSUE.md
    │   └── ...
    │
    └── archive/                 # Completed phases & historical docs
        ├── LANDING_PAGE_PHASE_1_COMPLETE.md
        ├── STAGE_6_7_75_COMPLETION_SUMMARY.md
        └── ...
```

## 🎯 Organization Rules

### What Stays in Root

**ONLY 4 files** are allowed in the root directory:
- `README.md` - First thing people see
- `CLAUDE.md` - Claude Code configuration
- `CHANGELOG.md` - Version history
- `CONTRIBUTING.md` - How to contribute

**Everything else** must live in `docs/`

### Category Limits

To prevent documentation bloat:

| Category | Max Files | Purpose |
|----------|-----------|---------|
| `guides/` | 15 | Step-by-step tutorials and workflows |
| `specs/` | 10 | Technical specifications and designs |
| `phases/` | 5 | **Current active phases only** |
| `troubleshooting/` | 10 | Solutions to common issues |
| `archive/` | Unlimited | Historical documentation |

**When a category exceeds its limit**, archive older docs to `archive/`

### When to Archive

Move docs to `archive/` when:
- Phase is complete and no longer actively referenced
- Spec has been superseded by newer version
- Guide is outdated or replaced
- More than 3 months old and not actively used

**Golden Rule**: If you haven't looked at it in a month, archive it!

## 🤖 Automated Tools

### 1. Organization Script

**Run manually** or when starting a new phase:

```bash
pnpm docs:organize
```

**What it does**:
- Moves completed phase docs to `archive/`
- Categorizes guides, specs, troubleshooting docs
- Removes duplicate/obsolete files
- Creates/updates `docs/INDEX.md`
- Shows summary of changes

### 2. Validation Script

**Runs automatically** on pre-commit hook:

```bash
pnpm docs:validate
```

**What it checks**:
- Root directory only has 4 allowed files
- Category file limits not exceeded
- Warns about potential duplicates
- Exits with error if validation fails

### 3. Pre-Commit Hook

**Automatically runs** before every commit:

```bash
# Defined in .husky/pre-commit
1. Documentation validation (pnpm docs:validate)
2. Code linting (pnpm lint:fix)
3. Code formatting (pnpm format)
```

**If validation fails**, commit is blocked until fixed

## 📝 Adding New Documentation

### For New Features/Phases

1. **Create doc in appropriate category**:
   ```bash
   touch docs/phases/PHASE_11_NEW_FEATURE.md
   ```

2. **Write your documentation**

3. **Commit** (validation runs automatically):
   ```bash
   git add docs/phases/PHASE_11_NEW_FEATURE.md
   git commit -m "docs: Add Phase 11 specification"
   ```

### For Completed Phases

When a phase is complete:

1. **Move to archive**:
   ```bash
   mv docs/phases/PHASE_11_NEW_FEATURE.md docs/archive/
   ```

2. **Update INDEX.md** (or run `pnpm docs:organize`)

3. **Commit**:
   ```bash
   git add docs/
   git commit -m "docs: Archive completed Phase 11"
   ```

## 🧹 Manual Cleanup

If you accumulate too many docs:

```bash
# Full organization pass
pnpm docs:organize

# Check current state
pnpm docs:validate

# View organized structure
ls -la docs/*/
```

## 🚨 Troubleshooting

### "Disallowed file in root"

**Problem**: You created a `.md` file in the root directory

**Solution**:
```bash
# Run auto-organization
pnpm docs:organize

# Or manually move the file
mv YOUR_FILE.md docs/guides/  # or appropriate category
```

### "Too many files in [category]"

**Problem**: Category exceeds its limit

**Solution**:
```bash
# Review files in that category
ls -la docs/[category]/

# Move older files to archive
mv docs/[category]/OLD_FILE.md docs/archive/

# Verify
pnpm docs:validate
```

### Pre-commit hook blocking commit

**Problem**: Documentation validation failed

**Solution**:
```bash
# See what's wrong
pnpm docs:validate

# Fix automatically
pnpm docs:organize

# Try commit again
git commit -m "your message"
```

## 📚 Best Practices

1. **Start every session by reading `docs/INDEX.md`** - Quick reference to all docs

2. **One phase = One doc** - Don't create multiple docs for the same phase

3. **Archive aggressively** - If in doubt, archive it (you can always retrieve from git history)

4. **Update INDEX.md** - Run `pnpm docs:organize` after major changes

5. **British spelling** - All docs use British English (colour, behaviour, organise)

6. **Keep it minimal** - Less documentation is better than scattered documentation

## 🎯 Goals

- **Discoverability**: Find docs quickly via INDEX.md
- **Maintainability**: Auto-cleanup prevents sprawl
- **Clarity**: Clear categories, clear purposes
- **History**: Archive preserves context without cluttering

## 📊 Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Root `.md` files | 4 | ✅ 4 |
| Guides | ≤15 | ✅ 11 |
| Specs | ≤10 | ✅ 10 |
| Active phases | ≤5 | ✅ 5 |
| Troubleshooting | ≤10 | ✅ 7 |
| Archived docs | - | 27 |

---

**Last Updated**: October 27, 2025
**Automation Status**: ✅ Active (pre-commit hook + validation)
**Maintenance**: Auto-organized via `pnpm docs:organize`
