import { consoler } from 'yourails_common'
import { getGems } from 'yourails_node'

/**
 * @run npx tsx tools/printGems.ts
 */
if (require.main === module) {
  const output = getGems()
  consoler('printGems [8]', output)
}
