import assert from 'assert'
import { handleToolCall } from '../../../src/server-core.js'

async function run() {
  const result = await handleToolCall('capture_screenshot', {})
  const payload = JSON.parse(result.content[0].text)

  assert.strictEqual(payload.error.tool, 'capture_screenshot')
  assert.match(payload.error.message, /Missing or invalid string argument: platform/)

  console.log('capture_screenshot argument tests passed')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
