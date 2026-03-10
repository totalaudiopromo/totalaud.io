/**
 * Puppeteer MCP Integration
 *
 * Helper utilities for interacting with Puppeteer MCP server
 * Provides type-safe wrappers and automatic dialog handling
 */

// Simple console logger (replace with proper logger when available)
const log = {
  info: (msg: string, data?: any) => console.log('[PuppeteerMCP]', msg, data || ''),
  debug: (msg: string, data?: any) => console.debug('[PuppeteerMCP]', msg, data || ''),
  error: (msg: string, error: Error, data?: any) =>
    console.error('[PuppeteerMCP]', msg, error, data || ''),
}

export interface PuppeteerNavigateOptions {
  url: string
  allowDangerous?: boolean
  launchOptions?: {
    headless?: boolean
    args?: string[]
  }
}

export interface PuppeteerScreenshotOptions {
  name: string
  selector?: string
  width?: number
  height?: number
  encoded?: boolean
}

export interface PuppeteerClickOptions {
  selector: string
}

export interface PuppeteerFillOptions {
  selector: string
  value: string
}

export interface PuppeteerSelectOptions {
  selector: string
  value: string
}

export interface PuppeteerEvaluateOptions {
  script: string
}

/**
 * Puppeteer MCP Client
 * Wraps MCP tool calls with error handling and logging
 */
export class PuppeteerMCPClient {
  private dialogHandlerInstalled = false

  /**
   * Navigate to URL with optional dialog auto-handling
   */
  async navigate(options: PuppeteerNavigateOptions): Promise<void> {
    log.info('Navigating to URL', { url: options.url })

    try {
      // Note: This requires MCP tools to be available in the runtime context
      // In a browser/Node.js environment, this would be called via the MCP client
      const globalWithMCP = globalThis as any
      if (typeof globalWithMCP.mcp__puppeteer__puppeteer_navigate === 'function') {
        await globalWithMCP.mcp__puppeteer__puppeteer_navigate({
          url: options.url,
          allowDangerous: options.allowDangerous,
          launchOptions: options.launchOptions,
        })
      } else {
        throw new Error('Puppeteer MCP tool not available in this runtime')
      }

      log.debug('Navigation completed', { url: options.url })
    } catch (error) {
      log.error('Navigation failed', error as Error, { url: options.url })
      throw error
    }
  }

  /**
   * Install dialog auto-handler on current page
   * This prevents dialog popups from blocking automation
   */
  async installDialogHandler(): Promise<void> {
    if (this.dialogHandlerInstalled) {
      log.debug('Dialog handler already installed')
      return
    }

    const script = `
      // Override native dialog functions to auto-accept
      (function() {
        const originalAlert = window.alert;
        const originalConfirm = window.confirm;
        const originalPrompt = window.prompt;

        window.alert = function(msg) {
          console.log('[AUTO-HANDLED] Alert:', msg);
          // Alert has no return value
        };

        window.confirm = function(msg) {
          console.log('[AUTO-HANDLED] Confirm:', msg);
          return true; // Always accept
        };

        window.prompt = function(msg, defaultText) {
          console.log('[AUTO-HANDLED] Prompt:', msg);
          return defaultText || ''; // Return default or empty string
        };

        console.log('[BROWSER-AUTOMATION] Dialog handlers installed');
      })();
    `

    try {
      await this.evaluate({ script })
      this.dialogHandlerInstalled = true
      log.info('Dialog auto-handler installed')
    } catch (error) {
      log.error('Failed to install dialog handler', error as Error)
      throw error
    }
  }

  /**
   * Take screenshot of page or specific element
   */
  async screenshot(options: PuppeteerScreenshotOptions): Promise<string> {
    log.debug('Taking screenshot', { name: options.name, selector: options.selector })

    try {
      const globalWithMCP = globalThis as any
      if (typeof globalWithMCP.mcp__puppeteer__puppeteer_screenshot === 'function') {
        const result = await globalWithMCP.mcp__puppeteer__puppeteer_screenshot({
          name: options.name,
          selector: options.selector,
          width: options.width,
          height: options.height,
          encoded: options.encoded,
        })
        return result
      } else {
        throw new Error('Puppeteer MCP screenshot tool not available in this runtime')
      }
    } catch (error) {
      log.error('Screenshot failed', error as Error, { name: options.name })
      throw error
    }
  }

  /**
   * Click element by selector
   */
  async click(options: PuppeteerClickOptions): Promise<void> {
    log.debug('Clicking element', { selector: options.selector })

    try {
      const globalWithMCP = globalThis as any
      if (typeof globalWithMCP.mcp__puppeteer__puppeteer_click === 'function') {
        await globalWithMCP.mcp__puppeteer__puppeteer_click({
          selector: options.selector,
        })
      } else {
        throw new Error('Puppeteer MCP click tool not available in this runtime')
      }

      log.debug('Click completed', { selector: options.selector })
    } catch (error) {
      log.error('Click failed', error as Error, { selector: options.selector })
      throw error
    }
  }

