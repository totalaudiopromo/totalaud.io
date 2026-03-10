# Development Workflow Guide

## 🎯 Purpose

This guide ensures you can safely work between different environments (Claude Code CLI, Cursor IDE, local development) without breaking things.

---

## 🔄 The Golden Rule

**Always pull before you push:**
```bash
git pull origin main
```

This syncs your local code with GitHub and prevents conflicts.

---

## 🚀 Starting a New Work Session

### Option A: Using the Helper Script (Easiest)

```bash
./start-work.sh
```

This script will:
1. Stash any uncommitted changes
2. Pull latest changes from GitHub
3. Show recent commits
4. Create a new branch for your work
5. Restore stashed changes if needed

### Option B: Manual Steps

```bash
# 1. Check current status
git status

# 2. If you have uncommitted changes, stash them
git stash

# 3. Switch to main and pull latest
git checkout main
git pull origin main

# 4. Create a new branch for your work
git checkout -b feature/your-feature-name

# 5. Restore stashed changes (if any)
git stash pop
```

---

## 🏥 Health Check After Pulling Changes

Run this to ensure everything still works:

```bash
./check-health.sh
```

Or manually:

```bash
# 1. Install/update dependencies
pnpm install

# 2. Type check
pnpm typecheck

# 3. Run linter
pnpm lint

# 4. Test build
pnpm build --filter=aud-web
```

**What to do if checks fail:**
- Type check fails → TypeScript errors, review the errors
- Lint fails → Expected (240 known issues), see LINTING_ISSUES.md
- Build fails → Something broke, check the error messages

---

## 🤖 Working with Claude Code in Cursor

### How Claude Code Understands Your Project

When you ask Claude Code (in Cursor) to make changes, it will:

1. **Read your documentation:**
   - CLAUDE.md - Project overview
   - COMMIT_CONVENTIONS.md - Commit style
   - LINTING_ISSUES.md - Known issues
   - TECHNICAL_AUDIT_2025.md - Code quality status

2. **Follow established patterns:**
   - UK spelling (optimise, colour, behaviour)
   - No emojis in commit messages
   - ESLint rules (no `any` types, no console.log)
   - Prettier formatting

3. **See current code state:**
   - Whatever files are in your working directory
   - All recent changes you've pulled
   - New ESLint/Prettier configurations

### Asking Claude Code to Make Changes

**Good prompts:**
```
"Add validation to the /api/flows endpoint using Zod"
"Replace console.log with logger in BrokerChat component"
"Create a test for the useUserPrefs hook"
```

**What to include:**
- Specific file or feature to modify
- Reference to conventions (e.g., "following UK spelling")
- Whether to commit or just make changes

### Example Conversation

```
You: "I pulled the latest changes. Can you add Zod validation
      to apps/aud-web/src/app/api/flows/route.ts?"

Claude Code: [reads CLAUDE.md and LINTING_ISSUES.md]
             [sees you want to fix one of the audit issues]
             [creates validation, follows conventions]
             [commits with proper UK spelling, no emojis]
```

---

## 🔀 Branch Strategy

### When to Create a Branch

Always create a branch for:
- New features
- Bug fixes
- Refactoring
- Documentation updates

