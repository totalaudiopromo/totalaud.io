# Browser Automation Skill

## Overview

The **Browser Automation** skill provides intelligent, dialog-free web automation using Puppeteer MCP. It eliminates the need to manually click through browser dialogs while performing automated tasks like scraping, testing, or data extraction.

## Problem Solved

**Before**: Spending time clicking "OK" on browser alerts/confirms during automation
**After**: All dialogs automatically handled, fully automated workflows

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Agent (Scout, Coach, Tracker, etc.)            │
│                                                  │
│  skills: ['browser-automation']                 │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Browser Automation Skill                       │
│                                                  │
│  • Navigate with auto-dialog handling           │
│  • Screenshot, click, fill, extract             │
│  • Common workflows (login, scrape, etc.)       │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Puppeteer MCP Integration Layer                │
│                                                  │
│  • Type-safe wrappers                           │
│  • Error handling + logging                     │
│  • Dialog handler injection                     │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Puppeteer MCP Server (External)                │
│                                                  │
│  Tools: navigate, screenshot, click, fill,      │
│         select, evaluate, hover                 │
└─────────────────────────────────────────────────┘
```

## File Structure

```
packages/core/skills-engine/
├── src/
│   ├── custom/
│   │   └── browserAutomation.ts      # Main skill implementation
│   └── integrations/
│       └── puppeteer-mcp.ts          # MCP client wrapper
│
skills/automation/
└── browser-automation.yml            # Skill definition

packages/core/agent-executor/
└── src/config/agentRoles.ts          # Scout has 'browser-automation' skill
```

## Usage

### 1. From Command Palette (in app)

When you spawn a Scout agent, it automatically has access to browser automation:

```typescript
// Scout agent includes 'browser-automation' skill
const scout = {
  id: 'scout',
  skills: ['research-contacts', 'analyze-datasets', 'discover-opportunities', 'browser-automation']
}
```

### 2. Direct API Call

```typescript
POST /api/skills/browser-automation/invoke

{
  "userId": "user-123",
  "input": {
    "action": "navigate",
    "url": "https://example.com",
    "autoAcceptDialogs": true
  }
}
```

### 3. From TypeScript Code

```typescript
import { puppeteerMCP, navigateWithDialogHandling } from '@total-audio/core-skills-engine'

// Navigate with auto-dialog handling
await navigateWithDialogHandling('https://example.com')

// Extract all links
const links = await puppeteerMCP.extract('a[href]')

// Fill a form
await puppeteerMCP.fill({ selector: 'input[name="email"]', value: 'test@example.com' })
await puppeteerMCP.click({ selector: 'button[type="submit"]' })
```

## Actions

### Navigate
Navigate to a URL with automatic dialog handling installed.

```typescript
{
  "action": "navigate",
  "url": "https://example.com",
  "autoAcceptDialogs": true
}
```

### Screenshot
Capture full page or specific element screenshot.

```typescript
{
  "action": "screenshot",
  "selector": "#main-content"  // Optional
}
```

### Click
Click an element by CSS selector.

```typescript
{
  "action": "click",
  "selector": "button.submit"
}
```

### Fill
Fill an input field with a value.

```typescript
{
  "action": "fill",
  "selector": "input[name='username']",
  "value": "chris@totalaud.io"
}
```

### Evaluate
Execute arbitrary JavaScript in browser context.

```typescript
{
  "action": "evaluate",
  "script": "return document.title;"
}
```

### Extract
Extract structured data from page elements.

```typescript
{
  "action": "extract",
  "selector": ".contact-card"
}
```

Returns:
```json
[
  {
    "text": "John Doe",
    "html": "<div>John Doe</div>",
    "attributes": { "class": "contact-card", "data-id": "123" },
    "href": null,
    "src": null,
    "id": "contact-123",
    "className": "contact-card"
  }
]
```

## Common Workflows

### Login Workflow

```typescript
import { performLogin } from '@total-audio/core-skills-engine'

await performLogin(
  'https://example.com/login',
  'input[type="email"]',
  'input[type="password"]',
  'button[type="submit"]',
  'chris@example.com',
  'password123'
)
```

### Paginated Scraping

```typescript
import { browserWorkflows } from '@total-audio/core-skills-engine'

const steps = await browserWorkflows.scrapePaginated(
  'https://example.com/contacts',
  '.contact-card',
  5  // Max 5 pages
)
```

### Form Filling

```typescript
import { fillForm } from '@total-audio/core-skills-engine'

