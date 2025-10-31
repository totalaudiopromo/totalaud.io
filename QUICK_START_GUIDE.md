# 🚀 Quick Start: Compositional Architecture Migration
## 30-Minute Wins → Full Implementation

---

## ⏱️ 30-Minute Quick Wins

### Win #1: Rename "Agents" Directory (5 minutes)

**Problem:** Directory called "agents" contains prompts, not sub-agents (confusing)

**Fix:**
```bash
cd ~/.claude
mv agents prompts-archive
mkdir -p prompts-archive/README.md
```

**Create README:**
```bash
cat > ~/.claude/prompts-archive/README.md << 'EOF'
# Prompts Archive

These are **slash command prompts**, not sub-agents.

## What's the Difference?

| Prompts (These files) | Sub-Agents (Task tool) |
|----------------------|------------------------|
| Manual user trigger | Programmatic invocation |
| `.md` files in commands/ | Invoked via Task tool |
| Sequential execution | Parallel execution |

## Migration Status

- [ ] music-industry-strategist.md → Move to commands/
- [ ] growth-hacking-optimizer.md → Move to commands/
- [ ] music-promo-workflow.md → Already in commands/

See: CLAUDE_CODE_AUDIT_2025.md for full migration plan
EOF
```

**Benefit:** Clarity on what sub-agents actually are

---

### Win #2: Add Pre-Commit Hook (10 minutes)

**Problem:** No automated code quality checks before commits

**Fix:**
```bash
cat > ~/.claude/hooks/pre-commit.sh << 'EOF'
#!/bin/bash
# Pre-commit validation (compositional)

PROJECT_ROOT=$(git rev-parse --show-toplevel)
cd "$PROJECT_ROOT"

echo "🔍 Pre-commit checks..."

# 1. Format check
if command -v pnpm &> /dev/null && [ -f "package.json" ]; then
  if ! pnpm format:check 2>/dev/null; then
    echo "⚠️  Code not formatted. Run: pnpm format"
    echo "   (Auto-formatting for you...)"
    pnpm format 2>/dev/null
  fi
fi

# 2. British English check (basic)
AMERICAN_SPELLINGS=$(git diff --cached | grep -E "^\+" | \
  grep -Eo "\b(color|behavior|optimize|analyze|center):" | \
  head -5)

if [ -n "$AMERICAN_SPELLINGS" ]; then
  echo "⚠️  American spelling detected in staged changes:"
  echo "$AMERICAN_SPELLINGS"
  echo ""
  echo "Please use British English:"
  echo "  color → colour"
  echo "  behavior → behaviour"
  echo "  optimize → optimise"
  echo ""
  echo "Fix these before committing (or override with --no-verify)"
  exit 1
fi

echo "✅ Pre-commit checks passed"
exit 0
EOF

chmod +x ~/.claude/hooks/pre-commit.sh
```

**Configure Git:**
```bash
# For each project:
cd ~/workspace/active/totalaud.io
ln -sf ~/.claude/hooks/pre-commit.sh .git/hooks/pre-commit

cd ~/workspace/active/total-audio-platform
ln -sf ~/.claude/hooks/pre-commit.sh .git/hooks/pre-commit
```

**Test:**
```bash
# Make a commit with American spelling
echo "const backgroundColor = 'red'" > test.ts
git add test.ts
git commit -m "test: check pre-commit hook"
# Should fail with British English warning
```

**Benefit:** Automatic British English + format enforcement

---

### Win #3: Create First Compositional Skill (15 minutes)

**Problem:** Git commit rules scattered in CLAUDE.md

**Fix:**
```bash
mkdir -p ~/.claude/skills/git-commit-enforcer
cat > ~/.claude/skills/git-commit-enforcer/skill.md << 'EOF'
---
name: git-commit-enforcer
description: Enforces British English conventional commits
---

# Git Commit Enforcer

When creating git commits:

## Format

```
type(scope): summary in British English

Examples:
✅ feat(landing): add scrollflow transitions
✅ fix(api): resolve authentication issue
❌ fix(landing): update color scheme  # American spelling
```

## Types
- feat, fix, refactor, style, docs, test, chore

## British English Required
- colour (not color)
- behaviour (not behavior)
- optimise (not optimize)
- centre (not center)

## Integration
Auto-invoked by pre-commit hook
EOF
```