**Never commit directly to main** (unless it's a tiny typo fix).

### Branch Naming Convention

```
feature/add-user-authentication
fix/broken-oauth-flow
refactor/organize-components
docs/update-readme
chore/update-dependencies
```

### Example Workflow

```bash
# Starting new feature
git checkout main
git pull origin main
git checkout -b feature/add-email-validation

# Make changes...
git add .
git commit -m "feat(api): add email validation with Zod"

# Push to GitHub
git push origin feature/add-email-validation

# Create PR on GitHub web interface
```

---

## 🛡️ Preventing Conflicts

### Scenario 1: You Forgot to Pull

```bash
# You try to push but get an error:
# "Updates were rejected because the remote contains work..."

# Solution:
git pull origin main --rebase
# Resolve any conflicts if needed
git push origin your-branch-name
```

### Scenario 2: Merge Conflicts

```bash
# After pulling, you see:
# "CONFLICT (content): Merge conflict in file.ts"

# Solution:
1. Open the file with conflicts
2. Look for markers: <<<<<<< HEAD
3. Choose which changes to keep
4. Remove the conflict markers
5. git add file.ts
6. git commit -m "fix: resolve merge conflict"
```

### Scenario 3: Accidentally Committed to Main

```bash
# You committed to main instead of a branch

# Solution:
git branch feature/your-work      # Save your work
git reset --hard origin/main      # Reset main
git checkout feature/your-work    # Continue on branch
```

---

## 📋 Pre-Work Checklist

Before starting a new work session:

- [ ] Pull latest changes: `git pull origin main`
- [ ] Check health: `./check-health.sh` or manual checks
- [ ] Create branch: `git checkout -b feature/name`
- [ ] Review recent changes: `git log --oneline -5`
- [ ] Check documentation: Read CLAUDE.md, LINTING_ISSUES.md

---

## 🎨 Working in Different Environments

### Claude Code CLI (What we've been using)
- Terminal-based
- Good for: Quick fixes, automation, batch operations
- Commits directly when told to

### Cursor IDE with Claude Code
- Visual editor
- Good for: Complex changes, debugging, reviewing code
- You control when to commit

### Both Work Together!
- They read the same files
- Follow the same conventions
- Respect the same git workflow

**The key:** Always pull before starting work in either environment.

---

## 🚨 Emergency: "I Broke Something!"

### Step 1: Don't Panic

### Step 2: Check What Changed
```bash
git status              # See modified files
git diff               # See specific changes
git log --oneline -5   # See recent commits
```

### Step 3: Undo Changes

**Undo uncommitted changes:**
```bash
git restore file.ts              # Undo changes to one file
git restore .                    # Undo all changes
```

**Undo last commit (but keep changes):**
```bash
git reset --soft HEAD~1
```

**Undo last commit (discard changes):**
```bash
git reset --hard HEAD~1
```

**Go back to a specific commit:**
```bash
git log --oneline              # Find the commit hash
git reset --hard abc1234       # Replace with actual hash
```

### Step 4: Get Help
- Check the error message carefully
- Search for the error in LINTING_ISSUES.md
- Ask Claude Code to help debug

---

## 📚 Quick Reference Commands

```bash
# Start work
./start-work.sh                          # Use helper script
git pull origin main                      # Pull latest changes

# Check status
git status                                # See what changed
git log --oneline -5                      # Recent commits

# Create branch
git checkout -b feature/name              # New branch
git checkout existing-branch              # Switch branch

# Commit changes
git add .                                 # Stage all changes
git commit -m "feat: your message"        # Commit
git push origin branch-name               # Push to GitHub

# Health checks
./check-health.sh                         # Run all checks
pnpm lint                                 # Check linting
pnpm typecheck                            # Check types
pnpm build --filter=aud-web              # Test build

# Undo changes
git restore file.ts                       # Undo file changes
git reset --soft HEAD~1                   # Undo commit, keep changes
git reset --hard origin/main              # Nuclear option: reset to remote
```

---

## 🎓 Best Practices

1. **Pull before every work session**
2. **Always work on a branch**
3. **Commit frequently** (small, logical chunks)
4. **Write descriptive commit messages** (follow COMMIT_CONVENTIONS.md)
5. **Run health checks** after pulling changes
6. **Create PRs for review** before merging to main
7. **Keep main branch stable** (never break the build)

---

## 🤝 Working with AI Assistants

### Claude Code Understands:
- ✅ Your project structure (from CLAUDE.md)
- ✅ Your conventions (from COMMIT_CONVENTIONS.md)
- ✅ Known issues (from LINTING_ISSUES.md)
- ✅ Current code state (from your files)

### Claude Code Doesn't:
- ❌ Remember previous sessions
- ❌ Know about changes until you pull them
- ❌ Track your git branches automatically

### Solution:
Always start with: "I've pulled the latest changes" so Claude Code knows to work with the current state.

---

## 📞 Getting Help

**Common Questions:**

Q: "I pulled changes and now the build fails"
A: Run `./check-health.sh` to see what broke. Check LINTING_ISSUES.md for known issues.

Q: "I'm getting merge conflicts"
A: See "Scenario 2: Merge Conflicts" above.

Q: "Claude Code is suggesting old patterns"
A: Remind it: "Please follow the conventions in CLAUDE.md and use UK spelling"

Q: "I'm not sure if my changes will break things"
A: Run `pnpm build --filter=aud-web` before committing.

---

**Last Updated:** October 2025
**Status:** Active workflow guide
**Next Review:** When adding CI/CD pipeline
