import assert from 'assert'
import { handleToolCall } from '../../../src/server-core.js'
import { ToolsObserve } from '../../../src/observe/index.js'

async function run() {
  const originalStartLogStreamHandler = (ToolsObserve as any).startLogStreamHandler

  try {
    let captured: any = null
    ;(ToolsObserve as any).startLogStreamHandler = async (args: any) => {
      captured = args
      return { sessionId: 'session-1', started: true }
    }

    const result = await handleToolCall('start_log_stream', { packageName: 'com.example.app' })
    const payload = JSON.parse(result.content[0].text)

    assert.deepStrictEqual(captured, {
      platform: 'android',
      packageName: 'com.example.app',
      level: 'error',
      sessionId: undefined,
      deviceId: undefined
    })
    assert.strictEqual(payload.sessionId, 'session-1')
    assert.strictEqual(payload.started, true)

    console.log('start_log_stream default tests passed')
  } finally {
    ;(ToolsObserve as any).startLogStreamHandler = originalStartLogStreamHandler
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
