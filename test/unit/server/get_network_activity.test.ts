import assert from 'assert'
import { handleToolCall } from '../../../src/server-core.js'

async function run() {
  const result = await handleToolCall('get_network_activity', {})
  const payload = JSON.parse(result.content[0].text)

  assert.strictEqual(payload.error.tool, 'get_network_activity')
  assert.match(payload.error.message, /Missing or invalid string argument: platform/)

  console.log('get_network_activity argument tests passed')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