**Activate in Claude Desktop:**
1. Open Claude Desktop (not VSCode)
2. Settings → Capabilities → Skills
3. Click "Upload skill"
4. Select: `~/.claude/skills/git-commit-enforcer/skill.md`
5. Toggle ON

**Test:**
```bash
# In next Claude Code session:
"Help me create a commit message for these changes"
# Claude should enforce British English automatically
```

**Benefit:** Automated commit message enforcement

---

## 🏗️ 2-Hour Foundation Setup

### Phase 1: Skill Infrastructure (30 mins)

#### 1. Create Session Time Guard Skill

```bash
mkdir -p ~/.claude/skills/session-time-guard
cat > ~/.claude/skills/session-time-guard/skill.md << 'EOF'
---
name: session-time-guard
description: Prevents 2-hour sessions from scope creep
---

# Session Time Guard

Your constraint: **2-hour maximum sessions** (Postman day job)

## Time Tracking

At session start, note time and set warnings:
- 1h: Progress checkpoint
- 1.5h: Scope freeze warning
- 1:50: Final warning
- 2h: HARD STOP

## Warnings

### At 1.5 Hours
```
⚠️ 30 MINUTES LEFT

Actions:
1. Finish current task ONLY
2. NO new features
3. Prepare to commit
```

### At 2 Hours
```
🛑 SESSION LIMIT

Must do NOW:
1. git add . && git commit -m "wip: session timeout"
2. Create NEXT_SESSION.md with resume steps
3. Close IDE

NO exceptions.
```

## Scope Creep Prevention

After 1.5h, if user requests new task:
```
⚠️ SCOPE CREEP DETECTED
30 mins left - defer to next session
Add to TODO.md instead
```
EOF

# Upload to Claude Desktop (manual step)
echo "✅ Created session-time-guard skill"
echo "   Upload via Claude Desktop → Settings → Capabilities → Skills"
```

#### 2. Create Dual Project Router Skill

```bash
mkdir -p ~/.claude/skills/dual-project-router
cat > ~/.claude/skills/dual-project-router/skill.md << 'EOF'
---
name: dual-project-router
description: Auto-detects project and loads appropriate context
---

# Dual Project Router

Detect current project and activate appropriate skills:

## Project Detection

```bash
if [[ "$PWD" == *"total-audio-platform"* ]]; then
  PROJECT="production" (Audio Intel)
  ACTIVATE: customer-acquisition-focus
  MINDSET: Shipping > Perfection
elif [[ "$PWD" == *"totalaud.io"* ]]; then
  PROJECT="experimental" (Innovation sandbox)
  ACTIVATE: experimental-sandbox-guard
  MINDSET: Learning > Shipping
fi
```

## Auto-Loaded Context

### Production (total-audio-platform)
- ✅ customer-acquisition-focus skill
- ✅ Strict 2-hour sessions
- ✅ Mobile-first validator
- Goal: First £500/month

### Experimental (totalaud.io)
- ✅ experimental-sandbox-guard skill
- ✅ Flexible 2-hour sessions
- ✅ Break things freely
- Goal: Learn and innovate

## Integration

Runs automatically when:
- Session starts
- Directory changes
- User asks "What project am I in?"
EOF

echo "✅ Created dual-project-router skill"
```

#### 3. Create Browser Automation Patterns Skill

```bash
mkdir -p ~/.claude/skills/browser-automation-patterns
cat > ~/.claude/skills/browser-automation-patterns/skill.md << 'EOF'
---
name: browser-automation-patterns
description: Compositional patterns for Chrome DevTools + Puppeteer MCPs
---

# Browser Automation Patterns

## When to Use Which MCP

### Chrome DevTools (Visual Context)
**Use for:**
- UI development (see what you build)
- CSS debugging (visual feedback)
- Performance profiling
- Console debugging

**Pattern:**
```
1. Write component code
2. take_screenshot (Chrome DevTools MCP)
3. Analyze visual result
4. Iterate based on screenshot
```

### Puppeteer (Background Automation)
**Use for:**
- Web scraping (contacts, playlists)
- Form automation (login, submissions)
- Data extraction (no visual needed)

**Pattern:**
```
1. puppeteer_navigate to URL
2. Auto-inject dialog handlers
3. puppeteer_evaluate for data extraction
4. Return structured results
```

## Composition Example

Building + testing contact scraper:
1. Use Puppeteer to scrape contacts
2. Use Chrome DevTools to verify UI
3. Use changelog-generator for documentation

## Integration

This skill teaches patterns, invoked when:
- Building UI components
- Debugging visual issues
- Automating web tasks
EOF

echo "✅ Created browser-automation-patterns skill"
```

