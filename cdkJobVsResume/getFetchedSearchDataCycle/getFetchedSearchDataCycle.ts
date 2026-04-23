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

import {
  getFetchedSearchData,
  GetFetchedSearchDataParamsType,
} from '../getFetchedSearchData/getFetchedSearchData'

// @ts-ignore
import googleReturn from './__output__/2026-04-21-19-57-08_wd.json'
// @ts-ignore
import credentials from '../__credentials__/myworkdayjobs.json'
// @ts-ignore
import archive from './__output__/archive.json'

type GetFetchedSearchDataCycleParamsType = {
  engine: string
  query: string
  pageNumStart: string | number
  pagesNumToFetch: string | number
}

type GetFetchedSearchDataCycleOptionsType = { funcParent?: string }

type GetFetchedSearchDataCycleResType = any[]

interface GetFetchedSearchDataCycleType {
  (
    params: GetFetchedSearchDataCycleParamsType,
    options?: GetFetchedSearchDataCycleOptionsType
  ): Promise<GetFetchedSearchDataCycleResType>
}

const optionsDefault = {
  funcParent: 'getFetchedSearchDataCycle',
} satisfies Required<GetFetchedSearchDataCycleOptionsType>

/**
 * @description Function to getFetchedSearchDataCycle
 * @import import { getFetchedSearchDataCycle } from './getFetchedSearchDataCycle'
 */

const getFetchedSearchDataCycleUnsafe: GetFetchedSearchDataCycleType = async (
  {
    engine,
    query,
    pageNumStart: pageNumStartIn,
    pagesNumToFetch: pagesNumToFetchIn,
  }: GetFetchedSearchDataCycleParamsType,
  options: GetFetchedSearchDataCycleOptionsType = optionsDefault
): Promise<GetFetchedSearchDataCycleResType> => {
  const dateString = getDateString({
    timestamp: new Date(),
    dash: true,
    hours: true,
    minutes: true,
    seconds: true,
    isUtcMethods: false,
  })

  const pagesNumToFetch = String(pagesNumToFetchIn)
  const pageNumStart = String(pageNumStartIn)

  let output: any[] = []

  let pageCurrent = parseInt(pageNumStart, 10)
  const pageFinish = parseInt(pagesNumToFetch, 10) + parseInt(pageNumStart, 10)

  while (pageCurrent <= pageFinish) {
    const getFetchedSearchDataParams: GetFetchedSearchDataParamsType = {
      dateString,
      engine,
      query,
      pageNumStart: pageCurrent,
    }

    output = (await getFetchedSearchData(
      getFetchedSearchDataParams
    )) as GetFetchedSearchDataCycleResType

    pageCurrent += 1
  }

  return output
}

const resDefault: GetFetchedSearchDataCycleResType = []

const getFetchedSearchDataCycle = withTryCatchFinallyWrapper<
  GetFetchedSearchDataCycleParamsType,
  GetFetchedSearchDataCycleOptionsType
>(getFetchedSearchDataCycleUnsafe, {
  optionsDefault,
  resDefault,
  funcMode: FuncModeEnumType.common,
  isFinally: false,
})

export { getFetchedSearchDataCycle }
export type {
  GetFetchedSearchDataCycleParamsType,
  GetFetchedSearchDataCycleResType,
  GetFetchedSearchDataCycleOptionsType,
  GetFetchedSearchDataCycleType,
}

/**
 * @description Here the file is being run directly
 * @run npx tsx cdkJobVsResume/getFetchedSearchDataCycle/getFetchedSearchDataCycle.ts
 */
if (require.main === module) {
  ;(async () => {
    type ExampleType = {
      description?: string
      params: GetFetchedSearchDataCycleParamsType
      options: GetFetchedSearchDataCycleOptionsType
      expected: GetFetchedSearchDataCycleResType
    }
    const examples: ExampleType[] = [
      {
        description: 'fetch in cycle',
        params: {
          engine: 'google',
          query: 'site:myworkdayjobs.com react node remote',
          pageNumStart: 4,
          pagesNumToFetch: 3,
        },
        options: {},
        expected: resDefault,
      },
    ]

    const promises = examples.map(async (example: ExampleType, index: number) => {
      const { description, params, options, expected } = example

      const output = await getFetchedSearchDataCycle(params, options)
      consoler(`getFetchedSearchDataCycle [150-${index}]`, {
        description,
        params,
        output,
      })
    })
    await Promise.all(promises)
  })()
}
