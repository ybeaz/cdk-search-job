import { persistSession } from './persistSession'
import { Page, BrowserContext } from 'playwright'
import { toolNames } from './globVariablesPlaywrite'
import type { ToolNamesType } from './globVariablesPlaywrite'
import { consoler } from 'yourails_common'

const PERSIST_TOOLS = new Set([
  toolNames.BrowserNavigate,
  toolNames.BrowserFill,
  toolNames.BrowserSelect,
])

const isPersistingSession = (handlerName: string) => PERSIST_TOOLS.has(handlerName)

const withPersistentSessioRunning = (handler: any, handlerName: string) => {
  return async (args: any, page: Page, context: BrowserContext, sessionID: string) => {
    const result = await handler(args, page, context, sessionID)

    try {
      if (isPersistingSession(handlerName)) {
        await persistSession({ context, sessionID })
      }
    } catch (error: any) {
      console.warn('withPersistentSession [22] Failed to persist session:', error)
    }

    return result
  }
}

export { withPersistentSessioRunning }

/**
 * @description Here the file is being run directly
 * @run npx tsx src/modules/mcpServer/mcp-server-playwright-fork/withPersistentSessioRunning.ts
 * @test yarn jest getTemplateFunc.test.ts --coverage --collectCoverageFrom="src/modules/mcpServer/mcp-server-playwright-fork/withPersistentSessioRunning.ts"
 */
if (require.main === module) {
  ;(async () => {})()
}