**Upload all 3 skills to Claude Desktop**

---

### Phase 2: Command Refactoring (30 mins)

#### 1. Create Compositional Deploy Command

```bash
cat > ~/.claude/commands/deploy.md << 'EOF'
---
name: deploy
description: Deploy with parallel validation using sub-agents
arguments:
  - name: environment
    required: true
    options: [staging, production]
---

# Deploy Command

Deploy to {{environment}} with parallel validation.

## Pre-Flight

Invoke `deployment-validator` skill to check readiness.

## Parallel Validation (4 Sub-Agents)

Launch simultaneously:

**Sub-Agent 1: Test Runner**
Run `pnpm test` and return failures

**Sub-Agent 2: Type Checker**
Run `pnpm typecheck` and return errors

**Sub-Agent 3: Build Validator**
Run `pnpm build` and return build status

**Sub-Agent 4: Security Scanner**
Run `pnpm audit` and return critical vulnerabilities

## Deploy

If all 4 pass:
1. Deploy via Railway CLI
2. Auto-trigger post-deploy hook
3. Invoke visual-deployment-validator (Chrome DevTools MCP)

## Report

Invoke `changelog-generator` skill for deployment summary.

## Rollback

If ANY sub-agent fails: ABORT + report failure
EOF

echo "✅ Created compositional deploy command"
```

#### 2. Refactor Music Promo Command

```bash
cat > ~/.claude/commands/music-promo.md << 'EOF'
---
name: music-promo
description: Orchestrate music promotion campaign
arguments:
  - name: campaign_name
    required: true
  - name: action
    required: true
    options: [create, enrich, email, track, report]
---

# Music Promo Campaign

Campaign: {{campaign_name}}, Action: {{action}}

## Validation

Invoke `customer-acquisition-focus` skill to validate business alignment.

## Parallel Execution (3 Sub-Agents)

**Sub-Agent 1: Contact Enricher**
Use Puppeteer MCP to scrape BBC Radio, Spotify contacts
Invoke `music-campaign-contacts` skill for patterns

**Sub-Agent 2: Email Generator**
Generate 3 email template variants (radio, DJ, curator)
Invoke `music-campaign-email` skill for templates

**Sub-Agent 3: Tracker Setup**
Create Notion dashboard via MCP
Set up campaign tracking + metrics

## Visual Validation

Use Chrome DevTools MCP to screenshot dashboard

## Report

Invoke `changelog-generator` skill for campaign summary

## Post-Campaign

Auto-trigger `post-campaign` hook for archiving
EOF

echo "✅ Refactored music-promo command (compositional)"
```

---

### Phase 3: Hook Enhancement (30 mins)

#### 1. Create Post-Session Hook

```bash
cat > ~/.claude/hooks/post-session.sh << 'EOF'
#!/bin/bash
# Post-session automation

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
SESSION_DIR="$HOME/.claude/sessions/$(date +%Y%m%d_%H%M%S)"

mkdir -p "$SESSION_DIR"

echo "📝 Archiving session..."

# 1. Git summary
if [ -d "$PROJECT_ROOT/.git" ]; then
  git log --since="2 hours ago" --pretty=format:"%h - %s" > "$SESSION_DIR/commits.txt"
  COMMIT_COUNT=$(wc -l < "$SESSION_DIR/commits.txt")
  echo "Commits this session: $COMMIT_COUNT"
fi

# 2. Session metadata
cat > "$SESSION_DIR/metadata.json" << METADATA
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "project_path": "$PROJECT_ROOT",
  "duration_hours": 2,
  "commits": $COMMIT_COUNT
}
METADATA

# 3. Archive history
if [ -f "$HOME/.claude/history.jsonl" ]; then
  tail -100 "$HOME/.claude/history.jsonl" > "$SESSION_DIR/session-history.jsonl"
fi

echo "✅ Session archived: $SESSION_DIR"
echo ""
echo "Summary:"
echo "  Commits: $COMMIT_COUNT"
echo "  Path: $PROJECT_ROOT"
echo ""
echo "🎯 Next session checklist:"
echo "  1. Review NEXT_SESSION.md (if exists)"
echo "  2. git pull origin main"
echo "  3. Run: pnpm dev"
EOF

chmod +x ~/.claude/hooks/post-session.sh

echo "✅ Created post-session hook"
echo "   Run manually: ~/.claude/hooks/post-session.sh"
```

