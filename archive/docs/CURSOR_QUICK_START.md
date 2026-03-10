# Cursor + Claude Code Quick Start

## 🎯 You Don't Need to Touch the Terminal!

Claude Code in Cursor handles all git operations for you automatically.

---

## 🚀 Opening Cursor (First Time)

Just open Cursor in this project directory. That's it.

---

## 💬 Starting a Conversation with Claude Code

### Option 1: Just Tell It What You Want
```
You: "I want to add email validation to the signup form"
```

Claude Code will automatically:
1. ✅ Check git status
2. ✅ Ask if you want to pull latest changes
3. ✅ Ask if you want to create a feature branch
4. ✅ Then implement your request

### Option 2: Simple "Ready to Work"
```
You: "Ready to work"
```

Claude Code will:
1. Check git status
2. Pull if needed
3. Ask what you want to work on

### Option 3: Be Specific
```
You: "Ready to work on fixing the API validation"
```

Claude Code will handle git and start working.

---

## 📋 That's Literally It

You don't need to:
- ❌ Open a terminal
- ❌ Remember git commands
- ❌ Run scripts manually
- ❌ Check if you're behind
- ❌ Create branches yourself

Claude Code does all of this automatically because:
- ✅ `.cursorrules` tells it to check git first
- ✅ `CLAUDE.md` has the mandatory workflow
- ✅ It reads these files on every conversation

---

## 🎨 Example Conversations

### Example 1: Adding a Feature
```
You: "I want to add a dark mode toggle"

Claude: "Let me check git status first..."
        [runs git status]
        "You're on main and 3 commits behind. Pull latest changes?"

You: "Yes"

Claude: [pulls changes]
        "Create a feature branch for dark mode?"

You: "Yes"

Claude: [creates branch feature/add-dark-mode]
        "I've created the branch. Now implementing dark mode toggle..."
        [implements feature]
        "Done! Shall I commit these changes?"

You: "Yes"

Claude: [commits with proper UK spelling, no emojis]
        "Committed and ready to push!"
```

### Example 2: Quick Fix
```
You: "Fix the typo in the header component"

Claude: [checks git]
        [pulls if needed]
        [fixes typo]
        "Fixed! The word 'optimise' was misspelled as 'optimize'.
         Shall I commit?"

You: "Yes"

Claude: [commits with proper message]
```

### Example 3: Following Conventions
```
You: "Add logging to the authentication flow"

Claude: [checks git]
        [sees LINTING_ISSUES.md mentions console.log cleanup]
        [sees you want proper logging]
        "I'll create a logger utility and use it instead of console.log,
         following the audit recommendations."
        [implements proper logging]
```

---

## 🛡️ Safety Built In

Claude Code automatically:
- ✅ Checks git before every task
- ✅ Warns you if behind remote
- ✅ Creates feature branches
- ✅ Uses UK spelling (optimise, colour)
- ✅ Avoids emojis in commits
- ✅ Follows ESLint rules (no `any` types)
- ✅ Formats with Prettier

You just focus on what you want to build!

---

## 📚 If You Want More Details

- **CLAUDE.md** - Complete project documentation
- **COMMIT_CONVENTIONS.md** - Commit message rules
- **WORKFLOW_GUIDE.md** - Detailed workflow (if you're curious)
- **LINTING_ISSUES.md** - Known issues to fix

But honestly, you can ignore all of these. Just talk to Claude Code and it handles everything.

---

## 🎉 Summary

**What you do:**
```
You: "Ready to work on [feature]"
```

**What Claude Code does:**
1. Checks git
2. Pulls if needed
3. Creates branch if needed
4. Implements your feature
5. Follows all conventions
6. Commits with proper messages
7. Ready to push

**You don't touch the terminal. Ever.**

---

**Last Updated:** October 2025
**Works in:** Cursor IDE with Claude Code
