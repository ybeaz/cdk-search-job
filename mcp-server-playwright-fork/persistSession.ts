import fs from 'fs'
import path from 'path'
import { join } from 'path'
import { BrowserContext } from 'playwright'
import { consoler } from 'yourails_common'

const lastSaved = new Map<string, number>()

async function persistSession({
  context,
  sessionID,
}: {
  context: BrowserContext
  sessionID: string
}) {
  const now = Date.now()
  const last = lastSaved.get(sessionID) || 0

  if (now - last < 3000) return

  const filePath = join(process.cwd(), '..', '__sessions__', `${sessionID}.json`)

  try {
    await context.storageState({ path: filePath })
    lastSaved.set(sessionID, now)
  } catch (error) {
    console.warn('persistSession [40] failed:', error)
  }
}

export { persistSession }
