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
import { isDirectoryFile, isDirectoryFileUnsafe } from 'yourails_node'
import { getReadJsonFile } from 'yourails_node'

// @ts-ignore
import googleReturn from './__output__/2026-04-21-19-57-08_wd.json'
// @ts-ignore
import credentials from '../__credentials__/myworkdayjobs.json'
// @ts-ignore
import archive from '../__output__/archive_wd.json'

type GetFetchedSearchDataParamsType = {
  dateString: string
  engine: string
  getParams: {
    q: string
    gl: string
    cr: string
    hl: string
  }
  pageNumStart: string | number
}

type GetFetchedSearchDataOptionsType = { funcParent?: string }

type GetFetchedSearchDataResType = any[]

interface GetFetchedSearchDataType {
  (
    params: GetFetchedSearchDataParamsType,
    options?: GetFetchedSearchDataOptionsType
  ): Promise<GetFetchedSearchDataResType>
}

const optionsDefault = {
  funcParent: 'getFetchedSearchData',
} satisfies Required<GetFetchedSearchDataOptionsType>

/**
 * @description Function to getFetchedSearchData
 * @import import { getFetchedSearchData } from './getFetchedSearchData'
 */

const getFetchedSearchDataUnsafe: GetFetchedSearchDataType = async (
  { dateString, engine, getParams, pageNumStart }: GetFetchedSearchDataParamsType,
  options: GetFetchedSearchDataOptionsType = optionsDefault
): Promise<GetFetchedSearchDataResType> => {
  const filePath = join(__dirname, '..', '__output__', `${dateString}_wd.json`)

  let output: GetFetchedSearchDataResType = []

  const isDirectoryFileRes = isDirectoryFile({ path: filePath })

  if (isDirectoryFileRes.isFile) {
    output = await getReadJsonFile(String(filePath))
  }

  const SERPAPI_KEY: string = process.env.SERPAPI_KEY || ''

  if (!SERPAPI_KEY) {
    throw new Error('Missing SERPAPI_KEY in environment variables')
  }

  const url = new URL('https://serpapi.com/search')

  url.searchParams.set('api_key', SERPAPI_KEY)
  url.searchParams.set('engine', engine)

  Object.entries(getParams).forEach(([key, value]: [string, string]) => {
    url.searchParams.set(key, value)
  })
  url.searchParams.set('start', String(pageNumStart))

  const res = await fetch(url.toString())
  const data = await res.json()
  // const data = googleReturn

  const urls = data.organic_results.map((r: any) => r.link)

  let outputNext: GetFetchedSearchDataResType = urls
    .filter((url: string) => url.includes('myworkdayjobs.com') || url.includes('.wd'))
    .map((item: string) => {
      const res: GetParsedUrlResType = getParsedUrl({ input: item }) as GetParsedUrlResType
      const { origin, hostname, nameFull, nameFirstSub, pathname } = res

      const credentailsFound = credentials.find((item: any) => item.origin === origin)

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
        page: pageNumStart,
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
        data: dateString,
      }
    })
    .filter(({ origin, pathname }: any) => {
      const archiveFound = (archive as any[]).find(
        (item: any) => item.origin === origin && item.pathname === pathname
      )
      return !archiveFound
    })

  output = [...output, ...outputNext]

  await getEnsuredDirectory({ path: join(__dirname, '..', '__output__') })

  await getWrittenJsonFile({
    baseDir: __dirname,
    filePathParts: ['..', '__output__', `${dateString}_wd.json`],
    data: output,
  })

  return output
}

const resDefault: GetFetchedSearchDataResType = []

const getFetchedSearchData = withTryCatchFinallyWrapper<
  GetFetchedSearchDataParamsType,
  GetFetchedSearchDataOptionsType
>(getFetchedSearchDataUnsafe, {
  optionsDefault,
  resDefault,
  funcMode: FuncModeEnumType.common,
  isFinally: false,
})

export { getFetchedSearchData }
export type {
  GetFetchedSearchDataParamsType,
  GetFetchedSearchDataResType,
  GetFetchedSearchDataOptionsType,
  GetFetchedSearchDataType,
}

/**
 * @description Here the file is being run directly
 * @run npx tsx cdkJobVsResume/getFetchedSearchData/getFetchedSearchData.ts
 */
if (require.main === module) {
  ;(async () => {
    type ExampleType = {
      description?: string
      params: GetFetchedSearchDataParamsType
      options: GetFetchedSearchDataOptionsType
      expected: GetFetchedSearchDataResType
    }

    const dateString = getDateString({
      timestamp: new Date(),
      dash: true,
      hours: true,
      minutes: true,
      seconds: true,
      isUtcMethods: false,
    })

    const examples: ExampleType[] = [
      {
        description: 'sigle fetch',
        params: {
          dateString, // : '2026-04-22-20-06-58',
          engine: 'google',
          getParams: {
            q: 'site:myworkdayjobs.com%20inurl:remote%20react%20node%20jobs', // ? inurl:remote
            gl: 'us',
            cr: 'countryUS',
            hl: 'en',
          },
          pageNumStart: 1,
        },
        options: {},
        expected: resDefault,
      },
    ]

    const promises = examples.map(async (example: ExampleType, index: number) => {
      const { description, params, options, expected } = example

      const output = await getFetchedSearchData(params, options)
      consoler(`getFetchedSearchData [200-${index}]`, {
        description,
        params,
        expected,
        output,
      })
    })
    await Promise.all(promises)
  })()
}