  /**
   * Fill input field with value
   */
  async fill(options: PuppeteerFillOptions): Promise<void> {
    log.debug('Filling input', { selector: options.selector })

    try {
      const globalWithMCP = globalThis as any
      if (typeof globalWithMCP.mcp__puppeteer__puppeteer_fill === 'function') {
        await globalWithMCP.mcp__puppeteer__puppeteer_fill({
          selector: options.selector,
          value: options.value,
        })
      } else {
        throw new Error('Puppeteer MCP fill tool not available in this runtime')
      }

      log.debug('Fill completed', { selector: options.selector })
    } catch (error) {
      log.error('Fill failed', error as Error, { selector: options.selector })
      throw error
    }
  }

  /**
   * Select dropdown option
   */
  async select(options: PuppeteerSelectOptions): Promise<void> {
    log.debug('Selecting option', { selector: options.selector, value: options.value })

    try {
      const globalWithMCP = globalThis as any
      if (typeof globalWithMCP.mcp__puppeteer__puppeteer_select === 'function') {
        await globalWithMCP.mcp__puppeteer__puppeteer_select({
          selector: options.selector,
          value: options.value,
        })
      } else {
        throw new Error('Puppeteer MCP select tool not available in this runtime')
      }

      log.debug('Select completed', { selector: options.selector })
    } catch (error) {
      log.error('Select failed', error as Error, { selector: options.selector })
      throw error
    }
  }

  /**
   * Execute JavaScript in browser context
   */
  async evaluate(options: PuppeteerEvaluateOptions): Promise<any> {
    log.debug('Evaluating script', { scriptLength: options.script.length })

    try {
      const globalWithMCP = globalThis as any
      if (typeof globalWithMCP.mcp__puppeteer__puppeteer_evaluate === 'function') {
        const result = await globalWithMCP.mcp__puppeteer__puppeteer_evaluate({
          script: options.script,
        })
        return result
      } else {
        throw new Error('Puppeteer MCP evaluate tool not available in this runtime')
      }
    } catch (error) {
      log.error('Evaluate failed', error as Error)
      throw error
    }
  }

  /**
   * Extract data from page using selector and optional transformation
   */
  async extract(selector: string, _transform?: (element: any) => any): Promise<any[]> {
    log.debug('Extracting data', { selector })

    const script = `
      const elements = document.querySelectorAll('${selector}');
      return Array.from(elements).map(el => ({
        text: el.textContent?.trim(),
        html: el.innerHTML,
        attributes: Array.from(el.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {}),
        href: el.href || null,
        src: el.src || null,
        id: el.id || null,
        className: el.className || null
      }));
    `

    try {
      const results = await this.evaluate({ script })
      log.info('Data extracted', { selector, count: results?.length || 0 })
      return results || []
    } catch (error) {
      log.error('Extract failed', error as Error, { selector })
      throw error
    }
  }

  /**
   * Wait for selector to appear in DOM
   */
  async waitForSelector(selector: string, timeout = 30000): Promise<void> {
    log.debug('Waiting for selector', { selector, timeout })

    const script = `
      new Promise((resolve, reject) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
          const element = document.querySelector('${selector}');
          if (element) {
            clearInterval(interval);
            resolve(true);
          } else if (Date.now() - startTime > ${timeout}) {
            clearInterval(interval);
            reject(new Error('Timeout waiting for selector: ${selector}'));
          }
        }, 100);
      });
    `

    try {
      await this.evaluate({ script })
      log.debug('Selector found', { selector })
    } catch (error) {
      log.error('Wait for selector failed', error as Error, { selector })
      throw error
    }
  }
}

/**
 * Singleton instance for convenience
 */
export const puppeteerMCP = new PuppeteerMCPClient()

/**
 * Helper: Navigate with automatic dialog handling
 */
export async function navigateWithDialogHandling(url: string): Promise<void> {
  await puppeteerMCP.navigate({ url })
  await puppeteerMCP.installDialogHandler()
  log.info('Navigation with dialog handling complete', { url })
}

/**
 * Helper: Extract all links from page
 */
export async function extractLinks(selector = 'a[href]'): Promise<string[]> {
  const elements = await puppeteerMCP.extract(selector)
  return elements.map((el: any) => el.href).filter(Boolean)
}

/**
 * Helper: Extract all text content
 */
export async function extractText(selector: string): Promise<string[]> {
  const elements = await puppeteerMCP.extract(selector)
  return elements.map((el: any) => el.text).filter(Boolean)
}

/**
 * Helper: Fill form with multiple fields
 */
export async function fillForm(fields: Record<string, string>): Promise<void> {
  log.info('Filling form', { fieldCount: Object.keys(fields).length })

  for (const [selector, value] of Object.entries(fields)) {
    await puppeteerMCP.fill({ selector, value })
  }

  log.info('Form filled successfully')
}

/**
 * Helper: Login workflow with auto-dialog handling
 */
export async function performLogin(
  loginUrl: string,
  usernameSelector: string,
  passwordSelector: string,
  submitSelector: string,
  username: string,
  password: string
): Promise<void> {
  log.info('Performing login', { loginUrl })

  await navigateWithDialogHandling(loginUrl)
  await puppeteerMCP.fill({ selector: usernameSelector, value: username })
  await puppeteerMCP.fill({ selector: passwordSelector, value: password })
  await puppeteerMCP.click({ selector: submitSelector })

  log.info('Login completed')
}
