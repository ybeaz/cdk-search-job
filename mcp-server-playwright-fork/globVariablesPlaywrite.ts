import { nanoid } from 'nanoid'
import playwright from 'playwright'
import { getDateString } from 'yourails_common'

type Session = {
  browser: playwright.Browser
  context: playwright.BrowserContext
  page: playwright.Page
  createdAt: number
}

type ToolNamesType = Record<string, string>

let toolNames: ToolNamesType = {}
  ; (function (toolNames) {
    toolNames['BrowserNavigate'] = 'browser_navigate'
    toolNames['BrowserScreenshot'] = 'browser_screenshot'
    toolNames['BrowserClick'] = 'browser_click'
    toolNames['BrowserClickText'] = 'browser_click_text'
    toolNames['BrowserFill'] = 'browser_fill'
    toolNames['BrowserSelect'] = 'browser_select'
    toolNames['BrowserSelectText'] = 'browser_select_text'
    toolNames['BrowserHover'] = 'browser_hover'
    toolNames['BrowserHoverText'] = 'browser_hover_text'
    toolNames['BrowserEvaluate'] = 'browser_evaluate'
    toolNames['BrowserReset'] = 'browser_reset'
  })(toolNames || (toolNames = {}))

const sessions = new Map<string, Session>()

const dateStringForLogFile = getDateString({
  timestamp: new Date(),
  dash: true,
  hours: true,
  minutes: true,
  seconds: true,
  isUtcMethods: false,
})
const sessionId = `sess_${dateStringForLogFile}_${nanoid(8)}`

const screenshots = new Map()
const consoleLogs = []

export type { Session, ToolNamesType }
export { screenshots, sessions, sessionId, consoleLogs, toolNames }
