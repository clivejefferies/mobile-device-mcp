import assert from 'assert'
import { handleToolCall } from '../../../src/server-core.js'

async function run() {
  const result = await handleToolCall('get_ui_tree', {})
  const payload = JSON.parse(result.content[0].text)

  assert.strictEqual(payload.error.tool, 'get_ui_tree')
  assert.match(payload.error.message, /Missing or invalid string argument: platform/)

  console.log('get_ui_tree argument tests passed')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