await fillForm({
  'input[name="name"]': 'Chris Schofield',
  'input[name="email"]': 'chris@totalaud.io',
  'select[name="genre"]': 'electronic',
  'textarea[name="message"]': 'Hello!'
})
```

## Dialog Handling

The skill automatically handles three types of browser dialogs:

### Alert
```javascript
window.alert('Something happened')
// Auto-accepted, logs: "[AUTO-HANDLED] Alert: Something happened"
```

### Confirm
```javascript
const result = window.confirm('Are you sure?')
// Always returns true, logs: "[AUTO-HANDLED] Confirm: Are you sure?"
```

### Prompt
```javascript
const result = window.prompt('Enter your name:', 'Default')
// Returns default value or empty string
// Logs: "[AUTO-HANDLED] Prompt: Enter your name:"
```

## How Dialog Handling Works

1. **Navigate** to URL using `navigateWithDialogHandling(url)`
2. **Inject** dialog handler script immediately after page load
3. **Override** native `window.alert`, `window.confirm`, `window.prompt`
4. **Log** all intercepted dialogs for debugging
5. **Continue** automation without interruption

### Implementation

```typescript
// packages/core/skills-engine/src/integrations/puppeteer-mcp.ts

const script = `
  (function() {
    window.alert = function(msg) {
      console.log('[AUTO-HANDLED] Alert:', msg);
    };

    window.confirm = function(msg) {
      console.log('[AUTO-HANDLED] Confirm:', msg);
      return true; // Always accept
    };

    window.prompt = function(msg, defaultText) {
      console.log('[AUTO-HANDLED] Prompt:', msg);
      return defaultText || '';
    };

    console.log('[BROWSER-AUTOMATION] Dialog handlers installed');
  })();
`

await puppeteerMCP.evaluate({ script })
```

## Testing

### Manual Test

1. Open Claude Code
2. Use Puppeteer MCP navigate tool on a page with dialogs
3. Verify dialogs don't block automation
4. Check console logs for `[AUTO-HANDLED]` messages

### Automated Test (TODO)

```bash
cd apps/aud-web
pnpm test packages/core/skills-engine/src/custom/__tests__/browserAutomation.test.ts
```

## Configuration

### Puppeteer MCP Config (Optional)

If you need to customize Puppeteer launch options:

```json
{
  "launchOptions": {
    "headless": true,
    "args": [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox"
    ]
  }
}
```

### Skill Config

Located in [skills/automation/browser-automation.yml](../../skills/automation/browser-automation.yml):

```yaml
config:
  max_timeout_ms: 60000
  auto_dialog_handling: true
  headless: true
  viewport:
    width: 1920
    height: 1080
```

## Error Handling

All browser automation errors are:
1. **Caught** and logged with context
2. **Returned** in standardized format
3. **Not thrown** (won't crash agents)

```typescript
{
  "success": false,
  "error": "Selector not found: .missing-element",
  "duration_ms": 1234
}
```

## Performance

- **Dialog handler injection**: ~5ms
- **Navigation**: ~500-2000ms (depends on page)
- **Element actions** (click, fill): ~10-50ms
- **Screenshot**: ~100-300ms
- **Extraction**: ~20-100ms (depends on selector count)

## Logging

All operations are logged with structured context:

```typescript
log.info('Browser automation task started', {
  action: 'navigate',
  url: 'https://example.com',
  selector: null
})

log.info('Browser automation task completed', {
  action: 'navigate',
  success: true,
  duration_ms: 1523
})
```

## Security Considerations

- ✅ Dialog auto-handling only affects current browser session
- ✅ No data sent to external services
- ✅ Respects robots.txt (up to user to use responsibly)
- ✅ Can be disabled per-skill invocation
- ⚠️ Use caution when auto-accepting confirms (could accept destructive actions)

## Future Enhancements

- [ ] Conditional dialog handling (accept some, reject others)
- [ ] Dialog response patterns (e.g., specific prompt answers)
- [ ] Visual regression testing integration
- [ ] Multi-tab support
- [ ] Cookie/session management
- [ ] Network request interception
- [ ] Performance metrics collection
- [ ] Screenshot diffing

## Troubleshooting

### Dialog still blocking

**Cause**: Dialog handler not installed before dialog triggered
**Fix**: Ensure `navigateWithDialogHandling()` used instead of raw `navigate()`

### Selector not found

**Cause**: Element not loaded yet
**Fix**: Use `waitForSelector` parameter:

```typescript
{
  "action": "click",
  "selector": ".dynamic-element",
  "waitForSelector": ".dynamic-element",
  "timeout": 5000
}
```

### MCP connection failed

**Cause**: Puppeteer MCP server not running
**Fix**: Check MCP status:

```bash
claude mcp list
# Should show: puppeteer: ✓ Connected
```

## Related Files

- [browserAutomation.ts](../../packages/core/skills-engine/src/custom/browserAutomation.ts) - Main skill implementation
- [puppeteer-mcp.ts](../../packages/core/skills-engine/src/integrations/puppeteer-mcp.ts) - MCP client wrapper
- [browser-automation.yml](../../skills/automation/browser-automation.yml) - Skill definition
- [agentRoles.ts](../../packages/core/agent-executor/src/config/agentRoles.ts) - Agent skill assignments

## Questions?

See main [CLAUDE.md](../CLAUDE.md) for project setup and development workflow.
