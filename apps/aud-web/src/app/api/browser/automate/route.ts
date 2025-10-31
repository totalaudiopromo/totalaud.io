import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Browser Automation API
 *
 * This API acts as a bridge between your app and Claude Code's MCP Puppeteer access.
 * When called, it executes browser automation tasks using the Puppeteer MCP server.
 *
 * Key Feature: Auto-handles browser dialogs (alerts, confirms, prompts)
 * so you never have to manually click "Yes" during automation.
 */

const automationSchema = z.object({
  action: z.enum(['navigate', 'screenshot', 'click', 'fill', 'evaluate', 'extract']),
  url: z.string().url().optional(),
  selector: z.string().optional(),
  value: z.string().optional(),
  script: z.string().optional(),
  autoAcceptDialogs: z.boolean().default(true),
})

type AutomationRequest = z.infer<typeof automationSchema>

/**
 * Dialog auto-handler script
 * Overrides window.alert, window.confirm, window.prompt to auto-accept
 */
const DIALOG_HANDLER_SCRIPT = `
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
  return 'Dialog handlers installed';
})();
`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const params = automationSchema.parse(body)

    console.log('[BrowserAutomation] Executing:', params.action)

    let result: any = { success: false }

    switch (params.action) {
      case 'navigate':
        if (!params.url) {
          return NextResponse.json({ error: 'URL required for navigate' }, { status: 400 })
        }

        // Navigate to URL
        await (globalThis as any).mcp__puppeteer__puppeteer_navigate({ url: params.url })

        // Auto-install dialog handler if requested
        if (params.autoAcceptDialogs) {
          await (globalThis as any).mcp__puppeteer__puppeteer_evaluate({
            script: DIALOG_HANDLER_SCRIPT,
          })
        }

        result = {
          success: true,
          url: params.url,
          dialogHandlerInstalled: params.autoAcceptDialogs,
        }
        break

      case 'screenshot':
        const screenshot = await (globalThis as any).mcp__puppeteer__puppeteer_screenshot({
          name: `screenshot-${Date.now()}`,
          selector: params.selector,
          encoded: true,
          width: 1920,
          height: 1080,
        })
        result = { success: true, screenshot }
        break

      case 'click':
        if (!params.selector) {
          return NextResponse.json({ error: 'Selector required for click' }, { status: 400 })
        }
        await (globalThis as any).mcp__puppeteer__puppeteer_click({ selector: params.selector })
        result = { success: true, clicked: params.selector }
        break

      case 'fill':
        if (!params.selector || !params.value) {
          return NextResponse.json(
            { error: 'Selector and value required for fill' },
            { status: 400 }
          )
        }
        await (globalThis as any).mcp__puppeteer__puppeteer_fill({
          selector: params.selector,
          value: params.value,
        })
        result = { success: true, filled: params.selector, value: params.value }
        break

      case 'evaluate':
        if (!params.script) {
          return NextResponse.json({ error: 'Script required for evaluate' }, { status: 400 })
        }
        const evalResult = await (globalThis as any).mcp__puppeteer__puppeteer_evaluate({
          script: params.script,
        })
        result = { success: true, result: evalResult }
        break

      case 'extract':
        if (!params.selector) {
          return NextResponse.json({ error: 'Selector required for extract' }, { status: 400 })
        }
        const extractScript = `
          const elements = document.querySelectorAll('${params.selector}');
          return Array.from(elements).map(el => ({
            text: el.textContent?.trim(),
            html: el.innerHTML,
            href: el.href || null,
            src: el.src || null,
            id: el.id || null,
            className: el.className || null
          }));
        `
        const extracted = await (globalThis as any).mcp__puppeteer__puppeteer_evaluate({
          script: extractScript,
        })
        result = { success: true, data: extracted }
        break

      default:
        return NextResponse.json({ error: `Unknown action: ${params.action}` }, { status: 400 })
    }

    console.log('[BrowserAutomation] Success:', params.action)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[BrowserAutomation] Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
