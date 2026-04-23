import { Page, BrowserContext } from 'playwright'
import { consoler } from 'yourails_common'
import { ensureBrowser } from './ensureBrowser'
import {
  screenshots,
  sessions,
  sessionId as sessionIdIn,
  toolNames,
} from './globVariablesPlaywrite'
import { withStrictModeFallback } from './withStrictModeFallback'
import { withPersistentSessioRunning } from './withPersistentSessioRunning'

const TOOLS = [
  {
    name: toolNames.BrowserNavigate,
    description: 'Navigate to a URL',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
      },
      required: ['url'],
    },
  },
  {
    name: toolNames.BrowserScreenshot,
    description: 'Take a screenshot of the current page or a specific element',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name for the screenshot' },
        selector: { type: 'string', description: 'CSS selector for element to screenshot' },
        fullPage: {
          type: 'boolean',
          description: 'Take a full page screenshot (default: false)',
          default: false,
        },
      },
      required: ['name'],
    },
  },
  {
    name: toolNames.BrowserClick,
    description: 'Click an element on the page using CSS selector',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector for element to click' },
      },
      required: ['selector'],
    },
  },
  {
    name: toolNames.BrowserClickText,
    description: 'Click an element on the page by its text content',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text content of the element to click' },
      },
      required: ['text'],
    },
  },
  {
    name: toolNames.BrowserFill,
    description: 'Fill out an input field',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector for input field' },
        value: { type: 'string', description: 'Value to fill' },
      },
      required: ['selector', 'value'],
    },
  },
  {
    name: toolNames.BrowserSelect,
    description: 'Select an element on the page with Select tag using CSS selector',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector for element to select' },
        value: { type: 'string', description: 'Value to select' },
      },
      required: ['selector', 'value'],
    },
  },
  {
    name: toolNames.BrowserSelectText,
    description: 'Select an element on the page with Select tag by its text content',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text content of the element to select' },
        value: { type: 'string', description: 'Value to select' },
      },
      required: ['text', 'value'],
    },
  },
  {
    name: toolNames.BrowserHover,
    description: 'Hover an element on the page using CSS selector',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector for element to hover' },
      },
      required: ['selector'],
    },
  },
  {
    name: toolNames.BrowserHoverText,
    description: 'Hover an element on the page by its text content',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text content of the element to hover' },
      },
      required: ['text'],
    },
  },
  {
    name: toolNames.BrowserEvaluate,
    description: 'Execute JavaScript in the browser console',
    inputSchema: {
      type: 'object',
      properties: {
        script: { type: 'string', description: 'JavaScript code to execute' },
      },
      required: ['script'],
    },
  },
  {
    name: toolNames.BrowserReset,
    description: 'Reset the browswer to start with the blank page',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
]

const success = (text: string, extra: any[] = []) => ({
  content: [{ type: 'text', text }, ...extra],
  isError: false,
})

const failure = (text: string) => ({
  content: [{ type: 'text', text }],
  isError: true,
})

const getLocator = ({ page, selector }: { page: Page; selector: string }, retry: boolean) => {
  const loc = page.locator(selector)
  return retry ? loc.first() : loc
}

const getTextLocator = ({ page, text }: { page: Page; text: string }, retry: boolean) => {
  const loc = page.getByText(text)
  return retry ? loc.first() : loc
}

const toolHandlers: Record<
  string,
  (args: any, page: Page, context: BrowserContext, sessionId: string) => Promise<any>
