import { join } from 'path'
import fs from 'fs'
import { chromium } from 'playwright'
import { serverPlaywrite } from './serverPlaywrite'
import type { Session } from './globVariablesPlaywrite'

async function createSessionFactory(
  { sessionID }: { sessionID?: string } = { sessionID: undefined }
): Promise<Session> {
  const filePath = join(process.cwd(), '..', '__sessions__', `${sessionID}.json`)

  const browser = await chromium.launch({
    headless: false,
    // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
    args: [
      // '--disable-extensions',
      // `--user-data-dir=/tmp/playwright-${Date.now()}`,
      // '--disable-background-networking',
      // '--disable-background-timer-throttling',
      // '--disable-renderer-backgrounding',
      // '--disable-dev-shm-usage',
      // '--no-first-run',
      // '--no-default-browser-check'
      // Optional: add any Chromium flags you want here
      // '--user-data-dir=~/chrome-debug-profile'
      // '--remote-debugging-port=9222', '--user-data-dir=~/chrome-debug-profile'
      // '--start-maximized',
      // '--disable-extensions',
    ],
  })
  const context = await browser.newContext({
    storageState: fs.existsSync(filePath) ? filePath : undefined,
  })
  const page = await context.newPage()

  page.on('console', msg => {
    serverPlaywrite.notification({
      method: 'notifications/resources/updated',
      params: { uri: 'console://logs' },
    })
  })

  return {
    browser,
    context,
    page,
    createdAt: Date.now(),
  }
}

export { createSessionFactory }
