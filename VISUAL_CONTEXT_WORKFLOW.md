# Visual Context Workflow - Chrome DevTools MCP

## ✅ Setup Complete!

You now have **TWO** MCP servers for different purposes:

1. **Chrome DevTools MCP** - Visual context during development ✨
2. **Puppeteer MCP** - Background automation tasks 🤖

---

## 🎯 Chrome DevTools MCP - Visual Context

**Purpose:** Let Claude Code **SEE** what it's building in real-time

### What It Does

- **Screenshots of localhost** - See your app as Claude builds it
- **DOM snapshots** - Inspect structure + CSS
- **Performance traces** - Analyze page performance
- **Console logs** - Debug JavaScript errors
- **Network inspection** - Check API requests

### How It Works

1. **You start dev server**: `pnpm dev` (runs on `localhost:3000`)
2. **You ask Claude**: "Take a screenshot of the homepage"
3. **Claude sees it**: Visual feedback of what was built
4. **Claude fixes issues**: "The header is misaligned, let me fix it"

---

## 🚀 Example Workflows

### Workflow 1: Building a Component

**You:** "Add a new MissionPanel component to the Flow Studio"

**Claude:**
1. Writes the component code
2. **Takes screenshot** of `localhost:3000/flow-studio`
3. Sees the visual result
4. Adjusts styling based on what it sees
5. **Takes another screenshot** to confirm

**Result:** Pixel-perfect component on first try

---

### Workflow 2: Fixing UI Bugs

**You:** "The agent spawn modal isn't centered"

**Claude:**
1. **Takes screenshot** - Sees the modal is off-center
2. Inspects DOM snapshot - Finds `transform: translate(-50%, -40%)`
3. Changes to `transform: translate(-50%, -50%)`
4. **Takes screenshot** - Confirms it's centered
5. Done!

**Result:** Visual confirmation at every step

---

### Workflow 3: Performance Debugging

**You:** "Why is the Flow Studio slow?"

**Claude:**
1. **Records performance trace**
2. Analyzes: "React is re-rendering 30 times/second"
3. Adds `React.memo()` to expensive components
4. **Records new trace** - Confirms improvement
5. Shows before/after metrics

**Result:** Data-driven performance optimization

---

## 🔧 Available MCP Tools

### Chrome DevTools MCP Tools

```typescript
// Take screenshot of any URL
mcp__chrome_devtools__take_screenshot({
  url: 'http://localhost:3000'
})

// Get DOM snapshot with CSS
mcp__chrome_devtools__take_snapshot({
  url: 'http://localhost:3000'
})

// Record performance trace
mcp__chrome_devtools__record_trace({
  url: 'http://localhost:3000',
  duration: 5000  // 5 seconds
})

// Get console logs
mcp__chrome_devtools__get_console_logs({
  url: 'http://localhost:3000'
})

// Inspect network requests
mcp__chrome_devtools__get_network_activity({
  url: 'http://localhost:3000'
})
```

---

## 🤖 Puppeteer MCP - Background Automation

**Purpose:** Automate tasks that don't need visual feedback

### What It Does

- **Web scraping** - Extract data from websites
- **Form automation** - Fill and submit forms
- **Login workflows** - Automate authentication
- **Dialog handling** - Auto-accept alerts/confirms
- **Data extraction** - Scrape contact information

### Example Uses

```typescript
// Navigate with auto-dialog handling
await mcp__puppeteer__puppeteer_navigate({
  url: 'https://bbc.co.uk/radio1/contacts'
})

// Extract all emails
await mcp__puppeteer__puppeteer_evaluate({
  script: `
    const emails = document.body.innerText.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}/gi);
    return emails || [];
  `
})
```

---

## 📊 When To Use Which?

| Task | Use This | Why |
|------|----------|-----|
| Building UI components | **Chrome DevTools** | Visual feedback needed |
| Debugging CSS issues | **Chrome DevTools** | See the page visually |
| Performance analysis | **Chrome DevTools** | Built-in profiling |
| Scraping radio contacts | **Puppeteer** | No visual needed |
| Automating logins | **Puppeteer** | Background task |
| Extracting playlist data | **Puppeteer** | Data extraction |

---

## ✨ The Effortless Workflow

### Old Way (Blind Coding)
1. Claude writes code
2. You run `pnpm dev`
3. You check browser
4. You tell Claude what's wrong
5. Claude guesses a fix
6. Repeat 10 times 😩

### New Way (Visual Context)
1. Claude writes code
2. Claude takes screenshot
3. Claude SEES what's wrong
4. Claude fixes it immediately
5. Claude confirms with screenshot
6. Done in 1 iteration ✨

---

## 🎬 Next Steps

### After Restart (Required for MCP tools to be available)

1. **Restart Claude Code** - Reload to activate Chrome DevTools MCP
2. **Start dev server** - `pnpm dev`
3. **Test it** - "Take a screenshot of localhost:3000"

### Then Try These:

**Visual UI Building:**
> "Show me what the GlobalCommandPalette looks like on the page"

**Performance Debugging:**
> "Analyze the performance of the Flow Studio page"

**Console Debugging:**
> "Check if there are any JavaScript errors on localhost:3000"

**Network Inspection:**
> "Show me all the API requests being made on the dashboard"

---

## 🎯 Bottom Line

**Chrome DevTools MCP** = Claude can SEE what it's building (screenshots, DOM, performance)
**Puppeteer MCP** = Claude can AUTOMATE background tasks (scraping, forms, logins)

**Together** = The perfect development workflow! 🚀

---

## 📝 Configuration Files

### MCP Configuration
Location: `~/.claude.json` (project-specific)

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"]
    },
    "puppeteer": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

### Verify Status
```bash
claude mcp list

# Should show:
# ✓ chrome-devtools: npx chrome-devtools-mcp@latest - Connected
# ✓ puppeteer: npx @modelcontextprotocol/server-puppeteer - Connected
```

---

**Status**: ✅ Setup Complete - Restart Claude Code to activate!
