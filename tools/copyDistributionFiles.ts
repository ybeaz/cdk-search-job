import { dirname } from 'path'
import { getCopiedFileSync } from 'yourails_node'
import { getEnsuredDirectory } from 'yourails_node'
import { copyArr } from './config'

/**
 * @run npx tsx tools/copyDistributionFiles.ts
 */
if (require.main === module) {
  ;(async () => {
    copyArr.length &&
      copyArr.forEach(async (item: any) => {
        if ('src' in item && 'dest' in item) {
          const dir = dirname(item['dest'])
          await getEnsuredDirectory({ path: dir })
          getCopiedFileSync({ src: item['src'], dest: item['dest'] })
        }
      })
  })()
}