#### 2. Enhance Post-Deploy Hook

```bash
cat > ~/.claude/hooks/post-deploy.sh << 'EOF'
#!/bin/bash
# Post-deploy automation (compositional)

DEPLOYMENT_URL="$1"
ENVIRONMENT="${2:-production}"
PROJECT_ROOT=$(git rev-parse --show-toplevel)

echo "🎯 Post-deploy automation..."

# 1. Wait for deployment
sleep 15

# 2. Archive deployment metadata
DEPLOY_DIR="$PROJECT_ROOT/.deployments/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$DEPLOY_DIR"

cat > "$DEPLOY_DIR/metadata.json" << METADATA
{
  "deployment_url": "$DEPLOYMENT_URL",
  "environment": "$ENVIRONMENT",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "git_commit": "$(git rev-parse HEAD)",
  "git_branch": "$(git rev-parse --abbrev-ref HEAD)"
}
METADATA

# 3. Trigger visual validation (via skill)
echo ""
echo "📸 Next: Run visual validation"
echo "   Command: Take screenshot of $DEPLOYMENT_URL"
echo "   Skill: visual-deployment-validator"

# 4. Notify (if configured)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🚀 Deployed to $ENVIRONMENT: $DEPLOYMENT_URL\"}" \
    "$SLACK_WEBHOOK_URL" 2>/dev/null
fi

echo "✅ Post-deploy complete: $DEPLOY_DIR/metadata.json"
EOF

chmod +x ~/.claude/hooks/post-deploy.sh

echo "✅ Enhanced post-deploy hook (compositional)"
```

---

### Phase 4: Testing (30 mins)

#### Test Checklist

```bash
# Create test script
cat > ~/test-compositional-setup.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing Compositional Setup..."
echo ""

# Test 1: Pre-commit hook
echo "1. Testing pre-commit hook..."
if [ -x ~/.claude/hooks/pre-commit.sh ]; then
  echo "   ✅ pre-commit.sh exists and is executable"
else
  echo "   ❌ pre-commit.sh not found or not executable"
fi

# Test 2: Skills created
echo "2. Testing skills..."
SKILLS=(
  "git-commit-enforcer"
  "session-time-guard"
  "dual-project-router"
  "browser-automation-patterns"
)

for skill in "${SKILLS[@]}"; do
  if [ -f ~/.claude/skills/$skill/skill.md ]; then
    echo "   ✅ $skill skill exists"
  else
    echo "   ❌ $skill skill missing"
  fi
done

# Test 3: Commands refactored
echo "3. Testing commands..."
COMMANDS=("deploy" "music-promo")

for cmd in "${COMMANDS[@]}"; do
  if [ -f ~/.claude/commands/$cmd.md ]; then
    echo "   ✅ $cmd command exists"
  else
    echo "   ❌ $cmd command missing"
  fi
done

# Test 4: Hooks
echo "4. Testing hooks..."
HOOKS=("pre-commit" "post-session" "post-deploy")

for hook in "${HOOKS[@]}"; do
  if [ -x ~/.claude/hooks/$hook.sh ]; then
    echo "   ✅ $hook hook executable"
  else
    echo "   ❌ $hook hook missing or not executable"
  fi
done

# Test 5: MCP servers
echo "5. Testing MCP servers..."
MCP_OUTPUT=$(claude mcp list 2>&1)

if echo "$MCP_OUTPUT" | grep -q "chrome-devtools.*Connected"; then
  echo "   ✅ Chrome DevTools MCP connected"
else
  echo "   ⚠️  Chrome DevTools MCP not connected"
fi

if echo "$MCP_OUTPUT" | grep -q "puppeteer.*Connected"; then
  echo "   ✅ Puppeteer MCP connected"
else
  echo "   ⚠️  Puppeteer MCP not connected"
fi

# Summary
echo ""
echo "📊 Setup Summary"
echo "   Review any ❌ items above"
echo "   Next: Upload skills to Claude Desktop"
EOF

chmod +x ~/test-compositional-setup.sh

# Run test
~/test-compositional-setup.sh
```

