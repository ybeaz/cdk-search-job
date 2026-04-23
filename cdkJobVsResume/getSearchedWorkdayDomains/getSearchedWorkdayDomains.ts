import { join } from 'path'
import { consoler } from 'yourails_common'
import {
  withTryCatchFinallyWrapper,
  FuncModeEnumType,
  WithTryCatchFinallyWrapperOptionsType,
} from 'yourails_common'
import '../../env'
import { getWrittenJsonFile } from 'yourails_node'
import { getEnsuredDirectory } from 'yourails_node'
import { getDateString } from 'yourails_common'
import { getParsedUrl, GetParsedUrlResType } from 'yourails_common'

// @ts-ignore
import googleReturn from './__output__/2026-04-21-19-57-08_wd.json'
// @ts-ignore
import credentials from '../__credentials__/myworkdayjobs.json'
// @ts-ignore
import archive from './__output__/archive.json'

type GetSearchedWorkdayDomainsParamsType = { query: string; pageNumStart: string | number }

type GetSearchedWorkdayDomainsOptionsType = { funcParent?: string }

type GetSearchedWorkdayDomainsResType = Promise<Record<string, any>>

interface GetSearchedWorkdayDomainsType {
  (
    params: GetSearchedWorkdayDomainsParamsType,
    options?: GetSearchedWorkdayDomainsOptionsType
  ): GetSearchedWorkdayDomainsResType
}

const optionsDefault = {
  funcParent: 'getSearchedWorkdayDomains',
} satisfies Required<GetSearchedWorkdayDomainsOptionsType>

/**
 * @description Function to getSearchedWorkdayDomains
 * @import import { getSearchedWorkdayDomains } from './getSearchedWorkdayDomains'
 */

const getSearchedWorkdayDomainsUnsafe: GetSearchedWorkdayDomainsType = async (
  { query, pageNumStart }: GetSearchedWorkdayDomainsParamsType,
  options: GetSearchedWorkdayDomainsOptionsType = optionsDefault
): GetSearchedWorkdayDomainsResType => {
  const SERPAPI_KEY = process.env.SERPAPI_KEY

  if (!SERPAPI_KEY) {
    throw new Error('Missing SERPAPI_KEY in environment variables')
  }

  const dateStringFileStyle = getDateString({
    timestamp: new Date(),
    dash: true,
    hours: true,
    minutes: true,
    seconds: true,
    isUtcMethods: false,
  })

  const url = new URL('https://serpapi.com/search')

  url.searchParams.set('api_key', SERPAPI_KEY)
  url.searchParams.set('engine', 'google')
  url.searchParams.set('q', query)
  url.searchParams.set('start', String(pageNumStart))

  const res = await fetch(url.toString())
  const data = await res.json()
  // const data = googleReturn

  const urls = data.organic_results.map((r: any) => r.link)

  const output = urls
    .filter((url: string) => url.includes('myworkdayjobs.com') || url.includes('.wd'))
    .map((item: string) => {
      const res: GetParsedUrlResType = getParsedUrl({ input: item }) as GetParsedUrlResType
      const { origin, hostname, nameFull, nameFirstSub, pathname } = res

      const credentailsFound = credentials.find((item: any) => item.origin === origin)
      const archiveFound = (archive as any[]).find(
        (item: any) => item.origin === origin && item.pathname === pathname
      )

      const text = item
        .replace(/\?.*$/, '')
        .replace(/\/apply(\/.*)?$/, '')
        .replace(/-{2,}/g, '-')
        .split('/')
        .slice(-1)
        .join('')
        .split('-')
        .join(' ')

      return {
        data: dateStringFileStyle,
        ...(archiveFound ? { isInArchive: true } : { isInArchive: false }),
        nameFirstSub,
        text,
        // nameFull,
        // hostname,
        origin,
        pathname,
        autofillWithResume: `${item.replace(/\?.*$/, '').replace(/\/apply(\/.*)?$/, '')}/apply/autofillWithResume`,
        ...(credentailsFound
          ? { login: credentailsFound.login, password: credentailsFound.password }
          : { login: 't3531350@yahoo.com', password: '' }),
      }
    })

  consoler('getSearchedWorkdayDomains [55]', { data })

  await getEnsuredDirectory({ path: join(__dirname, '__output__') })

  await getWrittenJsonFile({
    baseDir: __dirname,
    filePathParts: ['__output__', `${dateStringFileStyle}_wd.json`],
    data: output,
  })

  return output
}

const resDefault: GetSearchedWorkdayDomainsResType = Promise.resolve([])

const getSearchedWorkdayDomains = withTryCatchFinallyWrapper<
  GetSearchedWorkdayDomainsParamsType,
  GetSearchedWorkdayDomainsOptionsType
>(getSearchedWorkdayDomainsUnsafe, {
  optionsDefault,
  resDefault,
  funcMode: FuncModeEnumType.common,
  isFinally: false,
})

export { getSearchedWorkdayDomains }
export type {
  GetSearchedWorkdayDomainsParamsType,
  GetSearchedWorkdayDomainsResType,
  GetSearchedWorkdayDomainsOptionsType,
  GetSearchedWorkdayDomainsType,
}

/**
 * @description Here the file is being run directly
 * @run npx tsx cdkJobVsResume/getSearchedWorkdayDomains/getSearchedWorkdayDomains.ts
 */
if (require.main === module) {
  ;(async () => {
    type ExampleType = {
      description?: string
      params: GetSearchedWorkdayDomainsParamsType
      options: GetSearchedWorkdayDomainsOptionsType
      expected: GetSearchedWorkdayDomainsResType
    }
    const examples: ExampleType[] = [
      {
        description: '',
        params: { query: 'site:myworkdayjobs.com react node remote', pageNumStart: 1 },
        options: {},
        expected: resDefault,
      },
    ]

    const promises = examples.map(async (example: ExampleType, index: number) => {
      const { description, params, options, expected } = example

      const output = await getSearchedWorkdayDomains(params, options)
      consoler(`getSearchedWorkdayDomains [61-${index}]`, {
        description,
        params,
        expected,
        output,
        // tested: JSON.stringify(output) === JSON.stringify(expected),
      })
    })
    await Promise.all(promises)
  })()
}
