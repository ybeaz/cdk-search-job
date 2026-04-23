import { Server } from '@modelcontextprotocol/sdk/server/index.js'

const serverPlaywrite = new Server(
  {
    name: 'automatalabs/playwright',
    version: '0.1.0',
    requestTimeout: 300000,
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
)

export { serverPlaywrite }