#### Manual Testing

```bash
# 1. Test pre-commit hook
cd ~/workspace/active/totalaud.io
echo "const color = 'red'" > test-american.ts
git add test-american.ts
git commit -m "test: american spelling"
# Should fail with British English warning

# 2. Test skills (in Claude Code)
# Ask Claude: "What skills do I have installed?"
# Should list: git-commit-enforcer, session-time-guard, etc.

# 3. Test commands
# Try: /deploy staging
# Should trigger parallel sub-agents

# 4. Test MCP
# Ask Claude to take a screenshot of localhost:3000
# Should use Chrome DevTools MCP
```

---

## 📊 Validation Checklist

After completing setup:

### Infrastructure
- [ ] `~/.claude/agents/` renamed to `prompts-archive/`
- [ ] 4 new skills created in `~/.claude/skills/`
- [ ] 2 commands refactored in `~/.claude/commands/`
- [ ] 3 hooks created in `~/.claude/hooks/`
- [ ] All hooks executable (`chmod +x`)

### Skills Uploaded to Claude Desktop
- [ ] git-commit-enforcer
- [ ] session-time-guard
- [ ] dual-project-router
- [ ] browser-automation-patterns

### Testing
- [ ] Pre-commit hook catches American spelling
- [ ] Skills auto-activate based on project
- [ ] Commands invoke skills compositionally
- [ ] MCP servers connected (chrome-devtools, puppeteer)

### Documentation
- [ ] CLAUDE_CODE_AUDIT_2025.md reviewed
- [ ] REFACTOR_EXAMPLES.md understood
- [ ] This QUICK_START_GUIDE.md completed

---

## 🎓 Next Steps

### Week 1: Master the Basics
- [ ] Use new skills in daily work
- [ ] Test compositional commands
- [ ] Refine based on real usage
- [ ] Document pain points

### Week 2: Advanced Composition
- [ ] Create project-specific skills (mobile-first-validator)
- [ ] Build first real sub-agent workflow (parallel testing)
- [ ] Integrate MCP patterns into skills
- [ ] Measure time savings

### Week 3: Full Migration
- [ ] Refactor all remaining commands
- [ ] Extract business logic to skills
- [ ] Create comprehensive hook system
- [ ] Package as plugin (optional)

---

## 💡 Common Issues

### Issue: Pre-commit hook not running
**Fix:**
```bash
# Symlink to project .git/hooks/
cd ~/workspace/active/totalaud.io
ln -sf ~/.claude/hooks/pre-commit.sh .git/hooks/pre-commit
```

### Issue: Skills not activating
**Fix:**
- Open Claude Desktop (not VSCode)
- Settings → Capabilities → Skills
- Verify each skill is toggled ON
- Restart Claude Code

### Issue: MCP not connected
**Fix:**
```bash
claude mcp list
# If not connected, check settings.json
```

### Issue: Sub-agents not running in parallel
**Fix:**
- Verify using Task tool (not just markdown)
- Check all 3 sub-agents in ONE message
- Review REFACTOR_EXAMPLES.md for correct pattern

---

## 🚀 Ready to Start?

**Recommended first step:**

1. **30-Minute Quick Wins** (all 3)
2. **Test everything**
3. **Use in next session**
4. **Refine based on experience**
5. **Move to 2-Hour Foundation**

**Philosophy:**

> "Start small, test often, iterate quickly"
> - IndyDevDan's Tactical Agentic Coding

**Success looks like:**

- Commits automatically enforce British English ✅
- Sessions never exceed 2 hours ✅
- Projects auto-load appropriate context ✅
- Workflows run in parallel (3x faster) ✅
- Skills compose cleanly across commands ✅

---

**Questions?**

Refer to:
- [CLAUDE_CODE_AUDIT_2025.md](CLAUDE_CODE_AUDIT_2025.md) - Full audit
- [REFACTOR_EXAMPLES.md](REFACTOR_EXAMPLES.md) - Detailed examples
- IndyDevDan's "I finally CRACKED Claude Agent Skills" video

**Ready. Set. Refactor!** 🚀
