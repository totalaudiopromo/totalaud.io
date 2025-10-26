# MCP Troubleshooting Guide - totalaud.io

**Status**: Quick reference for common MCP issues
**Date**: October 2025

---

## 🔧 Common Issues & Solutions

### Issue 1: "Not connected" Error

**Symptom:**
```
Error: Not connected
```

**Cause:** Chrome DevTools MCP browser instance was terminated or never started

**Solution:**
1. The MCP server should auto-reconnect
2. If it doesn't, restart Claude Code/Cursor
3. Or manually restart MCP: Close and reopen Cursor

---

### Issue 2: "Browser already running" Error

**Symptom:**
```
The browser is already running for /Users/.../.cache/chrome-devtools-mcp/chrome-profile
```

**Cause:** Multiple Chrome DevTools MCP instances trying to use same profile

**Solution:**
```bash
# Kill existing Chrome DevTools process
pkill -f "chrome-devtools-mcp"

# Wait 2 seconds for cleanup
sleep 2

# MCP will auto-restart on next tool use
```

---

### Issue 3: Still Getting Permission Prompts

**Symptom:** Claude Code still asks "Allow?" for MCP tools

**Cause:** Settings not loaded or Claude Code not restarted

**Solution:**
1. Verify `~/.claude/settings.json` contains:
   ```json
   {
     "permissions": {
       "dangerouslySkipPermissions": true
     }
   }
   ```

2. **Fully restart Claude Code:**
   - In Cursor: `Cmd+Shift+P` → "Developer: Reload Window"
   - Or quit Cursor completely and reopen

---

### Issue 4: MCP Server Not Connected

**Symptom:**
```bash
claude mcp list
# Shows: chrome-devtools: ✗ Not Connected
```

**Cause:** MCP server crashed or failed to start

**Solution:**
```bash
# Check MCP server status
claude mcp list

# Restart all MCP servers
# Close and reopen Cursor IDE

# Or manually restart specific server
# (Done automatically by Cursor on next use)
```

---

### Issue 5: Dev Server Not Running

**Symptom:** Screenshots show blank page or connection refused

**Cause:** localhost:3000 dev server isn't running

**Solution:**
```bash
# Check if dev server is running
lsof -ti:3000

# If nothing returned, start dev server
cd /Users/chrisschofield/workspace/active/totalaud.io
pnpm dev
```

---

## ✅ Quick Health Check

Run this to verify everything is working:

```bash
# 1. Check MCP servers
claude mcp list

# Expected output:
# ✓ chrome-devtools: Connected
# ✓ puppeteer: Connected

# 2. Check dev server
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

# Expected output: 200

# 3. Check settings
cat ~/.claude/settings.json | grep dangerouslySkipPermissions

# Expected output: "dangerouslySkipPermissions": true
```

---

## 🔄 Complete Reset (Nuclear Option)

If nothing else works:

```bash
# 1. Kill all Chrome processes
pkill -f chrome

# 2. Clear Chrome DevTools cache
rm -rf ~/.cache/chrome-devtools-mcp

# 3. Restart Cursor completely
# Quit Cursor (Cmd+Q)
# Reopen Cursor

# 4. Verify MCP servers reconnect
claude mcp list
```

---

## 📋 Best Practices

### Starting a Development Session

1. **Start dev server first:**
   ```bash
   pnpm dev
   ```

2. **Open Cursor IDE**
   - MCP servers auto-connect

3. **Verify connection:**
   ```bash
   claude mcp list
   ```

4. **Start coding!**
   - Chrome DevTools MCP works automatically

### During Development

- ✅ Keep dev server running (`pnpm dev`)
- ✅ Don't manually open Chrome to localhost:3000
- ✅ Let MCP manage the browser instance
- ✅ If MCP browser closes, it auto-restarts on next tool use

### When Switching Projects

- Close Cursor before switching projects
- MCP servers clean up automatically
- Reopen in new project directory

---

## 🎯 Expected Workflow (No Issues)

```
You: "Take a screenshot of localhost:3000"
    ↓
Claude Code:
  - Uses mcp__chrome-devtools__take_screenshot
  - No permission prompt (auto-approved)
  - Screenshot saved
  - Shows you the result
    ↓
Result: Screenshot displayed, no manual clicking
```

**If this doesn't happen:** See solutions above

---

## 📞 Debug Commands

```bash
# Check what's using port 3000
lsof -ti:3000

# Check Chrome processes
ps aux | grep chrome

# Check Chrome DevTools MCP processes
ps aux | grep chrome-devtools-mcp

# View Claude settings
cat ~/.claude/settings.json

# Check MCP server logs (if available)
# Location varies, check Cursor console
```

---

## 🧠 Understanding the Setup

```
Your Dev Server (pnpm dev)
    ↓
localhost:3000
    ↑
Chrome Browser (managed by MCP)
    ↑
Chrome DevTools MCP Server
    ↑
Claude Code (in Cursor)
    ↑
You (zero clicking)
```

**Each piece must be working for the full workflow to succeed.**

---

## 📚 Related Documentation

- [MCP_AUTO_APPROVAL_SETUP.md](MCP_AUTO_APPROVAL_SETUP.md) - Auto-approval configuration
- [VISUAL_CONTEXT_WORKFLOW.md](VISUAL_CONTEXT_WORKFLOW.md) - How to use visual context
- [CLAUDE.md](CLAUDE.md) - Complete project configuration

---

**Last Updated**: October 2025
**Status**: Living document (update as issues arise)
