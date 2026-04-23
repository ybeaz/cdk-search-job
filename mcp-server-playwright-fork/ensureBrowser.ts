import { nanoid } from 'nanoid'
import type { Session } from './globVariablesPlaywrite'
import { sessions } from './globVariablesPlaywrite'
import { getDateString } from 'yourails_common'
import { createSessionFactory } from './createSessionFactory'

const ensureBrowser = async (sessionID?: string): Promise<{ sessionID?: string } & Session> => {
  const dateStringForLogFile = getDateString({
    timestamp: new Date(),
    dash: true,
    hours: true,
    minutes: true,
    seconds: true,
    isUtcMethods: false,
  })
  const id = sessionID ?? `sess_${dateStringForLogFile}_${nanoid(8)}`

  if (!sessions.has(id)) {
    const session = await createSessionFactory({ sessionID: id })
    sessions.set(id, session)
  }

  return {
    sessionID: id,
    ...sessions.get(sessionID || ''),
  } as { sessionID?: string } & Session
}

export { ensureBrowser }