> = {
  [toolNames.BrowserNavigate]: async (args, page) => {
    await page.goto(args.url, { timeout: 15000, waitUntil: 'domcontentloaded' })
    console.log('handleToolCall [170]', { args })
    return success(`Navigated to ${args.url}`)
  },

  [toolNames.BrowserScreenshot]: async (args, page) => {
    const fullPage = Boolean(args.fullPage)
    const buffer = args.selector
      ? await page.locator(args.selector).screenshot()
      : await page.screenshot({ fullPage })

    const base64 = buffer.toString('base64')
    if (!base64) {
      return failure(args.selector ? `Element not found: ${args.selector}` : 'Screenshot failed')
    }

    screenshots.set(args.name, base64)

    return success(`Screenshot '${args.name}' taken`, [
      { type: 'image', data: base64, mimeType: 'image/png' },
    ])
  },

  [toolNames.BrowserClick]: async (args, page) => {
    await withStrictModeFallback(retry =>
      getLocator({ page, selector: args.selector }, retry).click()
    )
    return success(`Clicked: ${args.selector}`)
  },

  [toolNames.BrowserClickText]: async (args, page) => {
    await withStrictModeFallback(retry => getTextLocator({ page, text: args.text }, retry).click())
    return success(`Clicked element with text: ${args.text}`)
  },

  [toolNames.BrowserFill]: async (args, page) => {
    await withStrictModeFallback(retry =>
      getLocator({ page, selector: args.selector }, retry).pressSequentially(args.value, {
        delay: 100,
      })
    )
    return success(`Filled ${args.selector} with: ${args.value}`)
  },

  [toolNames.BrowserSelect]: async (args, page) => {
    await withStrictModeFallback(retry =>
      getLocator({ page, selector: args.selector }, retry).selectOption(args.value)
    )
    return success(`Selected ${args.selector} with: ${args.value}`)
  },

  [toolNames.BrowserSelectText]: async (args, page) => {
    await withStrictModeFallback(retry =>
      getTextLocator({ page, text: args.text }, retry).selectOption(args.value)
    )
    return success(`Selected element with text ${args.text} with value: ${args.value}`)
  },

  [toolNames.BrowserHover]: async (args, page) => {
    await withStrictModeFallback(retry =>
      getLocator({ page, selector: args.selector }, retry).hover()
    )
    return success(`Hovered ${args.selector}`)
  },

  [toolNames.BrowserHoverText]: async (args, page) => {
    await withStrictModeFallback(retry => getTextLocator({ page, text: args.text }, retry).hover())
    return success(`Hovered element with text: ${args.text}`)
  },

  [toolNames.BrowserEvaluate]: async (args, page) => {
    const result = await page.evaluate(script => {
      const logs: string[] = []
      const original = { ...console }

      ;['log', 'info', 'warn', 'error'].forEach(method => {
        // @ts-expect-error
        console[method] = (...args: any[]) => {
          logs.push(`[${method}] ${args.join(' ')}`)
          // @ts-expect-error
          original[method](...args)
        }
      })

      try {
        const fn = Function('"use strict"; return (' + script + ')')
        const value = fn()
        Object.assign(console, original)
        return { value, logs }
      } catch (e: any) {
        Object.assign(console, original)
        return { __error: e.message, logs }
      }
    }, args.script)

    if ((result as any).__error) {
      return failure(`Script failed: ${(result as any).__error}`)
    }

    return success(
      `Execution result:\n${JSON.stringify((result as any).value, null, 2)}\n\nConsole output:\n${(
        result as any
      ).logs.join('\n')}`
    )
  },

  [toolNames.BrowserReset]: async (_args, _page, context, sessionId) => {
    await context?.close()
    sessions.delete(sessionId)
    return success('Browser reset')
  },
}

// --- main handler ---
async function handleToolCall(name: string, args: any) {
  const sessionIdArgs = args?.sessionID
  const { sessionID, page, context } = await ensureBrowser(sessionIdArgs || sessionIdIn)
  const handler = toolHandlers[name]

  if (!handler) return failure(`Unknown tool: ${name}`)

  try {
    const handlerWrapped = withPersistentSessioRunning(handler, name)

    // @ts-expect-error
    return handlerWrapped(args, page, context, sessionID)
    // return await handler(args, page, context, sessionId)
  } catch (error: any) {
    return failure(`Error: ${error.message}`)
  }
}

export { toolNames, TOOLS, handleToolCall }
