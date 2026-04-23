#!/usr/bin/env node
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import os from 'os'
import path from 'path'
import { promises as fs } from 'fs'
import { consoler } from 'yourails_common'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
// @ts-expect-error
import { screenshots, sessionId, consoleLogs } from './globVariablesPlaywrite'

import { serverPlaywrite } from './serverPlaywrite'
import { TOOLS, handleToolCall } from './handleToolCall'

// Setup request handlers
serverPlaywrite.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'console://logs',
      mimeType: 'text/plain',
      name: 'Browser console logs',
    },
    ...Array.from(screenshots.keys()).map(name => ({
      uri: `screenshot://${name}`,
      mimeType: 'image/png',
      name: `Screenshot: ${name}`,
    })),
  ],
}))
serverPlaywrite.setRequestHandler(ReadResourceRequestSchema, async request => {
  const uri = request.params.uri.toString()
  if (uri === 'console://logs') {
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          // @ts-expect-error
          text: consoleLogs.join('\n'),
        },
      ],
    }
  }
  if (uri.startsWith('screenshot://')) {
    const name = uri.split('://')[1]
    const screenshot = screenshots.get(name)
    if (screenshot) {
      return {
        contents: [
          {
            uri,
            mimeType: 'image/png',
            blob: screenshot,
          },
        ],
      }
    }
  }
  throw new Error(`Resource not found: ${uri}`)
})
async function runServer() {
  const transport = new StdioServerTransport()
  await serverPlaywrite.connect(transport)
  serverPlaywrite.setRequestHandler(ListToolsRequestSchema, async () => {
    /* For debugging consoler('mcp-server-playwright-fork [70] ListToolsRequest received', {}) */
    return {
      tools: TOOLS,
    }
  })
  serverPlaywrite.setRequestHandler(CallToolRequestSchema, async request => {
    /* For debugging consoler('mcp-server-playwright-fork [75] ListToolsRequest received', {
      'request.params.name': request.params.name,
      'request.params.arguments': request.params.arguments,
    }) */
    return handleToolCall(request.params.name, request.params.arguments ?? {})
  })
}

// async function checkPlatformAndInstall() {
//   const platform = os.platform()
//   if (platform === 'win32') {
//     console.log('Installing MCP Playwright Server for Windows...')
//     try {
//       const configFilePath = path.join(
//         os.homedir(),
//         'AppData',
//         'Roaming',
//         'Claude',
//         'claude_desktop_config.json'
//       )
//       let config
//       try {
//         // Try to read existing config file
//         const fileContent = await fs.readFile(configFilePath, 'utf-8')
//         config = JSON.parse(fileContent)
//       } catch (error) {
//         if (error.code === 'ENOENT') {
//           // Create new config file with mcpServers object
//           config = { mcpServers: {} }
//           await fs.writeFile(configFilePath, JSON.stringify(config, null, 2), 'utf-8')
//           console.log('Created new Claude config file')
//         } else {
//           console.error('Error reading Claude config file:', error)
//           process.exit(1)
//         }
//       }
//       // Ensure mcpServers exists
//       if (!config.mcpServers) {
//         config.mcpServers = {}
//       }
//       // Update the playwright configuration
//       config.mcpServers.playwright = {
//         command: 'npx',
//         args: ['-y', '@automatalabs/mcp-server-playwright'],
//       }
//       // Write the updated config back to file
//       await fs.writeFile(configFilePath, JSON.stringify(config, null, 2), 'utf-8')
//       console.log('✓ Successfully updated Claude configuration')
//     } catch (error) {
//       console.error('Error during installation:', error)
//       process.exit(1)
//     }
//   } else if (platform === 'darwin') {
//     console.log('Installing MCP Playwright Server for macOS...')
//     try {
//       const configFilePath = path.join(
//         os.homedir(),
//         'Library',
//         'Application Support',
//         'Claude',
//         'claude_desktop_config.json'
//       )
//       let config
//       try {
//         // Try to read existing config file
//         const fileContent = await fs.readFile(configFilePath, 'utf-8')
//         config = JSON.parse(fileContent)
//       } catch (error) {
//         if (error.code === 'ENOENT') {
//           // Create new config file with mcpServers object
//           config = { mcpServers: {} }
//           await fs.writeFile(configFilePath, JSON.stringify(config, null, 2), 'utf-8')
//           console.log('Created new Claude config file')
//         } else {
//           console.error('Error reading Claude config file:', error)
//           process.exit(1)
//         }
//       }
//       // Ensure mcpServers exists
//       if (!config.mcpServers) {
//         config.mcpServers = {}
//       }
//       // Update the playwright configuration
//       config.mcpServers.playwright = {
//         command: 'npx',
//         args: ['-y', '@automatalabs/mcp-server-playwright'],
//       }
//       // Write the updated config back to file
//       await fs.writeFile(configFilePath, JSON.stringify(config, null, 2), 'utf-8')
//       console.log('✓ Successfully updated Claude configuration')
//     } catch (error) {
//       console.error('Error during installation:', error)
//       process.exit(1)
//     }
//   } else {
//     console.error('Unsupported platform:', platform)
//     process.exit(1)
//   }
// }

;(async () => {
  try {
    // Parse args but continue with server if no command specified
    await yargs(hideBin(process.argv))
      .command(
        'install',
        'Install MCP-Server-Playwright dependencies',
        () => {},
        async () => {
          /* await checkPlatformAndInstall() */
          // Exit after successful installation
          process.exit(0)
        }
      )
      .strict()
      .help()
      .parse()
    // If we get here, no command was specified, so run the server
    await runServer().catch(console.error)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
})()
