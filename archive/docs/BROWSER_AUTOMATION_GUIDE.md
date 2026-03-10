# Browser Automation Guide - Effortless Workflow

## The Effortless Way ✨

**You don't need to write code or call APIs.**

Just tell Claude Code what you want automated, and I'll do it for you using Puppeteer MCP.

---

## How It Works

1. **You say**: "Navigate to BBC Radio 1's website and extract all the presenter names"
2. **I do it**: Using Puppeteer MCP tools
3. **Auto-dialog handling**: All alerts/confirms/prompts are automatically accepted
4. **Zero manual clicking**: You never have to click "Yes" on dialogs

---

## Example Workflows

### Example 1: Research Radio Contacts

**You say**:
> "Go to BBC Radio 1's contact page and extract all the email addresses"

**I do**:
```typescript
// 1. Navigate with auto-dialog handling
await mcp__puppeteer__puppeteer_navigate({ url: 'https://bbc.co.uk/radio1/contacts' })

// 2. Install dialog auto-handler
await mcp__puppeteer__puppeteer_evaluate({ script: DIALOG_HANDLER_SCRIPT })

// 3. Extract emails
await mcp__puppeteer__puppeteer_evaluate({
  script: `
    const emails = document.body.innerText.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}/gi);
    return emails || [];
  `
})
```

**You get**: List of all email addresses, no manual clicking required

---

### Example 2: Login to Platform

**You say**:
> "Log in to my SubmitHub account"

**I do**:
```typescript
// 1. Navigate
await mcp__puppeteer__puppeteer_navigate({ url: 'https://submithub.com/login' })

// 2. Auto-handle dialogs
await mcp__puppeteer__puppeteer_evaluate({ script: DIALOG_HANDLER_SCRIPT })

// 3. Fill login form
await mcp__puppeteer__puppeteer_fill({
  selector: 'input[type="email"]',
  value: 'your@email.com'
})
await mcp__puppeteer__puppeteer_fill({
  selector: 'input[type="password"]',
  value: 'your-password'
})

// 4. Click submit
await mcp__puppeteer__puppeteer_click({ selector: 'button[type="submit"]' })
```

**You get**: Logged in automatically, no dialog popups

---

### Example 3: Scrape Playlist Curators

**You say**:
> "Find all the Spotify playlist curator names on this page"

**I do**:
```typescript
// 1. Navigate
await mcp__puppeteer__puppeteer_navigate({ url: 'https://example.com/curators' })

// 2. Auto-handle dialogs
await mcp__puppeteer__puppeteer_evaluate({ script: DIALOG_HANDLER_SCRIPT })

// 3. Extract curator data
await mcp__puppeteer__puppeteer_evaluate({
  script: `
    const curators = document.querySelectorAll('.curator-name');
    return Array.from(curators).map(el => ({
      name: el.textContent?.trim(),
      followers: el.dataset.followers,
      genres: el.dataset.genres?.split(',')
    }));
  `
})
```

**You get**: Structured curator data, ready to use

---

## Auto-Dialog Handling Script

This script is automatically injected when you ask me to navigate:

```javascript
window.alert = function(msg) {
  console.log('[AUTO-HANDLED] Alert:', msg);
  // No popup shown
};

window.confirm = function(msg) {
  console.log('[AUTO-HANDLED] Confirm:', msg);
  return true; // Always accepts
};

window.prompt = function(msg, defaultText) {
  console.log('[AUTO-HANDLED] Prompt:', msg);
  return defaultText || '';
};
```

**Result**: All dialogs are logged but never shown to you. Zero interruptions.

---

## What You Can Ask For

### Navigation
- "Go to [URL]"
- "Navigate to [website]"
- "Open [page]"

### Data Extraction
- "Extract all links from this page"
- "Get all the email addresses"
- "Find all product prices"
- "Scrape the playlist names"

### Form Automation
- "Fill in the contact form with [data]"
- "Submit this form"
- "Click the submit button"

### Screenshots
- "Take a screenshot of this page"
- "Capture the header section"
- "Screenshot the pricing table"

### Complex Workflows
- "Login to [platform] and extract my messages"
- "Search for [term] and scrape the first 10 results"
- "Navigate through each page and collect all the data"

---

## The Bottom Line

**You**: Tell me what you want automated

**Me**: Execute it using Puppeteer MCP with auto-dialog handling

**You**: Get the results, no manual clicking required

That's it. Effortless. ✨

---

## Technical Details (Optional)

If you want to understand how it works:

- **MCP Server**: Puppeteer MCP (`@modelcontextprotocol/server-puppeteer`)
- **Connection Status**: ✓ Connected (verified via `claude mcp list`)
- **Tools Available**: navigate, screenshot, click, fill, select, evaluate, hover
- **Dialog Handling**: JavaScript injection via `puppeteer_evaluate`
- **Runtime**: Claude Code environment (has direct MCP access)

Your skills-engine code is ready to use this, but the effortless way is just to ask me directly!
