/**
 * Browser Automation Skill
 *
 * Wraps Puppeteer MCP tools with intelligent dialog handling,
 * navigation patterns, and common automation workflows.
 *
 * Purpose: Eliminate manual dialog clicking and provide reusable
 * browser automation patterns for all agents.
 */

import type { SkillExecutionContext, SkillExecutionResult } from '../types'
import {
  puppeteerMCP,
  navigateWithDialogHandling,
  extractLinks,
  extractText,
  fillForm,
} from '../integrations/puppeteer-mcp'

// Simple console logger (replace with proper logger when available)
const log = {
  info: (msg: string, data?: any) => console.log('[BrowserAutomation]', msg, data || ''),
  debug: (msg: string, data?: any) => console.debug('[BrowserAutomation]', msg, data || ''),
  error: (msg: string, error: Error, data?: any) =>
    console.error('[BrowserAutomation]', msg, error, data || ''),
}

export interface BrowserAutomationInput {
  action: 'navigate' | 'screenshot' | 'click' | 'fill' | 'evaluate' | 'extract'
  url?: string
  selector?: string
  value?: string
  script?: string
  autoAcceptDialogs?: boolean
  waitForSelector?: string
  timeout?: number
}

export interface BrowserAutomationOutput {
  success: boolean
  data?: any
  screenshot?: string
  error?: string
}

/**
 * Execute browser automation task using Puppeteer MCP
 */
export async function executeBrowserAutomation(
  context: SkillExecutionContext
): Promise<SkillExecutionResult> {
  const startTime = Date.now()
  const input = context.input as BrowserAutomationInput

  log.info('Browser automation task started', {
    action: input.action,
    url: input.url,
    selector: input.selector,
  })

  try {
    let output: BrowserAutomationOutput = { success: false }

    switch (input.action) {
      case 'navigate':
        output = await navigateWithDialogHandler(input)
        break

      case 'screenshot':
        output = await takeScreenshot(input)
        break

      case 'click':
        output = await clickElement(input)
        break

      case 'fill':
        output = await fillInput(input)
        break

      case 'evaluate':
        output = await evaluateScript(input)
        break

      case 'extract':
        output = await extractData(input)
        break

      default:
        throw new Error(`Unknown action: ${input.action}`)
    }

    const duration = Date.now() - startTime

    log.info('Browser automation task completed', {
      action: input.action,
      success: output.success,
      duration_ms: duration,
    })

    return {
      output: output as Record<string, any>,
      tokens_used: 0, // Browser automation doesn't use tokens
      cost_usd: 0,
      duration_ms: duration,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    log.error('Browser automation task failed', error as Error, {
      action: input.action,
      duration_ms: duration,
    })

    return {
      output: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      tokens_used: 0,
      cost_usd: 0,
      duration_ms: duration,
    }
  }
}

/**
 * Navigate to URL with automatic dialog handling
 */
async function navigateWithDialogHandler(
  input: BrowserAutomationInput
): Promise<BrowserAutomationOutput> {
  if (!input.url) {
    throw new Error('URL is required for navigate action')
  }

  log.debug('Navigating with dialog handling', { url: input.url })

  await navigateWithDialogHandling(input.url)

  return {
    success: true,
    data: { url: input.url, dialogHandlerInjected: true },
  }
}

/**
 * Take screenshot with optional element selector
 */
async function takeScreenshot(input: BrowserAutomationInput): Promise<BrowserAutomationOutput> {
  log.debug('Taking screenshot', { selector: input.selector })

  const screenshot = await puppeteerMCP.screenshot({
    name: `screenshot-${Date.now()}`,
    selector: input.selector,
    encoded: true,
  })

  return {
    success: true,
    screenshot,
  }
}

/**
 * Click element by selector
 */
async function clickElement(input: BrowserAutomationInput): Promise<BrowserAutomationOutput> {
  if (!input.selector) {
    throw new Error('Selector is required for click action')
  }

  log.debug('Clicking element', { selector: input.selector })

  await puppeteerMCP.click({ selector: input.selector })

  return {
    success: true,
    data: { clicked: input.selector },
  }
}

/**
 * Fill input field by selector
 */
async function fillInput(input: BrowserAutomationInput): Promise<BrowserAutomationOutput> {
  if (!input.selector || !input.value) {
    throw new Error('Selector and value are required for fill action')
  }

  log.debug('Filling input', { selector: input.selector })

  await puppeteerMCP.fill({ selector: input.selector, value: input.value })

  return {
    success: true,
    data: { filled: input.selector, value: input.value },
  }
}

/**
 * Evaluate JavaScript in browser context
 */
async function evaluateScript(input: BrowserAutomationInput): Promise<BrowserAutomationOutput> {
  if (!input.script) {
    throw new Error('Script is required for evaluate action')
  }

  log.debug('Evaluating script', { scriptLength: input.script.length })

  const result = await puppeteerMCP.evaluate({ script: input.script })

  return {
    success: true,
    data: { result },
  }
}

/**
 * Extract data from page using selector
 */
async function extractData(input: BrowserAutomationInput): Promise<BrowserAutomationOutput> {
  if (!input.selector) {
    throw new Error('Selector is required for extract action')
  }

  log.debug('Extracting data', { selector: input.selector })

  const extracted = await puppeteerMCP.extract(input.selector)

  return {
    success: true,
    data: { extracted },
  }
}

/**
 * Common automation workflows
 */
export const browserWorkflows = {
  /**
   * Login workflow with auto-dialog handling
   */
  async login(url: string, username: string, password: string) {
    const steps = [
      { action: 'navigate', url, autoAcceptDialogs: true },
      { action: 'fill', selector: 'input[type="email"]', value: username },
      { action: 'fill', selector: 'input[type="password"]', value: password },
      { action: 'click', selector: 'button[type="submit"]' },
    ]

    log.info('Executing login workflow', { url })
    return steps
  },

  /**
   * Scrape data with pagination
   */
  async scrapePaginated(baseUrl: string, selector: string, maxPages: number = 5) {
    const steps = []
    for (let i = 0; i < maxPages; i++) {
      steps.push(
        { action: 'navigate', url: `${baseUrl}?page=${i + 1}`, autoAcceptDialogs: true },
        { action: 'extract', selector }
      )
    }

    log.info('Executing paginated scrape workflow', { baseUrl, maxPages })
    return steps
  },

  /**
   * Form fill and submit
   */
  async fillForm(url: string, formData: Record<string, string>) {
    const steps: any[] = [{ action: 'navigate', url, autoAcceptDialogs: true }]

    for (const [selector, value] of Object.entries(formData)) {
      steps.push({ action: 'fill', selector, value })
    }

    steps.push({ action: 'click', selector: 'button[type="submit"]' })

    log.info('Executing form fill workflow', { url, fieldCount: Object.keys(formData).length })
    return steps
  },
}
